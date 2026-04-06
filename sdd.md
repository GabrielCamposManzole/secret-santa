# 🛠️ Software Design Document (SDD) - SecretSanta

**Projeto:** SecretSanta
**Versão:** 1.0.0  
**Status:** ⚪ Aguardando Geração de Especificações.

## 🤖 1. Orquestração e Contexto de IA (MCP)
* **Figma Context:** Ler tokens de cores `#7C3AED` (Primary) e `#FACC15` (Secondary).
* **Supabase Context:** Tabelas `profiles`, `groups`, `members`, `traits`, `draws`.

## 📦 2. Stack Tecnológica e Bibliotecas
* **Core:** Angular 19+ (Signals para reatividade de estado).
* **Auth:** Supabase Auth Helpers.
* **UI Components:** Lucide-Angular (ícones), Tailwind Merge (utilitários de classe).

## 🗄️ 3. Arquitetura de Dados

### 📖 3.1. Glossário Técnico
| Termo PRD | Entidade Técnica | Descrição |
| :--- | :--- | :--- |
| Participante | `profiles` | Dados básicos do usuário. |
| Grupo | `groups` | Nome, código de acesso e status do sorteio. |
| Característica| `traits` | Par pergunta/resposta do usuário. |
| Sorteio | `draws` | Tabela pivô com `giver_id` e `receiver_id`. |

### 📊 3.2. Diagrama ER (Mermaid)
```mermaid
erDiagram
    profiles ||--o{ traits : "possui"
    profiles ||--o{ group_members : "participa"
    groups ||--o{ group_members : "contem"
    draws {
        uuid id PK
        uuid group_id FK
        uuid giver_id FK
        uuid receiver_id FK
        boolean quest_completed
        int current_step
    }
    traits {
        uuid id PK
        uuid profile_id FK
        string label "Ex: Hobby"
        string value "Ex: Programar"
    }