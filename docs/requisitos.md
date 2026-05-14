# Requisitos

## Requisitos funcionais

### Entrega 1

O sistema deve:

- realizar chamadas para a API do modelo de linguagem Gemini;
- enviar uma pergunta textual ao modelo;
- receber e exibir uma resposta textual gerada pela API;
- permitir a execução de um teste utilizando um prompt fixo para validar a comunicação com a API;
- permitir que o usuário informe uma pergunta pelo terminal;
- permitir interação por meio de uma interface web simples utilizando Streamlit (extensão complementar);
- orientar o usuário na resolução de problemas sem fornecer código ou solução pronta.

### Entrega 2

O sistema deve:

- permitir criação de conta com usuário e senha;
- autenticar usuários com credenciais válidas;
- permitir uso do chat sem cadastro, em modo anônimo;
- salvar automaticamente as dúvidas e respostas de usuários autenticados no banco de dados;
- exibir o histórico completo de dúvidas de um usuário autenticado;
- permitir consulta de uma dúvida específica do histórico por identificador;
- bloquear acesso ao histórico para usuários não autenticados e anônimos;
- disponibilizar interface web com páginas de chat, login, cadastro e navegação lateral;
- integrar frontend e backend via requisições assíncronas (fetch/JSON).

---

## Requisitos não funcionais

### Entrega 1

O sistema deve:

- armazenar a chave da API utilizando variável de ambiente;
- utilizar bibliotecas oficiais ou recomendadas para acesso à API Gemini;
- possuir código simples e organizado para facilitar manutenção e evolução do projeto;
- permitir execução direta a partir do terminal;
- permitir execução de interface web local via Streamlit;
- possuir documentação básica para execução e compreensão do sistema;
- garantir que as respostas do modelo sigam restrições pedagógicas (ex: não fornecer código).

### Entrega 2

O sistema deve:

- armazenar senhas com hash criptográfico, nunca em texto plano;
- utilizar prepared statements em todas as queries SQL para prevenção de SQL injection;
- isolar os dados de cada usuário — nenhum usuário pode acessar dados de outro;
- armazenar sessões no servidor (filesystem), não em cookies do cliente;
- aplicar headers de cache control para impedir acesso a versões antigas de páginas;
- persistir dados em banco de dados relacional (SQLite) com integridade referencial;
- possuir suite de testes automatizados cobrindo autenticação, histórico e sessão anônima;
- garantir que os testes sejam isolados do banco de dados real (uso de banco em memória).