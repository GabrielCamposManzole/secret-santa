---
trigger: glob
globs: apps/web/src/**/*
---

# 01 - ANGULAR 21 & TAILWIND STRICT RULES

Ao atuar no ecossistema de front-end deste projeto, obedeça rigorosamente:

1. PARADIGMA ANGULAR:

- STANDALONE FIRST: É ESTRITAMENTE PROIBIDO o uso ou sugestão de `NgModules` ou `SharedModule` genéricos.
- CONTROL FLOW: Utilize SEMPRE a sintaxe moderna (`@if`, `@for`, `@switch`). Proibido `*ngIf`.
- REATIVIDADE: Priorize Signals (`signal`, `computed`) sobre RxJS para estado local.
- TIPAGEM: TypeScript estrito. O uso de `any` é proibido.

2. ESTILIZAÇÃO (Tailwind v4):

- Arquitetura CSS-First. PROIBIDO criar arquivos customizados `.css` ou `.scss` para componentes isolados.
- Use estritamente classes utilitárias do Tailwind no HTML.

3. FEATURE-SLICING DESIGN (FSD):

- `core/`: Apenas inicialização (interceptors).
- `shared/`: Componentes visuais "burros". PROIBIDO importar algo de `features` aqui.
- `features/`: Isolamento total de domínio.
