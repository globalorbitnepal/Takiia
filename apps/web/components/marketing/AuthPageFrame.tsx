import Link from 'next/link';
import Image from 'next/image';

export function AuthPageFrame({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        className="container"
        style={{ padding: '1.25rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}
      >
        <Link href="/" aria-label="Takiia home">
          <Image src="/brand/takiia-logo.png" alt="Takiia" width={140} height={40} priority />
        </Link>
      </header>
      <main className="container" style={{ padding: '1rem 0 3rem', maxWidth: 480, flex: 1 }}>
        <h1>{title}</h1>
        {children}
      </main>
    </div>
  );
}
