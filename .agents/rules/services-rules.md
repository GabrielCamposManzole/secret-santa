---
trigger: always_on
---

"Sempre que for necessário criar um novo serviço de dados (ex: UserService, ProdutoService), utilize a função moderna inject(SupabaseService) do Angular para importar a conexão. Nunca inicialize o createClient novamente em outros arquivos. Para realizar as operações de banco, chame a instância injetada, por exemplo: this.supabase.client.from('nome_da_tabela')."
