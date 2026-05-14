# Entregas

## Entrega 1 – Integração inicial com a API Gemini

### Chamadas básicas com exemplos fixos

Para validar a comunicação inicial com a API do modelo Gemini foi implementado o script `test_boole.py`. Esse script realiza uma chamada simples à API utilizando um prompt fixo e imprime a resposta retornada pelo modelo no terminal.

O objetivo dessa etapa é verificar se o sistema consegue:

- autenticar utilizando a chave da API;
- enviar uma requisição ao modelo;
- receber e exibir a resposta gerada.

```bash
python test_boole.py
```

### Código mínimo funcional

Para implementar um exemplo funcional de interação com a API foi desenvolvido o script `run_boole.py`. Esse script permite que o usuário informe uma pergunta diretamente pelo terminal. A pergunta é enviada ao modelo Gemini, que gera uma resposta textual exibida no terminal.

Diferentemente do teste anterior, esse script permite **entrada dinâmica do usuário**, caracterizando um código mínimo funcional capaz de receber dados, processá-los por meio da API e retornar uma resposta.

```bash
python run_boole.py "Explique o que é uma variável"
```

### Extensão complementar – Interface com Streamlit

Como evolução da implementação, foi adicionada uma interface web simples utilizando Streamlit, permitindo interação com o modelo de linguagem de forma mais intuitiva via navegador.

```bash
streamlit run app.py
```

---

## Entrega 2 – Sistema web completo com autenticação, histórico e tutor IA

A segunda entrega representa uma evolução significativa em relação ao protótipo inicial. O sistema foi completamente reestruturado: saiu de scripts isolados de terminal para uma aplicação web funcional com backend Flask, banco de dados persistente, autenticação de usuários e interface frontend integrada.

### Backend (app.py)

Aplicação Flask com as seguintes rotas:

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/` | Página principal do chat |
| POST | `/` | Enviar dúvida ao Boole e receber resposta |
| POST | `/continuar-sem-login` | Iniciar sessão anônima |
| GET/POST | `/login` | Autenticação de usuário |
| GET/POST | `/criar-conta` | Registro de novo usuário |
| GET | `/historico` | Listar histórico de dúvidas do usuário |
| GET | `/historico/<id>` | Obter uma dúvida específica |

Usuários autenticados têm as dúvidas salvas automaticamente. Usuários anônimos podem usar o chat, mas sem persistência de histórico.

### Banco de dados (db_init.py)

Banco SQLite com duas tabelas:

```sql
CREATE TABLE usuarios (
    usuario TEXT PRIMARY KEY,
    senha   TEXT NOT NULL
);

CREATE TABLE duvidas (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario      TEXT NOT NULL,
    pergunta     TEXT NOT NULL,
    resposta     TEXT NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario) REFERENCES usuarios(usuario)
);
```

Índice criado em `duvidas(usuario)` para otimizar consultas de histórico.

### Tutor IA (boole.py)

Integração com `gemini-2.5-flash` via `google-genai`. O system prompt foi movido para o parâmetro `system_instruction` da API, garantindo que as restrições pedagógicas (não fornecer código, guiar com perguntas, usar analogias) sejam aplicadas pelo canal correto do modelo.

### Segurança

- Senhas armazenadas com hash via Werkzeug
- Queries SQL com prepared statements — sem concatenação de strings
- Isolamento de dados por usuário em todas as queries de histórico
- Sessões armazenadas no servidor (filesystem), não em cookies
- Headers de cache control para prevenir acesso a versões antigas

### Frontend

Interface web completa com quatro páginas:

- `templates/index.html` — chat com o Boole
- `templates/login.html` — autenticação
- `templates/criar_conta.html` — cadastro
- `templates/sidebar.html` — componente de navegação lateral

Arquivos estáticos organizados em `static/style/` (CSS por página) e `static/behavior/` (JavaScript por página).

### Testes automatizados (test_app.py)

Suite de 13 testes com pytest cobrindo:

- Criação de conta (sucesso, duplicata, senhas diferentes, campos vazios)
- Login (sucesso, senha errada, usuário inexistente)
- Histórico (sem autenticação, usuário anônimo, usuário logado, dúvida inexistente)
- Sessão anônima (iniciar sessão, bloqueio de histórico)

Os testes usam banco de dados em memória e mock do `get_db`, sem dependência do `dados.db` real e sem chamadas à API do Gemini.

### Execução

```bash
# Inicializar banco de dados
python db_init.py

# Rodar a aplicação
python app.py
```

Acesse: http://localhost:5000

```bash
# Rodar testes
pytest test_app.py -v
```