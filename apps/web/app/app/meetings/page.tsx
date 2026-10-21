'use client';

export default function MeetingsPage() {
  return (
    <div>
      <h1 className="h2">Meetings</h1>
      <p className="muted">
        Takiia supports call lifecycle APIs and in-app WebRTC UI for direct calls. Group rooms,
        screen sharing, and production-grade TURN/LiveKit routing are not verified for real-network
        use yet.
      </p>
      <div className="card" style={{ padding: '1rem', marginTop: '1rem' }}>
        <p>
          <strong>Implemented:</strong> REST call start/accept/decline/end, Socket signaling,
          optional voice/video from Inbox.
        </p>
        <p className="muted">
          <strong>Planned / unverified:</strong> Scheduled meeting links, host roles, participant
          limits by plan, recording, and cross-NAT group media.
        </p>
      </div>
    </div>
  );
}
