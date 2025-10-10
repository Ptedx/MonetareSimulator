import { ReactNode } from "react";

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
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                />
              </svg>
            </div>
            <span className="font-semibold text-lg">monetare</span>
          </div>
          <span className="text-xs text-gray-500">Corporate</span>
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
