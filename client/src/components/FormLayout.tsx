import { ReactNode } from "react";
import logoUrl from '@assets/monetare_logo.png'
interface FormLayoutProps {
  children: ReactNode;
}

export function FormLayout({ children }: FormLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-full pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute h-full w-px bg-gradient-to-b from-green-200 via-green-300 to-transparent"
            style={{
              left: `${i * 6}%`,
              opacity: 0.3 + (i * 0.02),
              transform: `rotate(${5 + i * 0.5}deg)`,
            }}
          />
        ))}
      </div>

      <header className="p-6 border-b relative z-10">
        <div className="flex items-center gap-2">
            <img src={logoUrl} alt="Monetare" className="h-10 w-auto"  />
        </div>
      </header>

      <main className="flex-1 relative z-10">{children}</main>

      <footer className="border-t p-4 text-center text-sm text-gray-500 relative z-10">
        <div className="flex justify-between max-w-6xl mx-auto">
          <span>© 2025 Monetare Corporate</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-700">
              Política de Privacidade
            </a>
            <a href="#" className="hover:text-gray-700">
              Termos de uso
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
