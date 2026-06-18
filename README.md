# Boole

Boole é um tutor de programação baseado em inteligência artificial, desenvolvido para auxiliar alunos iniciantes no aprendizado de lógica e programação. O sistema responde dúvidas sem fornecer código ou soluções prontas, em vez disso, explica conceitos, usa analogias e guia o aluno com perguntas, promovendo o raciocínio independente.

---

## Stack

**Backend**
- Python 3.8+ com Flask
- SQLite para persistência de dados
- Flask-Session para gerenciamento de sessões (filesystem)
- Google Gemini API (`gemini-2.5-flash` / `gemini-2.5-pro`) para o tutor IA
- Werkzeug para hash de senhas
- Gunicorn como servidor de produção

**Frontend**
- HTML/CSS/JavaScript
- Jinja2 templates
- Arquivos estáticos em `static/` (CSS, JS, imagens)

---

## Estrutura do projeto

```
boole/
├── app.py                  # Aplicação Flask (rotas, autenticação, histórico)
├── boole.py                # Integração com Google Gemini API
├── db_init.py              # Inicialização do banco de dados
├── funcoes.py              # Funções auxiliares e decorador @login_required
├── test_app.py             # Suite de testes automatizados (pytest)
├── requirements.txt        # Dependências
├── dados.db                # Banco SQLite (gerado automaticamente)
├── .env.local              # Variáveis de ambiente (não commitar)
├── .gitignore
│
├── templates/
│   ├── index.html          # Página principal do chat
│   ├── login.html          # Página de login
│   ├── signup.html         # Página de criação de conta
│   ├── perfil.html         # Página de perfil do usuário
│   ├── debug.html          # Página de modo debug
│   └── sidebar.html        # Componente sidebar
│
├── static/
│   ├── behavior/           # JavaScript por página
│   ├── style/              # CSS por página
│   └── images/             # Ícones e imagens
│
└── docs/
    ├── requisitos.md
    ├── estrutura.txt
    └── entregas.md
```

---

## Como rodar localmente

### 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd boole
```

### 2. Criar ambiente virtual

```bash
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows
```

### 3. Instalar dependências

```bash
pip install -r requirements.txt
```

### 4. Configurar variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
GEMINI_API_KEY=sua_chave_aqui
```

Obtenha sua chave gratuitamente em: https://aistudio.google.com/apikey

### 5. Inicializar o banco de dados

```bash
python db_init.py
```

### 6. Rodar a aplicação

```bash
python app.py
```

Acesse: http://localhost:5000

---

## Deploy

A aplicação está hospedada no [Render](https://render.com).

### Plataforma

| Item | Valor |
|------|-------|
| Plataforma | Render |
| Servidor | Gunicorn |
| Comando de start | `gunicorn app:app` |
| Branch de produção | `main` |

### Variáveis de ambiente

No painel do Render, configure:

| Variável | Descrição |
|----------|-----------|
| `GEMINI_API_KEY` | Chave de acesso à API do Google Gemini |

**Importante:** nunca suba o arquivo `.env.local` para o repositório. A chave deve ser configurada exclusivamente pelo painel da plataforma.

### Observações

- O banco de dados SQLite (`dados.db`) é local ao servidor do Render e é recriado a cada novo deploy — os dados não persistem entre deploys.
- As sessões (`flask_session/`) também são armazenadas localmente e são perdidas a cada redeploy.
- O Render faz deploy automático a cada push na branch `main`.
- O `debug=False` já está configurado em `app.py` para o ambiente de produção.

---

## Rotas da API

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| GET | `/` | Redireciona para `/chat` | — |
| GET | `/chat` | Página do chat (nova conversa) | Não obrigatória |
| GET | `/chat/<id_chat>` | Página do chat (conversa existente) | Não obrigatória |
| POST | `/chat` | Enviar dúvida (nova conversa) | Não obrigatória |
| POST | `/chat/<id_chat>` | Enviar dúvida (conversa existente) | Não obrigatória |
| DELETE | `/chat/<id_chat>` | Deletar conversa | Não obrigatória |
| GET | `/api/chat/<id_chat>` | Obter mensagens de um chat | Obrigatória |
| GET | `/api/listar_chats` | Listar chats do usuário | Obrigatória |
| GET | `/debug` | Página de modo debug | — |
| POST | `/debug` | Iniciar chat em modo debug | — |
| GET | `/continuar-sem-login` | Iniciar sessão anônima | — |
| GET | `/login` | Página de login | — |
| POST | `/login` | Autenticar usuário | — |
| POST | `/criar-conta` | Registrar novo usuário | — |
| POST | `/perfil` | Atualizar dados do perfil | Obrigatória |
| GET | `/logout` | Encerrar sessão | — |

Usuários anônimos podem usar o chat, mas as dúvidas não são salvas e o histórico não está disponível.

---

## Banco de dados

```sql
CREATE TABLE usuarios (
    usuario TEXT PRIMARY KEY,
    nome    TEXT NOT NULL,
    senha   TEXT NOT NULL
);

CREATE TABLE duvidas (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario      TEXT NOT NULL,
    pergunta     TEXT NOT NULL,
    resposta     TEXT NOT NULL,
    nome_chat    TEXT NOT NULL,
    id_chat      TEXT NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario) REFERENCES usuarios(usuario)
);

CREATE TABLE codigos (
    id_chat TEXT NOT NULL,
    codigo  TEXT NOT NULL
);
```

---

## Testes

```bash
pytest test_app.py -v
```

A suite cobre autenticação, criação de conta, histórico e sessão anônima usando banco de dados em memória — sem dependência do `dados.db` real e sem chamadas à API do Gemini.

---

## Segurança

- Senhas armazenadas com hash (Werkzeug)
- Queries SQL com prepared statements — sem concatenação de strings
- Isolamento de dados por usuário em todas as queries
- Sessões armazenadas no servidor (filesystem), não em cookies
- Headers de cache control para prevenir acesso a versões antigas

---

## Equipe

| Nome | Papel |
|------|-------|
| Gabriela Benevides | Product Owner, Scrum Master, Front-end |
| Guilherme Calistrato | Líder Técnico, Back-end, Front-end, Integração |
| Luiz Henrique Falcão | Líder Back-end, Banco de Dados, Engenharia de Prompt |
| Leon Galvão | Líder Front-end, UI/UX |
| Ithalo Ferreira | Desenvolvedor Front-end |
| Keroly Santos | QA e Testes |
| Rafael Cardoso | Desenvolvedor Front-end |

UFPE — Centro de Informática