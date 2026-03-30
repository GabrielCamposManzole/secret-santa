# secret-santa
# 📍 Tô Aqui! (AutoPresence UTFPR)

🔗 **Link em Produção:** [Aguardando Deploy na Nuvem]
👨‍💻 **Autores:** [Seu Nome, Nome do Colega B, Nome do Colega C]

---

## 🎯 1. Visão Geral
Sistema Full-Cycle de registro de presenças acadêmicas utilizando QR Code dinâmico. O sistema permite que o professor projete um QR Code rotativo diretamente do sistema acadêmico da UTFPR via extensão de navegador. Os alunos escaneiam, fazem login com o e-mail institucional do Google, e a presença é validada e preenchida automaticamente na pauta.

## 📚 2. Documentação Oficial (Docs as Code)
Toda a especificação do sistema está versionada na pasta `/docs`:
* 📄 **[PRD (Product Requirements Document)](./docs/prd.md):** Visão do produto e User Stories.
* 📐 **[SDD (Software Design Document)](./docs/sdd.md):** Diagrama de banco de dados e contratos de API.
* ✅ **[Checklist de Avaliação](./docs/checklist.md):** Controle de entrega dos IDs e RAs.

## 🛠 3. Stack Tecnológica
* **Arquitetura:** Monorepo (Back, Front e Extensão no mesmo repositório).
* **Backend (API):** NestJS, TypeScript, JWT, Google OAuth.
* **Banco de Dados:** PostgreSQL gerenciado via Prisma ORM.
* **Frontend (Web/Mobile):** Angular.
* **Integração:** Extensão de Navegador (Chrome) com manipulação de DOM.

## 🚀 4. Quick Start (Como Executar)

**1. Clone o repositório:**
```bash
git clone [https://github.com/](https://github.com/)[seu-usuario]/to-aqui.git
cd to-aqui