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
  fadeKey,
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[color:var(--torres-cream)]" data-testid="book-layout">
      {!hideHeader && <BookHeader />}
      {/*
        `fadeKey` é usado apenas para reiniciar a animação `fade-up` quando o
        capítulo muda. NUNCA use `Math.random()` aqui — isso faria o React
        desmontar/remontar todos os filhos a cada render, resetando o estado
        local (ex: passo atual do Quiz e Simulador).
      */}
      <main className="fade-up flex-1" key={fadeKey}>
        {children}
      </main>
      {!hideFooter && <BookFooter />}
    </div>
  );
}
