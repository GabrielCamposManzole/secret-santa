[x] A1 - Design e Experiência do Usuário (UI/UX) com IA
Competência: O aluno compreende que código sem usabilidade não tem valor e domina ferramentas de IA para acelerar o design (Design-to-Code), mantendo o rigor técnico da experiência do usuário.

[x] ID1: Desenvolver protótipos navegáveis (ex: gerados via Stitch e refinados no Figma) que demonstram compreensão das diretrizes de usabilidade, com link público disponibilizado no repositório.

[x] ID2: Projetar interfaces responsivas com a abordagem Mobile-First, garantindo que o layout se adapte perfeitamente a diferentes resoluções (celulares, tablets e desktops).

[x] ID3: Projetar a experiência de aplicativo nativo (PWA), configurando o manifest.webmanifest (ícones, cores de tema, splash screen e modo de exibição standalone) e prevendo o comportamento visual da interface em estados offline.

[x] RA2 - Componentização e UI Declarativa Moderna
Competência: O aluno domina a construção de blocos visuais independentes, performáticos e reutilizáveis utilizando a arquitetura moderna do Angular.

[x] ID3: Desenvolver componentes utilizando estritamente a arquitetura Standalone (sem o uso de NgModules).

[x] ID4: Incorporar e customizar componentes utilizando um Framework CSS moderno (ex: Tailwind CSS, PrimeNG).

[x] ID5: Aplicar a nova sintaxe de fluxo de controle (@if / @switch) para exibição condicional de elementos.

[x] ID6: Utilizar a nova sintaxe de fluxo de controle @for com a propriedade track obrigatória para a renderização dinâmica e otimizada de coleções.

[x] ID7: Aplicar Pipes (nativos ou customizados) para formatar a apresentação de dados na interface.

[x] ID8: Implementar Deferrable Views (@defer) para otimizar a performance, carregando componentes pesados apenas sob demanda.

[x] RA3 - Reatividade e Gerenciamento de Estado (Signals)
Competência: O aluno entende como o fluxo de dados altera a interface de forma reativa e granular, sem manipulação direta do DOM.

[x] ID9: Aplicar técnicas de one-way data binding (Interpolação {{ }} e Property Binding [ ]) para exibir e atualizar dados, utilizando estritamente Signals (writable e computed) como fonte de estado.

[x] ID10: Aplicar técnicas de event binding ( ) para capturar interações do usuário e atualizar o estado da aplicação.

[x] ID11: Aplicar técnicas de two-way data binding utilizando a função moderna model() para sincronização bidirecional.

[x] ID12: Utilizar efeitos (effect()) para a manipulation segura de efeitos colaterais reativos.

[x] RA4 - Arquitetura de Software e Injeção de Dependências
Competência: O aluno sabe separar responsabilidades, isolando a lógica de negócios da camada de visualização.

[x] ID13: Utilizar as funções modernas input() e output() para a comunicação segura e tipada entre componentes em uma hierarquia (pai/filho).

[x] ID14: Criar comunicação entre componentes não relacionados hierarquicamente extraindo a lógica para Services, utilizando a função inject() em vez de injeção via construtor.

[x] RA5 - Roteamento e Navegação SPA (Single Page Application)
Competência: O aluno consegue criar uma experiência de navegação fluida, segura e de alta performance.

[x] ID15: Configurar rotas dinâmicas utilizando a API funcional moderna (provideRouter e withComponentInputBinding).

[x] ID16: Passar e consumir dados entre telas recebendo parâmetros de rota diretamente como @Input() nos componentes.

[x] ID17: Criar uma estrutura de navegação aninhada (rotas filhas) para representar hierarquias de layout.

[x] ID18: Aplicar Functional Route Guards para controle de acesso (autenticação) e Resolvers para pré-carregamento de dados antes da transição da tela.

[x] RA6 - Integração de APIs e Assincronismo (BaaS)
Competência: O aluno sabe conectar o frontend ao mundo externo, gerenciando requisições, segurança e estado assíncrono.

[x] ID19: Realizar requisições assíncronas (GET) a uma API pública.

[x] ID20: Implementar o fluxo de Autenticação e Gerenciamento de Sessão (JWT) conectando a aplicação aos serviços de identidade do BaaS (ex: Supabase Auth).

[x] ID21: Realizar o ciclo completo de operações CRUD (GET, POST, PUT, PATCH, DELETE) conectando a aplicação a um Backend-as-a-Service (ex: Supabase, PocketBase).

[x] ID22: Implementar Functional Interceptors para injetar tokens de autenticação globalmente e tratar erros de forma centralizada.

[x] ID23: Aplicar validações em Formulários Reativos, exibindo mensagens de erro claras e desabilitando o botão de submit com base na validade do formulário.

[x] ID24: Fazer a ponte entre o assincronismo e a reatividade utilizando toSignal() e toObservable(), integrando RxJS com o ecossistema de Signals.

[x] RA7 - Engenharia de Software, Versionamento e DevOps
Competência: O aluno trabalha com padrões de mercado para gerenciamento de código, colaboração e entrega contínua.

[x] ID25: Criar e gerenciar um repositório no GitHub utilizando a estrutura ágil do Gitflow (branches main e develop).

[x] ID26: Colaborar ativamente realizando integrações via Pull Requests e resolução de conflitos.

[x] ID27: Planejar, executar o processo de build moderno e realizar o deploy automatizado da aplicação em ambiente de produção (ex: GitHub Pages, Vercel).

[x] RA8 - Engenharia de Software Assistida por IA (Spec-Driven Development e Orquestração)
Competência: O aluno atua como Arquiteto de Software, utilizando a metodologia Spec-Driven Development (SDD) para planejar, especificar e orquestrar agentes de IA. Ele domina ferramentas avançadas (MCP, Skills) para gerar código de forma previsível, evitando o "Vibe Coding".

[x] ID28 - Escopo e Gestão Ágil: Utilizar IA Generativa para a ideação e redação de User Stories. Cadastrar e gerenciar essas histórias como Issues em um Kanban no GitHub Projects.

[x] ID29 - Fundações (PRD): Apoiar-se na IA para estruturar o Documento de Requisitos do Produto (prd.md).

[x] ID30 - Especificação Técnica: A partir do PRD, instruir a IA a gerar um documento de especificação rigoroso (ssd.md), detalhando explicitamente a arquitetura dos componentes Standalone e Services antes da geração do código fonte.

[x] ID31 - Orquestração (MCP e Skills): Configurar a IDE (ex: Antigravity) ativando Servidores MCP (Model Context Protocol, ex: Figma, Supabase) e utilizando Skills de Angular 20+ para que o Agente gere o código com o contexto exato do projeto.

[x] ID32 - Validação e Testes (TDD): Atuar como revisor técnico da IA. Orientar o agente a gerar testes unitários (.spec.ts) focados nas regras de negócio para validar rigorosamente a implementação gerada.como revisor técnico da IA. Orientar o agente a gerar testes unitários (.spec.ts) focados nas regras de negócio para validar rigorosamente a implementação gerada.
