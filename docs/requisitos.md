# Requisitos

## Requisitos funcionais

O sistema deve:

- realizar chamadas para a API do modelo de linguagem Gemini;
- enviar uma pergunta textual ao modelo com instruções pedagógicas via system prompt;
- receber e exibir a resposta textual gerada pela API;
- orientar o usuário na resolução de problemas sem fornecer código ou solução pronta;
- permitir que o usuário envie perguntas por meio de uma interface web em Flask;
- permitir autenticação de usuários com usuário e senha;
- permitir uso anônimo do chat (sem salvar histórico);
- salvar o histórico de dúvidas e respostas para usuários autenticados;
- exibir o histórico de dúvidas do usuário autenticado;
- isolar os dados de histórico por usuário (um usuário não acessa dúvidas de outro).

---

## Requisitos não funcionais

O sistema deve:

- armazenar a chave da API utilizando variável de ambiente (`.env.local`);
- utilizar bibliotecas oficiais ou recomendadas para acesso à API Gemini;
- possuir código simples e organizado para facilitar manutenção e evolução do projeto;
- armazenar senhas com hash seguro (Werkzeug);
- utilizar prepared statements em todas as queries SQL (proteção contra SQL injection);
- gerenciar sessões no servidor (filesystem), não em cookies;
- garantir que as respostas do modelo sigam restrições pedagógicas (não fornecer código, pseudocódigo ou soluções prontas);
- possuir suite de testes automatizados cobrindo autenticação, histórico e sessão anônima;
- possuir documentação básica para execução e compreensão do sistema.