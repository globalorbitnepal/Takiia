'use client';

import { useEffect, useMemo, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { API_BASE, apiFetch } from '../../lib/api';

type User = { id: string; displayName: string; avatarUrl?: string | null };
type Conversation = {
  id: string;
  type: string;
  groupProfile?: { name: string } | null;
  members: { user: User }[];
  messages: { id: string; body: string | null; createdAt: string }[];
};
type Message = {
  id: string;
  body: string | null;
  createdAt: string;
  sender: User;
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

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  );

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
    s.on('message:new', (message: Message) => {
      if (message && activeId) {
        setMessages((prev) => [message, ...prev]);
      }
    });
    return () => {
      s.disconnect();
    };
  }, [me, activeId]);

  useEffect(() => {
    if (!activeId) return;
    socket?.emit('conversation:join', activeId);
    apiFetch<{ items: Message[] }>(`/conversations/${activeId}/messages`)
      .then((res) => setMessages(res.items))
      .catch((err) => setError(err.message));
  }, [activeId, socket]);

  async function sendMessage() {
    if (!activeId || !draft.trim()) return;
    const body = draft.trim();
    setDraft('');
    try {
      if (socket?.connected) {
        socket.emit('message:send', { conversationId: activeId, body }, (err?: string) => {
          if (err) setError(err);
        });
      } else {
        await apiFetch(`/conversations/${activeId}/messages`, {
          method: 'POST',
          body: JSON.stringify({ body }),
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
              onClick={() => startDirectChat(user.id)}
            >
              Message {user.displayName}
            </button>
          ))}
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              className="btn secondary"
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
            gridTemplateRows: '1fr auto',
            gap: '0.8rem',
          }}
        >
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
                  {message.body}
                </div>
              </article>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              className="input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={
                activeConversation
                  ? `Message ${title(activeConversation)}`
                  : 'Select a conversation'
              }
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button className="btn" onClick={sendMessage}>
              Send
            </button>
          </div>
          {error ? <p style={{ color: 'var(--danger)' }}>{error}</p> : null}
        </section>
      </div>
    </main>
  );
}
