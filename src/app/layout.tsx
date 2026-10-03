import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LinguaAI - AI-Powered English Language Mastery",
  description: "Master Reading, Writing, Listening, and Speaking with interactive AI coaching and feedback",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
        {children}
      </body>
    </html>
  );
}
