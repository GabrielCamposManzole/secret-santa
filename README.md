SecretSanta (UTF-Secret)
Sistema Gamificado de Amigo Secreto para o Portal UTFApps

🔗 Informações Gerais
Link em Produção: [Aguardando Deploy no GitHub Pages/Vercel]

Autores: Gabriel Campos Manzole [Adicione os outros nomes aqui]

Status: Entrega 1 - Concepção e Planejamento

🎯 1. Visão Geral
O SecretSanta é uma aplicação web progressiva (PWA) que reinventa a dinâmica do Amigo Secreto. Em vez de apenas revelar um nome, o sistema introduz o conceito de "The Quest": um jogo onde o participante deve adivinhar quem tirou através de pistas baseadas em características pessoais (Hobby, Cor favorita, Curiosidades) cadastradas pelos usuários.

A aplicação utiliza as tecnologias mais modernas do ecossistema Angular para garantir uma experiência reativa e fluida, integrada ao Supabase para autenticação e banco de dados em tempo real.

📚 2. Documentação Oficial (Docs as Code)
Toda a engenharia do sistema está detalhada na pasta /docs, servindo de contexto para a orquestração de IA (SDD):

📄 PRD (Product Requirements Document): Visão do produto, Regras de Negócio e User Stories (ID28/ID29).

📐 SDD (Software Design Document): Arquitetura técnica, Diagrama ER e Definição de Signals (ID30).

🎨 Protótipo no Figma: Design System e fluxo navegável Mobile-First (ID1/ID2).

📊 3. Modelagem de Dados (Diagrama ER)
Snippet de código
erDiagram
    PROFILES ||--o{ TRAITS : "cadastra"
    GROUPS ||--o{ GROUP_MEMBERS : "possui"
    PROFILES ||--o{ GROUP_MEMBERS : "participa"
    DRAWS {
        uuid id PK
        uuid group_id FK
        uuid giver_id FK
        uuid receiver_id FK
        int current_step
    }
🛠 4. Pilha Tecnológica
Frontend: Angular 19+ (Arquitetura Standalone, Signals, Control Flow).

Estilização: Tailwind CSS (Design System Responsivo).

Backend as a Service (BaaS): Supabase (Auth JWT e PostgreSQL).

Metodologia: SDD (Spec-Driven Development) com Engenharia Assistida por IA.

✅ 5. Checklist de Funcionalidades (IDs)
[ ] RA1: Protótipo Figma e Configuração PWA (Manifest).

[ ] RA2: Componentes Standalone e Fluxo de Controle @for/@if.

[ ] RA3: Estado Reativo com Signals, computed e model().

[ ] RA4: Comunicação entre componentes via input() e output().

[ ] RA6: Integração completa com Supabase Auth e CRUD.

[ ] RA7/8: Gitflow e Orquestração de IA documentada.

🚀 6. Início Rápido (Desenvolvimento Local)
Clonar o repositório:

Bash
git clone https://github.com/GabrielCamposManzole/secret-santa.git
cd secret-santa
Instalar dependências:

Bash
npm install
Executar o projeto:

Bash
ng serve
Acesse http://localhost:4200 no seu navegador.