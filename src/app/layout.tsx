import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'EventPulse - Gestão de Eventos & Inscrições',
  description: 'Plataforma para gerenciamento de eventos, controle de lotação e inscrições de participantes.',
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
      </body>
    </html>
  );
}
