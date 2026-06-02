# 📄 Product Requirements Document (PRD) - SecretSanta

**Projeto:** SecretSanta (Amigo Secreto Gamificado)  
**Versão:** 1.0.0  
**Status:** ⚪ Aguardando Geração de Especificações.

## 🎯 1. Visão Geral e Objetivo

O **SecretSanta** é uma aplicação web progressiva (PWA) que reinventa o amigo secreto tradicional. O problema resolvido é a falta de interação antes da revelação física. O software introduz uma camada de jogo ("The Quest") onde o usuário deve adivinhar quem tirou através de pistas baseadas em características pessoais cadastradas pelos próprios participantes.

## 📖 2. Glossário Ubíquo

- **The Quest (A Jornada):** O fluxo de gamificação onde o usuário tenta descobrir seu amigo secreto.
- **Característica:** Informação pessoal (ex: "Cor do cabelo") que serve como pista para o jogador adivinhar quem tirou.
- **Chute Final:** Tentativa final de acertar o nome do sorteado.

## 👤 3. Atores e Permissões

- **Visitante:** Pode visualizar a landing page e criar uma conta.
- **Jogador:** Pode visualizar a home page, criar uma conta e/ou jogar com código recebido via email(Não é necessário criação de conta para jogar, apenas o código do grupo).
- **Usuário Autenticado:** Pode criar grupos, visualizar grupos em que foi convidado, sortear participantes em que é o dono do grupo,iniciar jogos dos grupos em que é o dono(somente após o sorteio ter sido realizado), expulsar mebros(somente se o sorteio não tiver sido realizado) do grupo em que é o dono e gerenciar seu perfil de características.

## 📝 4. Escopo Funcional, Histórias de Usuário e Critérios de Aceitação (MoSCoW)

> **Legenda de Status (Ciclo de Vida da História):**
>
> - ⚪ **[Draft]**: Ideia em rascunho. As regras ainda estão sendo escritas. **(Não codificar)**
> - 🟡 **[Ready]**: Regras de negócio definidas e aprovadas. Pronto para o Kanban.
> - 🟢 **[Live]**: Funcionalidade desenvolvida, testada e em produção.
> - 🔴 **[Deprecated]**: Funcionalidade removida ou substituída.

- **🟡 US01 - Autenticação:**
  **Ator** Usuário autenticado | **História:** Como usuário, quero poder criar uma conta com e-mail/senha para manter meus dados seguros.
  **✅ Critérios de Aceitação:**
- [ ] O usuário deve ser capaz de criar uma conta com e-mail/senha.
- [ ] O usuário deve ser capaz de fazer login com e-mail/senha.
- [ ] O usuário deve ser capaz de fazer logout.
- [ ] O usuário deve ser capaz de redefinir a senha.

- **🟡 US02 - Perfil do usuário Autenticado:**
  **Ator** Usuário autenticado | **História:** Como usuário autenticado, quero poder atualizar meu cadastro, preenchendo nome completo, idade, minhas características pré-definidas e alteração de senha.
  **✅ Critérios de Aceitação:**
- [ ] O usuário deve ser capaz de atualizar seu nome completo.
- [ ] O usuário deve ser capaz de atualizar sua idade.
- [ ] O usuário deve ser capaz de atualizar suas características pré-definidas.
- [ ] O usuário deve ser capaz de alterar sua senha.

- **🟡 US03 - Gestão de Grupos:**
  **Ator** Usuário autenticado | **História:** Como usuário autenticado, quero criar múltiplos grupos (ex: "Família", "Trabalho") e gerar um código de convite que será enviado ao participante via email. Devo poder adicionar/remover participantes do grupo, fazer o sorteio dos jogadores, verificar o status de preenchimento das caracteristicas dos jogadores e iniciar jogos dos grupos.
  **✅ Critérios de Aceitação:**
- [ ] O usuário deve ser capaz de criar um grupo.
- [ ] O usuário deve ser capaz de adicionar participantes ao grupo.
- [ ] O usuário deve ser capaz de remover participantes do grupo.
- [ ] O usuário deve ser capaz de fazer o sorteio dos jogadores.
- [ ] O usuário deve ser capaz de verificar o status de preenchimento das caracteristicas dos jogadores.
- [ ] O usuário deve ser capaz de iniciar jogos dos grupos.

- **🟡 US04 - Perfil de Características:**
  **Ator** Usuário autenticado/Jogador | **História:** Como participante, quero preencher um formulário com 5 características (Cor, Hobby, Comida, Filme, Fato Curioso...) antes do sorteio ser realizado, através do email recebido.
  **✅ Critérios de Aceitação:**
- [ ] O usuário deve ser capaz de preencher um formulário com 5 características.
- [ ] O usuário deve ser capaz de salvar suas características.

- **🟡 US05 - O Sorteio:**
  **Ator** Usuário autenticado | **História:** Como dono do grupo, quero acionar o sorteio para que o sistema distribua os pares sem que ninguém tire a si mesmo.
  **✅ Critérios de Aceitação:**
- [ ] O usuário deve ser capaz de acionar o sorteio.
- [ ] O usuário deve ser capaz de verificar o status de preenchimento das caracteristicas dos jogadores.

- **🟡 US06 - Interface de Gamificação:**
  **Ator** Usuário autenticado/Jogador | **História:** Como usuário, quero acessar uma tela de jogo onde as pistas aparecem uma por uma, bloqueadas por um campo de resposta.
  **✅ Critérios de Aceitação:**
- [ ] O usuário deve ser capaz de acessar a tela de jogo.
- [ ] O usuário deve ser capaz de ver as pistas.
- [ ] O usuário deve ser capaz de preencher o campo de resposta.

- **🟡 US07 - Revelação Final:**
  **Ator** Usuário autenticado/Jogador | **História:** Como usuário, quero realizar o chute final e ver a identidade da pessoa, independente de ter acertado todos os palpites.
  **✅ Critérios de Aceitação:**
- [ ] O usuário deve ser capaz de realizar o chute final.
- [ ] O usuário deve ser capaz de ver a identidade da pessoa.

## 🛡️ 5. Regras de Negócio (Constraints)

- **RN01(Imutabilidade Pós-Sorteio):** Após o sorteio ser realizado, o dono do grupo não pode mais remover ou adicionar participantes.
- **RN02(Mínimo de Membros):** O sorteio só é habilitado com no mínimo 3 participantes.
- **RN03(Inicio do jogo):** O jogo só pode ser iniciado após o sorteio ter sido realizado e o jogo iniciado pelo dono do grupo. Caso o código do grupo seja utilizado antes do jogo ser iniciado ou após sua conclusão, deve exibir um popup informando que o jogo não pode ser iniciado.
- **RN04(Lógica de Progressão):** A pista N+1 só é revelada após o usuário acertar a pista N.(Case insensitive e desconsidera acentos);
- **RN05(Chute Único):** O usuário tem apenas uma chance no "Chute Final" antes da revelação.
- **RN06(Exclusividade):** O sistema deve garantir que o ciclo de sorteio seja fechado (Caminho Hamiltoniano).
- **RN07(Status de Preenchimento):** O dono do grupo deve poder ver o status de preenchimento das características dos jogadores, mas não pode ver as características preenchidas.

## 🚫 6. Fora de Escopo (Non-goals)

- Sorteio com restrições (ex: "X não pode tirar Y").
- Integração com e-commerce para sugestão de presentes.
- Notificações via SMS.
- Integrações via META, Google, X, etc.

## ⚙️ 7. Requisitos Não Funcionais (Qualidade)

- **Mobile-First:** Design otimizado para telas sensíveis ao toque.
- **Segurança:** Dados sensíveis (quem tirou quem) protegidos por RLS (Row Level Security) no Supabase.
