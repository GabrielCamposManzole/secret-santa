# 📄 Product Requirements Document (PRD) - SecretSanta

**Projeto:** SecretSanta (Amigo Secreto Gamificado)  
**Versão:** 1.0.0  
**Status:** 🟡 Em Definição (MVP)

## 🎯 1. Visão Geral e Objetivo
O **SecretSanta** é uma aplicação web progressiva (PWA) que reinventa o amigo secreto tradicional. O problema resolvido é a falta de interação antes da revelação física. O software introduz uma camada de jogo ("The Quest") onde o usuário deve adivinhar quem tirou através de pistas baseadas em características pessoais cadastradas pelos próprios participantes.

## 📖 2. Glossário Ubíquo
* **Organizador:** Usuário que cria o grupo e possui poder de iniciar o sorteio.
* **Participante:** Usuário que ingressa em um grupo via código de convite.
* **The Quest (A Jornada):** O fluxo de gamificação onde o usuário tenta descobrir seu amigo secreto.
* **Trait (Característica):** Informação pessoal (ex: "Hobby") que serve como pista.
* **The Guess (O Chute):** Tentativa final de acertar o nome do sorteado.

## 👤 3. Atores e Permissões
* **Visitante:** Pode visualizar a landing page e criar uma conta.
* **Usuário Autenticado:** Pode criar grupos, entrar em grupos existentes e gerenciar seu perfil de características.
* **Owner (Dono do Grupo):** Pode expulsar membros, encerrar inscrições e disparar o sorteio.

## 📝 4. Escopo Funcional (User Stories)
* **US01 - Autenticação:** Como usuário, quero criar uma conta com e-mail/senha para manter meus dados seguros.
* **US02 - Gestão de Grupos:** Como usuário, quero criar múltiplos grupos (ex: "Família", "Trabalho") e gerar um código de convite.
* **US03 - Perfil de Características:** Como participante, quero preencher um formulário com 5 características (Cor, Hobby, Comida, Filme, Fato Curioso) antes do sorteio.
* **US04 - O Sorteio:** Como dono do grupo, quero acionar o sorteio para que o sistema distribua os pares sem que ninguém tire a si mesmo.
* **US05 - Interface de Gamificação:** Como usuário, quero ver uma tela de jogo onde as pistas aparecem uma por uma, bloqueadas por um campo de resposta.
* **US06 - Revelação Final:** Como usuário, quero realizar o chute final e ver a identidade da pessoa, independente de ter acertado todos os palpites.

## 🛡️ 5. Regras de Negócio (Constraints)
1.  **Imutabilidade Pós-Sorteio:** Após o sorteio ser realizado, nenhum participante pode alterar suas características.
2.  **Mínimo de Membros:** O sorteio só é habilitado com no mínimo 3 participantes.
3.  **Lógica de Progressão:** A pista N+1 só é revelada se a resposta da pista N for idêntica (case-insensitive) à cadastrada.
4.  **Chute Único:** O usuário tem apenas uma chance no "Chute Final" antes da revelação, para gerar estatísticas de erro/acerto no grupo.
5.  **Exclusividade:** O sistema deve garantir que o ciclo de sorteio seja fechado (Caminho Hamiltoniano).

## 🚫 6. Fora de Escopo (Non-goals)
* Sorteio com restrições (ex: "X não pode tirar Y").
* Integração com e-commerce para sugestão de presentes.
* Notificações via SMS.

## ⚙️ 7. Requisitos Não Funcionais (Qualidade)
* **Mobile-First:** Design otimizado para telas sensíveis ao toque.
* **Performance:** Carregamento de imagens de perfil otimizado (Lazy Loading).
* **Segurança:** Dados sensíveis (quem tirou quem) protegidos por RLS (Row Level Security) no Supabase.

## 🛠️ 8. Tech Stack Principal
* **Frontend:** Angular 19+ (Signals, Standalone, Control Flow).
* **Backend/DB:** Supabase (PostgreSQL + Auth).
* **Style:** Tailwind CSS.