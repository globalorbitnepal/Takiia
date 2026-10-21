'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { apiFetch } from '../../lib/api';

type CallType = 'VOICE' | 'VIDEO';

type Props = {
  socket: Socket | null;
  meId: string;
  otherUserId: string;
  conversationId: string;
  callType: CallType;
  onClose: () => void;
};

type Phase = 'idle' | 'calling' | 'incoming' | 'active' | 'ended' | 'error';

export function CallPanel({ socket, meId, otherUserId, conversationId, callType, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>('calling');
  const [statusText, setStatusText] = useState('Requesting camera/microphone…');
  const [callId, setCallId] = useState<string | null>(null);
  const [incomingFrom, setIncomingFrom] = useState<string | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const iceServersRef = useRef<RTCIceServer[]>([]);

  const cleanup = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
  }, []);

  const endCall = useCallback(async () => {
    if (callId) {
      try {
        await apiFetch(`/calls/${callId}/end`, { method: 'POST' });
      } catch {
        /* ignore */
      }
    }
    cleanup();
    setPhase('ended');
    onClose();
  }, [callId, cleanup, onClose]);

  useEffect(() => {
    let cancelled = false;

    async function loadIce() {
      const config = await apiFetch<{ iceServers: RTCIceServer[] }>('/webrtc/config');
      iceServersRef.current = config.iceServers;
    }

    async function createPeer(): Promise<RTCPeerConnection> {
      const pc = new RTCPeerConnection({ iceServers: iceServersRef.current });
      pc.onicecandidate = (event) => {
        if (event.candidate && socket?.connected) {
          socket.emit('call:signal', {
            toUserId: otherUserId,
            data: { type: 'ice', candidate: event.candidate },
          });
        }
      };
      pc.ontrack = (event) => {
        const [stream] = event.streams;
        if (remoteVideoRef.current && stream) {
          remoteVideoRef.current.srcObject = stream;
        }
      };
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed') {
          setStatusText('Connection failed — check TURN/STUN configuration');
          setPhase('error');
        } else if (pc.connectionState === 'disconnected') {
          setStatusText('Reconnecting…');
          pc.restartIce?.();
        } else if (pc.connectionState === 'connected') {
          setStatusText('Connected (local preview only until peer answers)');
          setPhase('active');
        }
      };
      return pc;
    }

    async function startOutgoing() {
      try {
        await loadIce();
        if (cancelled) return;
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: callType === 'VIDEO',
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.muted = true;
        }
        const { call } = await apiFetch<{ call: { id: string } }>('/calls/start', {
          method: 'POST',
          body: JSON.stringify({
            calleeId: otherUserId,
            conversationId,
            type: callType,
          }),
        });
        setCallId(call.id);
        socket?.emit('call:invite', { toUserId: otherUserId, callId: call.id, type: callType });
        setStatusText('Ringing…');

        const pc = await createPeer();
        pcRef.current = pc;
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket?.emit('call:signal', {
          toUserId: otherUserId,
          data: { type: 'offer', sdp: offer },
        });
      } catch (err) {
        setStatusText(err instanceof Error ? err.message : 'Could not access microphone/camera');
        setPhase('error');
      }
    }

    void startOutgoing();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [socket, otherUserId, conversationId, callType, cleanup]);

  useEffect(() => {
    if (!socket) return;

    const onSignal = async (payload: { fromUserId: string; data: unknown }) => {
      const data = payload.data as {
        type?: string;
        sdp?: RTCSessionDescriptionInit;
        candidate?: RTCIceCandidateInit;
      };
      const pc = pcRef.current;
      if (!pc) return;

      if (data.type === 'answer' && data.sdp) {
        await pc.setRemoteDescription(data.sdp);
        setPhase('active');
        setStatusText('In call');
      } else if (data.type === 'offer' && data.sdp) {
        setIncomingFrom(payload.fromUserId);
        setPhase('incoming');
        setStatusText('Incoming call');
        await pc.setRemoteDescription(data.sdp);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('call:signal', {
          toUserId: payload.fromUserId,
          data: { type: 'answer', sdp: answer },
        });
      } else if (data.type === 'ice' && data.candidate) {
        try {
          await pc.addIceCandidate(data.candidate);
        } catch {
          /* ignore stale candidates */
        }
      }
    };

    const onInvite = (payload: { fromUserId: string; callId: string }) => {
      if (payload.fromUserId === meId) return;
      setIncomingFrom(payload.fromUserId);
      setCallId(payload.callId);
      setPhase('incoming');
      setStatusText('Incoming call');
    };

    socket.on('call:signal', onSignal);
    socket.on('call:invite', onInvite);
    return () => {
      socket.off('call:signal', onSignal);
      socket.off('call:invite', onInvite);
    };
  }, [socket, meId]);

  async function acceptIncoming() {
    if (!callId) return;
    try {
      await apiFetch(`/calls/${callId}/accept`, { method: 'POST' });
      if (!localStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: callType === 'VIDEO',
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.muted = true;
        }
        if (!pcRef.current) {
          const config = await apiFetch<{ iceServers: RTCIceServer[] }>('/webrtc/config');
          const pc = new RTCPeerConnection({ iceServers: config.iceServers });
          pcRef.current = pc;
          stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        }
      }
      setPhase('active');
      setStatusText('In call');
    } catch (err) {
      setStatusText(err instanceof Error ? err.message : 'Could not accept call');
      setPhase('error');
    }
  }

  async function declineIncoming() {
    if (callId) {
      try {
        await apiFetch(`/calls/${callId}/decline`, { method: 'POST' });
      } catch {
        /* ignore */
      }
    }
    cleanup();
    onClose();
  }

  return (
    <div
      className="card"
      style={{
        position: 'fixed',
        inset: '10%',
        zIndex: 50,
        padding: '1rem',
        display: 'grid',
        gap: '0.75rem',
        gridTemplateRows: 'auto 1fr auto',
        background: 'var(--panel)',
      }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>{callType === 'VIDEO' ? 'Video call' : 'Voice call'}</strong>
        <span className="muted">{statusText}</span>
      </header>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: callType === 'VIDEO' ? '1fr 1fr' : '1fr',
          gap: '0.5rem',
          minHeight: 120,
        }}
      >
        {callType === 'VIDEO' ? (
          <>
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              style={{ width: '100%', background: '#000' }}
            />
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              style={{ width: '100%', background: '#111' }}
            />
          </>
        ) : (
          <p className="muted" style={{ margin: 0 }}>
            Audio only — grant microphone access when prompted.
          </p>
        )}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
        {phase === 'incoming' && incomingFrom ? (
          <>
            <button className="btn" type="button" onClick={() => acceptIncoming()}>
              Accept
            </button>
            <button className="btn secondary" type="button" onClick={() => declineIncoming()}>
              Decline
            </button>
          </>
        ) : (
          <button className="btn secondary" type="button" onClick={() => endCall()}>
            End call
          </button>
        )}
      </div>
      <p className="muted" style={{ fontSize: 12, margin: 0 }}>
        WebRTC requires STUN/TURN on real networks. This UI is not verified for production NAT
        traversal.
      </p>
    </div>
  );
}
