import type { Metadata } from "next";
import "./globals.css";
import CustomCursor from "@/components/CustomCursor";
import GlobalBackground from "@/components/GlobalBackground";

export const metadata: Metadata = {
  title: "SOMOS — Plataforma de Continuidade Educativa Familiar",
  description:
    "Devolve às famílias as ferramentas para entenderem e apoiarem as crianças, independentemente da escola.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600&family=Nunito:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <GlobalBackground />
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
