'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { API_BASE, apiFetch, apiUpload, attachmentUrl } from '../../../lib/api';
import { CallPanel } from '../CallPanel';

type User = { id: string; displayName: string; avatarUrl?: string | null };
type Attachment = { id: string; filename: string; mimeType: string; sizeBytes: number };
type Conversation = {
  id: string;
  type: string;
  groupProfile?: { name: string } | null;
  members: { user: User; role?: string }[];
  messages: { id: string; body: string | null; createdAt: string }[];
};
type Message = {
  id: string;
  body: string | null;
  createdAt: string;
  sender: User;
  attachments?: Attachment[];
};

export default function AppPage() {
  const [me, setMe] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingAttachmentIds, setPendingAttachmentIds] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupMemberIds, setGroupMemberIds] = useState<string[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [callMode, setCallMode] = useState<'VOICE' | 'VIDEO' | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const activeIdRef = useRef<string | null>(null);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  );

  const peerUser = useMemo(() => {
    if (!activeConversation || activeConversation.type === 'GROUP' || !me) return null;
    return activeConversation.members.find((m) => m.user.id !== me.id)?.user ?? null;
  }, [activeConversation, me]);

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    (async () => {
      try {
        const meRes = await apiFetch<{ user: User & { email: string } }>('/auth/me');
        setMe(meRes.user);
        const list = await apiFetch<{ conversations: Conversation[] }>('/conversations');
        setConversations(list.conversations);
        if (list.conversations[0]) setActiveId(list.conversations[0].id);
      } catch {
        window.location.href = '/login';
      }
    })();
  }, []);

  useEffect(() => {
    if (!me) return;
    const s = io(API_BASE, { withCredentials: true });
    setSocket(s);
    s.on('message:new', (message: Message & { conversationId?: string }) => {
      const convId = message.conversationId ?? activeIdRef.current;
      if (convId && convId === activeIdRef.current) {
        setMessages((prev) => [message, ...prev]);
      }
    });
    return () => {
      s.disconnect();
    };
  }, [me]);

  useEffect(() => {
    if (!activeId) return;
    socket?.emit('conversation:join', activeId);
    apiFetch<{ items: Message[] }>(`/conversations/${activeId}/messages`)
      .then((res) => setMessages(res.items))
      .catch((err) => setError(err.message));
    setPendingAttachmentIds([]);
  }, [activeId, socket]);

  async function refreshConversations() {
    const list = await apiFetch<{ conversations: Conversation[] }>('/conversations');
    setConversations(list.conversations);
  }

  async function sendMessage() {
    if (!activeId) return;
    const body = draft.trim();
    if (!body && pendingAttachmentIds.length === 0) return;
    setDraft('');
    const attachmentIds = [...pendingAttachmentIds];
    setPendingAttachmentIds([]);
    try {
      const payload = { body, attachmentIds: attachmentIds.length ? attachmentIds : undefined };
      if (socket?.connected) {
        socket.emit('message:send', { conversationId: activeId, ...payload }, (err?: string) => {
          if (err) setError(err);
        });
      } else {
        await apiFetch(`/conversations/${activeId}/messages`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        const res = await apiFetch<{ items: Message[] }>(`/conversations/${activeId}/messages`);
        setMessages(res.items);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Send failed');
    }
  }

  async function startDirectChat(userId: string) {
    const res = await apiFetch<{ conversation: Conversation }>('/conversations/direct', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    setConversations((prev) => [
      res.conversation,
      ...prev.filter((c) => c.id !== res.conversation.id),
    ]);
    setActiveId(res.conversation.id);
    setSearch('');
    setSearchResults([]);
  }

  async function createGroup() {
    if (!groupName.trim() || groupMemberIds.length === 0) {
      setError('Group name and at least one member are required');
      return;
    }
    const res = await apiFetch<{ conversation: Conversation }>('/conversations/group', {
      method: 'POST',
      body: JSON.stringify({ name: groupName.trim(), memberIds: groupMemberIds }),
    });
    await refreshConversations();
    setActiveId(res.conversation.id);
    setShowGroupModal(false);
    setGroupName('');
    setGroupMemberIds([]);
  }

  async function addGroupMember(userId: string) {
    if (!activeId) return;
    await apiFetch(`/conversations/${activeId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userIds: [userId] }),
    });
    await refreshConversations();
  }

  async function removeGroupMember(userId: string) {
    if (!activeId) return;
    await apiFetch(`/conversations/${activeId}/members/${userId}`, { method: 'DELETE' });
    await refreshConversations();
  }

  async function blockPeer() {
    if (!peerUser) return;
    await apiFetch(`/users/${peerUser.id}/block`, { method: 'POST' });
    setError(null);
    alert(`${peerUser.displayName} blocked`);
  }

  async function submitReport() {
    if (!peerUser || reportReason.trim().length < 3) return;
    await apiFetch(`/users/${peerUser.id}/report`, {
      method: 'POST',
      body: JSON.stringify({
        reason: reportReason.trim(),
        details: reportDetails.trim() || undefined,
      }),
    });
    setShowReportModal(false);
    setReportReason('');
    setReportDetails('');
  }

  async function onFileSelected(file: File) {
    if (!activeId) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('conversationId', activeId);
      const res = await apiUpload<{ attachment: Attachment }>('/attachments', form);
      setPendingAttachmentIds((prev) => [...prev, res.attachment.id]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function toggleGroupMember(userId: string) {
    setGroupMemberIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  }

  useEffect(() => {
    if (search.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const handle = setTimeout(() => {
      apiFetch<{ users: User[] }>(`/conversations/users/search?q=${encodeURIComponent(search)}`)
        .then((res) => setSearchResults(res.users))
        .catch(() => setSearchResults([]));
    }, 250);
    return () => clearTimeout(handle);
  }, [search]);

  function title(conversation: Conversation) {
    if (conversation.type === 'GROUP') return conversation.groupProfile?.name ?? 'Group';
    const other = conversation.members.find((m) => m.user.id !== me?.id)?.user;
    return other?.displayName ?? 'Direct chat';
  }

  return (
    <main className="container" style={{ padding: '1rem 0 2rem', display: 'grid', gap: '1rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0 }}>Messages</h1>
          <p className="muted" style={{ margin: 0 }}>
            {me ? `Signed in as ${me.displayName}` : 'Loading…'}
          </p>
        </div>
        <button
          className="btn secondary"
          onClick={() =>
            apiFetch('/auth/logout', { method: 'POST' }).then(() => (window.location.href = '/'))
          }
        >
          Sign out
        </button>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(240px, 320px) 1fr',
          gap: '1rem',
          minHeight: '70vh',
        }}
      >
        <aside className="card" style={{ padding: '0.8rem', display: 'grid', gap: '0.6rem' }}>
          <button className="btn" type="button" onClick={() => setShowGroupModal(true)}>
            New group
          </button>
          <input
            className="input"
            placeholder="Search people"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {searchResults.map((user) => (
            <button
              key={user.id}
              className="btn secondary"
              type="button"
              onClick={() => startDirectChat(user.id)}
            >
              Message {user.displayName}
            </button>
          ))}
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              className="btn secondary"
              type="button"
              style={{
                justifyContent: 'flex-start',
                opacity: conversation.id === activeId ? 1 : 0.8,
              }}
              onClick={() => setActiveId(conversation.id)}
            >
              {title(conversation)}
            </button>
          ))}
        </aside>

        <section
          className="card"
          style={{
            padding: '0.8rem',
            display: 'grid',
            gridTemplateRows: 'auto 1fr auto',
            gap: '0.8rem',
          }}
        >
          {activeConversation ? (
            <header
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <strong>{title(activeConversation)}</strong>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {peerUser ? (
                  <>
                    <button
                      className="btn secondary"
                      type="button"
                      onClick={() => setCallMode('VOICE')}
                    >
                      Voice
                    </button>
                    <button
                      className="btn secondary"
                      type="button"
                      onClick={() => setCallMode('VIDEO')}
                    >
                      Video
                    </button>
                    <button className="btn secondary" type="button" onClick={() => blockPeer()}>
                      Block
                    </button>
                    <button
                      className="btn secondary"
                      type="button"
                      onClick={() => setShowReportModal(true)}
                    >
                      Report
                    </button>
                  </>
                ) : null}
              </div>
            </header>
          ) : null}

          {activeConversation?.type === 'GROUP' ? (
            <div className="card" style={{ padding: '0.5rem', background: 'var(--panel-2)' }}>
              <p className="muted" style={{ margin: '0 0 0.4rem', fontSize: 12 }}>
                Members
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                {activeConversation.members.map((m) => (
                  <li
                    key={m.user.id}
                    style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                  >
                    {m.user.displayName}
                    {m.user.id !== me?.id ? (
                      <button
                        className="btn secondary"
                        type="button"
                        style={{ padding: '0.2rem 0.5rem', fontSize: 12 }}
                        onClick={() => removeGroupMember(m.user.id)}
                      >
                        Remove
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
              {searchResults.length > 0 ? (
                <div
                  style={{ marginTop: '0.5rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}
                >
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      className="btn secondary"
                      type="button"
                      onClick={() => addGroupMember(user.id)}
                    >
                      Add {user.displayName}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          <div
            style={{
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column-reverse',
              gap: '0.6rem',
            }}
          >
            {messages.map((message) => (
              <article
                key={message.id}
                style={{
                  alignSelf: message.sender.id === me?.id ? 'flex-end' : 'flex-start',
                  maxWidth: '75%',
                }}
              >
                <p className="muted" style={{ margin: 0, fontSize: 12 }}>
                  {message.sender.displayName}
                </p>
                <div
                  className="card"
                  style={{ padding: '0.6rem 0.8rem', background: 'var(--panel-2)' }}
                >
                  {message.body ? <p style={{ margin: 0 }}>{message.body}</p> : null}
                  {message.attachments?.map((att) => (
                    <p key={att.id} style={{ margin: '0.25rem 0 0' }}>
                      <a href={attachmentUrl(att.id)} target="_blank" rel="noreferrer">
                        {att.filename}
                      </a>
                      <span className="muted" style={{ fontSize: 11 }}>
                        {' '}
                        ({Math.round(att.sizeBytes / 1024)} KB)
                      </span>
                    </p>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf,text/plain"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onFileSelected(file);
                e.target.value = '';
              }}
            />
            <button
              className="btn secondary"
              type="button"
              disabled={!activeId || uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? 'Uploading…' : 'Attach'}
            </button>
            {pendingAttachmentIds.length > 0 ? (
              <span className="muted" style={{ fontSize: 12 }}>
                {pendingAttachmentIds.length} file(s) ready to send
              </span>
            ) : null}
            <input
              className="input"
              style={{ flex: 1, minWidth: 160 }}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={
                activeConversation
                  ? `Message ${title(activeConversation)}`
                  : 'Select a conversation'
              }
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button className="btn" type="button" onClick={sendMessage}>
              Send
            </button>
          </div>
          {error ? <p style={{ color: 'var(--danger)' }}>{error}</p> : null}
        </section>
      </div>

      {showGroupModal ? (
        <div
          className="card"
          style={{
            position: 'fixed',
            inset: '20%',
            zIndex: 40,
            padding: '1rem',
            display: 'grid',
            gap: '0.75rem',
          }}
        >
          <h2 style={{ margin: 0 }}>Create group</h2>
          <input
            className="input"
            placeholder="Group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          <p className="muted" style={{ margin: 0 }}>
            Search and select members
          </p>
          <input
            className="input"
            placeholder="Search people"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {searchResults.map((user) => (
            <label key={user.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={groupMemberIds.includes(user.id)}
                onChange={() => toggleGroupMember(user.id)}
              />
              {user.displayName}
            </label>
          ))}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn" type="button" onClick={() => createGroup()}>
              Create
            </button>
            <button
              className="btn secondary"
              type="button"
              onClick={() => setShowGroupModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {showReportModal && peerUser ? (
        <div
          className="card"
          style={{
            position: 'fixed',
            inset: '25%',
            zIndex: 40,
            padding: '1rem',
            display: 'grid',
            gap: '0.5rem',
          }}
        >
          <h2 style={{ margin: 0 }}>Report {peerUser.displayName}</h2>
          <input
            className="input"
            placeholder="Reason (required)"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
          />
          <textarea
            className="input"
            placeholder="Details (optional)"
            value={reportDetails}
            onChange={(e) => setReportDetails(e.target.value)}
            rows={3}
          />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn" type="button" onClick={() => submitReport()}>
              Submit
            </button>
            <button
              className="btn secondary"
              type="button"
              onClick={() => setShowReportModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {callMode && peerUser && activeId ? (
        <CallPanel
          socket={socket}
          meId={me!.id}
          otherUserId={peerUser.id}
          conversationId={activeId}
          callType={callMode}
          onClose={() => setCallMode(null)}
        />
      ) : null}
    </main>
  );
}
