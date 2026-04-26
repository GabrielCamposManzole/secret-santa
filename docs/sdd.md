# 🛠️ Software Design Document (SDD) - SecretSanta

**Projeto:** SecretSanta
**Versão:** 1.0.0
**Status:** ⚪ Aguardando Geração de Especificações.

## 🤖 1. Orquestração e Contexto de IA (MCP)

- **Figma Context:** Ler tokens de cores `#7C3AED` (Primary) e `#FACC15` (Secondary).
- **Supabase Context:** Tabelas `profiles`, `groups`, `members`, `traits`, `draws`.

## 📦 2. Stack Tecnológica e Bibliotecas

- **Core:** Angular 19+ (Signals para reatividade de estado).
- **Auth:** Supabase Auth Helpers.
- **UI Components:** Lucide-Angular (ícones), Tailwind Merge (utilitários de classe).
- **UI Framework:** DaisyUI (componentes pré-estilizados)

## 🗄️ 3. Arquitetura de Dados

### 📖 3.1. Glossário Técnico

| Termo PRD      | Entidade Técnica | Descrição                                   |
| :------------- | :--------------- | :------------------------------------------ |
| Participante   | `profiles`       | Dados básicos do usuário.                   |
| Grupo          | `groups`         | Nome, código de acesso e status do sorteio. |
| Característica | `traits`         | Par pergunta/resposta do usuário.           |
| Sorteio        | `draws`          | Tabela pivô com `giver_id` e `receiver_id`. |

### 📊 3.2. Diagrama ER (Mermaid)


```mermaid
erDiagram

    USUARIO {
        int id PK
        string nome_completo
        int idade
        string email
        string senha
    }

    GRUPO {
        int id PK
        string token
    }

    USUARIO_GRUPO {
        int id PK
        int usuario_id FK
        int grupo_id FK
    }

    CARACTERISTICAS {
        int id PK
        string nome
        string descricao
        int usuario_id FK
    }

    GAME {
        int id PK
        int grupo_id FK
        date data_jogo
        boolean iniciado
        boolean finalizado
    }

    GAME_RODADA {
        int id PK
        int game_id FK
        int giver_id FK
        int receiver_id FK
        boolean acertou
    }
```
🎨 4. Design Tokens

Os Design Tokens representam as decisões visuais fundamentais do sistema, garantindo consistência e facilidade de manutenção ao longo do desenvolvimento.

Cores:
Primary Color: #D42426 (O vermelho festivo do SecretSanta)
Secondary Color: #1A1C1C (Preto profundo para textos e contrastes)
Surface Color: #F8F9F9 (O cinza claro que padronizamos para todos os fundos)

Tipografia:
A fonte Plus Jakarta Sans deve ser utilizada em todos os títulos e textos.
Bordas e Raio:
Componentes como botões e inputs devem utilizar bordas arredondadas (estilo pílula), reforçando a identidade visual amigável do sistema.
Sombras (Elevação):
Utilize sombras suaves para indicar profundidade e hierarquia entre elementos (cards, modais, botões .).
Estados de Interação:
Defina variações visuais para estados como hover, foco, ativo e desabilitado, garantindo feedback claro para o usuário.
```
