import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'EventPulse — Gestão Inteligente de Eventos & Inscrições',
  description: 'Plataforma completa para planejamento, controle de lotação e gestão de participantes em tempo real.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <Navbar />
        <main className="page-wrapper">{children}</main>
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: '#162035',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#F8FAFC',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
              fontFamily: 'var(--font-family)',
              fontSize: '0.9rem',
            },
          }}
        />
      </body>
    </html>
  );
}
