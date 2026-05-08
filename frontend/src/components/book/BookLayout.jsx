import React from "react";
import BookHeader from "./BookHeader";
import BookFooter from "./BookFooter";

/**
 * Layout padrão das páginas do Book: header sticky + conteúdo com fade-in
 * + footer sticky com navegação Anterior/Próximo.
 *
 * Use `hideFooter` em casos especiais (ex: módulos com fluxo interno
 * próprio como Quiz e Simulador) e `hideHeader` se a página renderiza
 * seu próprio chrome (raro).
 */
export default function BookLayout({
  children,
  hideHeader = false,
  hideFooter = false,
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[color:var(--torres-cream)]" data-testid="book-layout">
      {!hideHeader && <BookHeader />}
      <main className="fade-up flex-1" key={Math.random() /* trigger fade on each mount */}>
        {children}
      </main>
      {!hideFooter && <BookFooter />}
    </div>
  );
}
