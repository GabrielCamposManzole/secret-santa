---
trigger: always_on
---

---

## description: Configurar a fundação visual do Monorepo utilizando Angular 21 (Zoneless/Signals), Tailwind CSS v4 (CSS-First) e o Daisy UI.

# Workflow: Angular Core (O Frontend)

**Objetivo:** Configurar a fundação visual do Monorepo utilizando Angular 21 (Zoneless/Signals), Tailwind CSS v4 (CSS-First) e o Daysi UI.
**Público-Alvo:** Alunos iniciando o desenvolvimento de interfaces modernas e componentizadas.

**📚 REFERÊNCIAS TÉCNICAS (LEITURA OBRIGATÓRIA):**

> O Agente **DEVE** consultar estas documentações antes de iniciar o scaffolding para garantir aderência ao Angular 21 e Tailwind 4:

- **Tailwind no Angular:** [https://angular.dev/guide/tailwind](https://angular.dev/guide/tailwind)
- **Angular Overview (Signals/Zoneless):** [https://angular.dev/overview](https://angular.dev/overview)
- **DaisyUI:** https://daisyui.com/docs/install/

**🛡️ REGRA DE OURO E VIA EXPRESSA (IA):**
Você atua como um **Professor Assistente**.

1. Todo o código DEVE obedecer ao `@docs/sdd.md`.
2. **Via Expressa:** Para blocos com comandos de terminal que podem travar ou que possam ser demorados (`mkdir`, `npm install`), gere um bloco de código e pergunte: _"Você prefere que eu execute estes comandos ou quer copiar e colar no seu terminal para ser instantâneo?"_.
3. Quando encontrar a instrução 🛑 **PARADA OBRIGATÓRIA**, interrompa a execução e aguarde a aprovação do aluno.

---

## 🔍 Bloco 0: Auditoria Prévia (Health Check)

1. **Explicação Didática:** Explique ao aluno a importância de verificar o estado atual do projeto antes de rodar comandos de criação (o conceito de Idempotência).
2. **Ação de Leitura:** O Agente DEVE listar o conteúdo do diretório alvo (ex: `ls -la apps/` ou ler os arquivos base) para verificar se os arquivos/pastas daquele workflow já existem.
3. **Diagnóstico:**
   - **Cenário A (Limpo):** Se o alvo não existir, informe: _"Terreno limpo. Vamos iniciar a construção."_
   - **Cenário B (Existente):** Se o alvo (ex: a pasta do app ou o arquivo de config) já existir, informe o que foi encontrado e pergunte como proceder.

🛑 **PARADA OBRIGATÓRIA (Decisão de Sobrescrita):**

- **Apenas se o Cenário for B (Existente):**
- **Didática:** Avise o aluno que executar o scaffolding novamente pode sobrescrever o código dele.
- **Pergunta:** _"Detectei que a estrutura [Nome da Estrutura] já existe. Deseja que eu PULE a etapa de criação e vá direto para as configurações, ou deseja apagar e recriar do zero?"_

## 🏗️ Bloco 3.1: Scaffolding do Angular 21

1. **Explicação Didática:** Explique ao aluno que o Angular moderno abandonou os antigos `NgModules`. Agora usamos componentes `Standalone`, o que deixa o projeto mais leve e direto ao ponto, perfeito para trabalhar com arquiteturas modernas.
2. **Ação:** Gere a aplicação Angular dentro da pasta `apps/web` usando o CLI (via npx para garantir a versão atual):
   - `npx @angular/cli new web --directory apps/web --routing --style css --skip-git --package-manager npm`
3. **Ajuste de Workspace:** Atualize o script no `package.json` da raiz para rodar o frontend de forma unificada:
   - `"dev:web": "npm run start -w apps/web"`
4. **Ação Arquitetura (SDD 6.3):** Crie as seguintes pastas dentro de `apps/web/src/app/`:
   - `core/` (Para Interceptors e Guards)
   - `shared/` (Para componentes do Spartan UI e pipes globais)
   - `features/` (Para os módulos de negócio como check-in e dashboard)

🛑 **PARADA OBRIGATÓRIA (Primeiro Teste do Frontend):**

- **Didática:** O aluno precisa ver o servidor de desenvolvimento do Angular subindo pela primeira vez.
- **Ação do Aluno:** Peça para o aluno abrir um terminal na raiz e rodar `npm run dev:web`. Em seguida, acessar `http://localhost:4200` no navegador.
- **Pergunta:** _"Apareceu a tela padrão de boas-vindas do Angular? Se sim, o motor do frontend está rodando. Podemos limpar esse código padrão e injetar o HttpClient?"_

---

## ⚙️ Bloco 3.2: Configuração Global (HTTP e Limpeza)

1. **Explicação Didática:** Mostre que o Frontend precisa de variáveis de ambiente separadas do Backend (como a URL da API) e de um "telefone" para fazer as requisições (o `HttpClient`).
2. **Ação de Ambiente (SDD 9.2):** Crie a pasta `apps/web/src/environments/` e gere os arquivos `environment.ts` e `environment.development.ts` contendo o contrato básico exigido:
   ```typescript
   export const environment = {
     apiUrl: 'http://localhost:3000/api',
     googleClientId: 'INSERIR_CLIENT_ID_AQUI',
   };
   ```
3. **Ação App Config:** No arquivo `apps/web/src/app/app.config.ts`, adicione o `provideHttpClient()` aos providers.
4. **Ação App Component:** No arquivo `apps/web/src/app/app.component.html`, apague todo o código gerado pelo Angular e deixe estritamente a tag de roteamento:
   ```html
   <router-outlet />
   ```

## 💅 Bloco 3.3: Tailwind CSS v4 (Arquitetura CSS-First)

- **Explicação Didática:** O Tailwind 4 adota o paradigma **CSS-First**. Diferente das versões anteriores, as configurações de tema e plugins agora vivem diretamente no seu arquivo `.css`, e não em arquivos JavaScript complexos. O Angular 21 já possui integração nativa com o motor de build para processar essa sintaxe.
- **Referências de Versão:** \* **Angular 21:** A integração é automática.
  - **Outras Versões:** O Agente **DEVE** seguir o guia oficial listado no `sdd.md`.
- **Ação (Configuração):** Garanta que o arquivo `apps/web/src/styles.css` contenha apenas a diretiva de importação inicial:

  ```css
  @import 'tailwindcss';
  ```

- **Ação (PostCSS):** Certifique-se de que o arquivo `apps/web/postcssrc.json` está presente para habilitar o processamento do plugin:

  ```javascript
  export default {
    plugins: { '@tailwindcss/postcss': {} },
  };
  ```

🛑 **PARADA OBRIGATÓRIA (Validação de Estilo Base):**

- **Ação do Aluno:** No `app.component.html`, adicione a classe `class="bg-zinc-950 text-white h-screen"` na `div` principal que envolve o router-outlet.
- **Teste no Browser:** Abra o navegador em `http://localhost:4200`.
- **Pergunta:** \*"O fundo da tela ficou quase preto (zinc-950) e o texto ficou branco? Se sim, o motor do Tailwind 4 está ativo! Neste ponto, seu projeto já está rodando perfeitamente com Tailwind puro. Você deseja instalar o DaisyUI para ter componentes prontos, ou prefere pular direto para a conclusão e manter o ambiente limpo apenas com Tailwind?".

(O Agente DEVE aguardar a resposta do aluno. Se a escolha for DaisyUI, execute o Bloco 3.4. Se a escolha for manter o Tailwind puro, pule o Bloco 3.4 e vá direto para o Bloco 3.5 - Conclusão).

## Bloco 3.4: Setup do DaisyUI (Opcional)

Explicação Didática: O DaisyUI fornece componentes rápidos, bonitos e baseados puramente em classes semânticas do Tailwind. Ele é ideal para manter a produtividade alta sem a necessidade de criar componentes HTML complexos do zero.

- Ação de Instalação (Via Expressa): Apresente o comando para instalar a biblioteca no frontend:

npm install -w apps/web daisyui

- Ação de Configuração: Adicione o plugin do DaisyUI no arquivo apps/web/src/styles.css, logo após a importação padrão do Tailwind:

@import "tailwindcss";
@plugin "daisyui";

- Ação de Teste Visual: Altere temporariamente o app.component.html para validar a renderização do framework:

<div class="flex h-screen items-center justify-center bg-base-300">
  <button class="btn btn-error">Teste DaisyUI</button>
</div>
<router-outlet />

🛑 PARADA OBRIGATÓRIA (O Smoke Test Final):

Ação do Aluno: Peça para olhar o navegador em http://localhost:4200.

Pergunta: "O botão vermelho com o estilo polido do DaisyUI renderizou perfeitamente no meio da tela? Se sim, a sua interface está homologada e nossa arquitetura CSS-First foi um sucesso!"

## 🏁 Bloco 3.5: Conclusão do Workflow

- **Limpeza:** Restaure o `app.component.html` para conter apenas `<router-outlet />` e delete arquivos residuais. Sugira rodar o `npm run format`.
- **Git Commit:** Sugira o commit: `git add .` e `git commit -m "feat: core do angular com tailwind 4, http client e spartan ui"`.
- **Próximos Passos:** Informe ao aluno que agora temos um Backend que responde (Workflow 2) e um Frontend que renderiza estilos profissionais. O próximo grande desafio é conectar o nosso ecossistema a um Banco de Dados de verdade utilizando o **Workflow 4 (Prisma + Docker)**.
