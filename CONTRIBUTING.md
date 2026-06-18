# Guia de Contribuição - Boole

Bem-vindo ao Boole! Este documento descreve como configurar seu ambiente, entender a estrutura do projeto e contribuir com a qualidade esperada.

## Índice

1. [Visão Geral do Projeto](#visão-geral-do-projeto)
2. [Configuração do Ambiente](#configuração-do-ambiente)
3. [Estrutura do Projeto](#estrutura-do-projeto)
4. [Fluxo de Trabalho Git](#fluxo-de-trabalho-git)
5. [Padrões de Código](#padrões-de-código)
6. [Processo de Pull Request](#processo-de-pull-request)
7. [Testes](#testes)
8. [Deploy](#deploy)
9. [Documentação de Endpoints](#documentação-de-endpoints)
10. [Troubleshooting](#troubleshooting)

---

## Visão Geral do Projeto

**Boole** é um sistema de tutoria em inteligência artificial para auxiliar alunos iniciantes no aprendizado de programação. A plataforma oferece:

- **Tutor IA**: Responde dúvidas de código sem entregar solução pronta
- **Histórico**: Armazena dúvidas e respostas anteriores
- **Autenticação**: Isolamento de dados por usuário
- **API REST**: Backend em Flask para integração com frontend

**Stack Técnico:**
- **Backend**: Python 3.x + Flask
- **Database**: SQLite
- **IA**: Google Gemini API
- **Frontend**: HTML/CSS/JavaScript (Jinja2 templates)
- **Session**: Flask-session (armazenamento em filesystem)
- **Produção**: Gunicorn no Render

---

## Configuração do Ambiente

### Pré-requisitos

- Python 3.8+
- Git
- Chave de API do Google Gemini

### Passo 1: Clonar o Repositório

```bash
git clone https://github.com/seu-repositorio/boole.git
cd boole
```

### Passo 2: Criar Ambiente Virtual

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### Passo 3: Instalar Dependências

```bash
pip install -r requirements.txt
```

### Passo 4: Configurar Variáveis de Ambiente

Crie arquivo `.env.local` na raiz do projeto:

```
GEMINI_API_KEY=sua_chave_aqui
FLASK_ENV=development
```

**Importante:** Nunca commit `.env.local` ou `.env`. Eles estão no `.gitignore`.

### Passo 5: Inicializar Banco de Dados

```bash
python db_init.py
```

Isso cria as tabelas `usuarios`, `duvidas` e `codigos` em `dados.db`.

### Passo 6: Rodar a Aplicação

```bash
python app.py
```

Acesse `http://localhost:5000` no navegador.

---

## Estrutura do Projeto

```
boole/
├── app.py                 # Aplicação Flask principal (rotas, autenticação, histórico)
├── boole.py               # Integração com Google Gemini API (tutor IA)
├── db_init.py             # Script de inicialização do banco de dados
├── funcoes.py             # Funções auxiliares e decorador @login_required
├── requirements.txt       # Dependências do projeto
├── dados.db               # Banco de dados SQLite (gerado automaticamente)
├── .env.local             # Variáveis de ambiente (não commit)
├── .gitignore             # Arquivos ignorados pelo git
├── README.md              # Documentação principal do projeto
├── CONTRIBUTING.md        # Este arquivo
│
├── static/
│   ├── images/            # Ícones e imagens
│   │
│   ├── style/             # Arquivos em CSS (estilização)
│   │   ├── index.css
│   │   ├── popup.css
│   │   └── sidebar.css
│   │
│   └── behavior/          # Arquivos em JavaScript (comportamento)
│       ├── index.js
│       ├── debug.js
│       ├── perfil.js
│       └── sidebar.js
│
├── templates/             # Templates HTML (Jinja2)
│   ├── index.html         # Página principal (chat com Boole)
│   ├── login.html         # Página de login
│   ├── signup.html        # Página de criar conta
│   ├── perfil.html        # Página de perfil do usuário
│   ├── debug.html         # Página de modo debug
│   └── sidebar.html       # Componente menu lateral
│
├── docs/                  # Documentação adicional
│   ├── estrutura.txt      # Informações sobre schema SQL
│   ├── requisitos.md      # Requisitos do sistema
│   └── entregas.md        # Histórico de entregas
│
└── flask_session/         # Sessões do usuário (gerado automaticamente)
```

### Arquivos Principais

#### `app.py`
Contém todas as rotas da aplicação:
- `GET /` — Redireciona para `/chat`
- `GET /chat` e `GET /chat/<id_chat>` — Página do chat
- `POST /chat` e `POST /chat/<id_chat>` — Enviar dúvida e receber resposta
- `DELETE /chat/<id_chat>` — Deletar conversa
- `GET /api/chat/<id_chat>` — Obter mensagens de um chat
- `GET /api/listar_chats` — Listar chats do usuário
- `GET|POST /debug` — Página e lógica do modo debug
- `GET /continuar-sem-login` — Iniciar sessão anônima
- `GET /login` e `POST /login` — Autenticação
- `POST /criar-conta` — Registrar novo usuário
- `POST /perfil` — Atualizar dados do perfil
- `GET /logout` — Encerrar sessão

#### `boole.py`
Gerencia integração com Google Gemini API:
- `run_boole(pergunta, usuario, modelo, codigo, num)` — Processa pergunta com histórico e system prompt pedagógico, retorna `(resposta, titulo)`

#### `funcoes.py`
Funções auxiliares:
- `@login_required` — Decorador que protege rotas que exigem autenticação
- `get_db()` — Retorna conexão com o banco para a requisição atual
- `obter_historico_chat(usuario)` — Retorna últimas 20 mensagens no formato Gemini
- `salvar_duvida(...)` — Persiste pergunta e resposta no banco
- `salvar_codigo(codigo, id_chat)` — Salva código para modo debug
- `receber_codigo(id)` — Recupera código de um chat debug
- `criar_id(tamanho)` — Gera ID aleatório para novos chats

---

## Fluxo de Trabalho Git

### Branches

Usamos **feature branches** com merge em `main` via Pull Request:

```
main (produção)
  ↑
  ├── feature/adicionar-historico (seu branch)
  ├── feature/melhorar-prompt
  ├── feature/fixes-ui
  └── ...
```

### Nomes de Branches

Use convenção clara:

```bash
# Features novas
feature/descrição-da-feature

# Correções de bugs
fix/descrição-do-bug

# Melhorias de código
refactor/descrição

# Documentação
docs/descrição
```

**Exemplos:**
```bash
git checkout -b feature/adicionar-menu-lateral
git checkout -b fix/validacao-form-login
git checkout -b refactor/otimizar-queries-db
```

### Fluxo Padrão

```bash
# 1. Criar branch a partir de main
git checkout main
git pull origin main
git checkout -b feature/sua-feature

# 2. Fazer commits locais
git add <arquivos>
git commit -m "Mensagem clara e descritiva"

# 3. Fazer push para remoto
git push origin feature/sua-feature

# 4. Abrir Pull Request no GitHub

# 5. Após merge, deletar branch local
git checkout main
git pull origin main
git branch -d feature/sua-feature
```

### Mensagens de Commit

Use padrão imperativo e claro:

```bash
# ✅ Bom
git commit -m "Adicionar rota de histórico de dúvidas"
git commit -m "Corrigir validação de email no login"
git commit -m "Refatorar função get_db para usar context"

# ❌ Ruim
git commit -m "fixes"
git commit -m "corrigir algumas coisas"
git commit -m "WIP"
```

---

## Padrões de Código

### Python (Backend)

**Formatação:**
- Indentação: 4 espaços
- Máximo 100 caracteres por linha
- Use snake_case para variáveis e funções

**Exemplo:**
```python
def obter_historico(usuario):
    """
    Obtém todas as dúvidas de um usuário.

    Args:
        usuario (str): Nome de usuário

    Returns:
        list: Lista de dúvidas com id, pergunta, resposta, data_criacao
    """
    try:
        db = get_db()
        cursor = db.execute(
            """SELECT id, pergunta, resposta, data_criacao
               FROM duvidas
               WHERE usuario = ?
               ORDER BY data_criacao DESC""",
            (usuario,)
        )
        return [dict(row) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Erro ao obter histórico: {e}")
        return []
```

**Práticas Obrigatórias:**
- Sempre use **prepared statements** para SQL (protege contra injection):
  ```python
  # ✅ Correto
  db.execute("SELECT * FROM usuarios WHERE usuario = ?", (usuario,))

  # ❌ Errado - NUNCA faça isso
  db.execute(f"SELECT * FROM usuarios WHERE usuario = '{usuario}'")
  ```

- Tratamento de exceções:
  ```python
  try:
      # código
  except Exception as e:
      print(f"Erro descritivo: {e}")
      return valor_padrao
  ```

- Validação de entrada:
  ```python
  usuario = dados.get('usuario', '').strip()
  if not usuario:
      return {"erro": "Usuário é obrigatório"}, 400
  ```

### JavaScript (Frontend)

- Indentação: 2 espaços
- Use `const` por padrão, `let` quando necessário
- Evite `var`
- Use IIFE para encapsular lógica de módulo e evitar poluição do escopo global

**Exemplo:**
```javascript
async function enviarDuvida(duvida) {
  try {
    const response = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ duvida })
    });

    const data = await response.json();
    return data.resultado;
  } catch (error) {
    console.error('Erro ao enviar dúvida:', error);
    return null;
  }
}
```

### SQL (Banco de Dados)

Qualquer modificação de schema deve:
1. Ser documentada em `docs/estrutura.txt`
2. Ter um script de migração
3. Ser testado com dados reais

```sql
-- ✅ Bom
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

-- Sempre usar prepared statements em Python:
db.execute(
    "INSERT INTO duvidas (usuario, pergunta, resposta, nome_chat, id_chat) VALUES (?, ?, ?, ?, ?)",
    (usuario, pergunta, resposta, nome_chat, id_chat)
)
```

---

## Processo de Pull Request

### Antes de Fazer o PR

1. **Verificar mudanças locais:**
   ```bash
   git status
   git diff main...your-branch
   ```

2. **Executar testes locais:**
   ```bash
   pytest test_app.py -v
   ```

3. **Atualizar com main:**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

### Template de PR

Ao abrir um PR, use este template:

```markdown
## Descrição

Uma descrição clara do que foi implementado.

## Tipo de Mudança

- [ ] Nova feature
- [ ] Correção de bug
- [ ] Refatoração
- [ ] Documentação
- [ ] Outro

## Mudanças Técnicas

Descrever em tópicos as mudanças técnicas implementadas nessa branch (ex.: feature de menu lateral com funcionalidades básicas em JS; correção de bug no comportamento do chat; polimento da UX)

## Checklist

- [ ] Código segue padrões do projeto
- [ ] Testes estão passando
- [ ] Documentação foi atualizada
- [ ] Não há breaking changes
- [ ] Prepared statements usados para SQL
- [ ] Validação de entrada implementada

## Como Testar

1. `python db_init.py`
2. `python app.py`
3. Acessar `http://localhost:5000`
4. Criar conta e testar novo endpoint

## Screenshots/Logs

Se aplicável, inclua prints do teste.

## Próximos passos

Descrever em tópicos próximas ações ou pendências.
```

### Revisão de Código

Todo PR precisa de **pelo menos 2 aprovações** antes de merge:
- 1 do líder técnico (Guilherme)
- 1 do líder backend (Luiz) ou QA (Keroly)

**Comentários esperados:**
- Segurança (SQL injection, XSS, autenticação)
- Performance (queries eficientes, caching)
- Testes (cobertura, edge cases)
- Documentação (clara e atualizada)

---

## Testes

### Testes Automatizados

Execute antes de fazer PR:

```bash
pytest test_app.py -v
```

**O que é testado:**
- ✅ Criação de conta (sucesso, duplicado, senhas divergentes, campos vazios)
- ✅ Login (sucesso, senha errada, usuário inexistente)
- ✅ Histórico (sem autenticação, sessão anônima, usuário logado, dúvida inexistente)
- ✅ Sessão anônima (`/continuar-sem-login`)

### Testes Manuais

Sempre teste localmente:

1. **Criar conta nova:**
   - Acessar `/chat` e clicar em criar conta
   - Preencher nome, usuário, senha, confirmar
   - Verificar se redireciona para o chat autenticado

2. **Login:**
   - Acessar `/login`
   - Usar credenciais criadas
   - Verificar se acessa `/chat`

3. **Chat com Boole:**
   - Enviar pergunta: "O que é uma variável?"
   - Verificar se resposta aparece
   - Verificar se conversa aparece na sidebar

4. **Modo debug:**
   - Acessar `/debug`
   - Colar um código e iniciar chat
   - Verificar se o Boole contextualiza o código nas respostas

---

## Deploy

### Plataforma

O projeto é hospedado no [Render](https://render.com) a partir da branch `main`.

### Servidor de produção

Em produção, o servidor de desenvolvimento do Flask é substituído pelo **Gunicorn**. O comando de start configurado no Render é:

```bash
gunicorn app:app
```

O Gunicorn já está listado em `requirements.txt` e não requer configuração adicional no código.

### Variáveis de ambiente

Configure no painel do Render (Settings → Environment):

| Variável | Descrição |
|----------|-----------|
| `GEMINI_API_KEY` | Chave de acesso à API do Google Gemini |

Nunca inclua `.env.local` no repositório — ele está no `.gitignore`.

### Limitações do ambiente de produção

- **Banco de dados:** o SQLite (`dados.db`) é armazenado localmente no servidor do Render e é apagado a cada novo deploy. Para persistência de dados em produção, seria necessário migrar para um banco externo (ex: PostgreSQL).
- **Sessões:** os arquivos de sessão (`flask_session/`) também são locais e perdidos a cada redeploy.

### Subir uma nova versão

O Render faz deploy automático a cada push na branch `main`. O fluxo é:

```
sua branch → PR → merge em main → deploy automático no Render
```

Não é necessário nenhum comando manual para atualizar a aplicação em produção.

---

## Documentação de Endpoints

### GET /

**Descrição:** Redireciona para `/chat`

---

### GET /chat e GET /chat/\<id_chat\>

**Descrição:** Página principal do chat. Sem `id_chat` inicia nova conversa; com `id_chat` carrega conversa existente.

**Proteção:** Não obrigatória — usuários anônimos podem usar o chat

**Response:** HTML da página index.html

---

### POST /chat e POST /chat/\<id_chat\>

**Descrição:** Enviar dúvida e receber resposta do tutor IA

**Proteção:** Não obrigatória — dúvidas de usuários anônimos não são salvas

**Request Body:**
```json
{
  "duvida": "Como fazer um loop em Python?",
  "num": 0,
  "modelo": "flash"
}
```

**Response (200):**
```json
{
  "resultado": "Um loop permite repetir código...",
  "titulo": "Loops em Python",
  "id_chat": "ABC123XYZ",
  "novo_chat": true,
  "debug": false
}
```

**Response (400):**
```json
{
  "erro": "Dúvida não pode estar vazia"
}
```

---

### DELETE /chat/\<id_chat\>

**Descrição:** Deletar uma conversa e todas as suas mensagens

**Response (200):**
```json
{
  "mensagem": "Conversa deletada com sucesso"
}
```

**Response (404):**
```json
{
  "erro": "Conversa não encontrada"
}
```

---

### GET /api/chat/\<id_chat\>

**Descrição:** Obter todas as mensagens de um chat específico

**Proteção:** Obrigatória + isolamento por usuário

**Response (200):**
```json
{
  "mensagens": [
    {"pergunta": "O que é uma variável?", "resposta": "Uma variável é..."}
  ],
  "nome_chat": "Variáveis em Python"
}
```

---

### GET /api/listar_chats

**Descrição:** Listar todos os chats do usuário autenticado

**Proteção:** Obrigatória

**Response (200):**
```json
{
  "chats": [
    {"id_chat": "ABC123", "nome_chat": "Loops em Python"},
    {"id_chat": "XYZ456", "nome_chat": "Recursão"}
  ]
}
```

---

### GET /debug e POST /debug

**Descrição:** Modo debug — permite enviar um código para o Boole analisar durante o chat

**POST Request Body:**
```json
{
  "codigo": "def soma(a, b):\n    return a + b"
}
```

**POST Response (200):**
```json
{
  "redirect": "/chat/ABC123XYZ"
}
```

---

### GET /continuar-sem-login

**Descrição:** Inicia sessão anônima e redireciona para o chat

---

### GET /login e POST /login

**Descrição:** Página de login e autenticação

**POST Request Body:**
```json
{
  "usuario": "seu_usuario",
  "senha": "sua_senha"
}
```

**POST Response (200):**
```json
{
  "redirect": "/chat",
  "usuario": "seu_usuario"
}
```

**POST Response (401):**
```json
{
  "erro": "Usuário ou senha inválidos"
}
```

---

### POST /criar-conta

**Descrição:** Registrar novo usuário

**Request Body:**
```json
{
  "nome": "Nome Completo",
  "usuario": "email@exemplo.com",
  "senha": "senha_forte",
  "senha_confirma": "senha_forte"
}
```

**Response (200):**
```json
{
  "redirect": "/chat",
  "usuario": "email@exemplo.com"
}
```

**Response (400):**
```json
{
  "erro": "Esse email já está sendo utilizado!"
}
```

---

### POST /perfil

**Descrição:** Atualizar dados do perfil do usuário autenticado

**Request Body:**
```json
{
  "nome": "Novo Nome",
  "usuario": "novo@email.com",
  "senha": "nova_senha",
  "senha_confirma": "nova_senha"
}
```

**Response (200):**
```json
{
  "redirect": "/chat"
}
```

---

### GET /logout

**Descrição:** Encerra a sessão e redireciona para `/chat`

---

## Troubleshooting

### "ModuleNotFoundError: No module named 'flask'"

**Solução:**
```bash
pip install -r requirements.txt
```

Certifique-se de estar em ambiente virtual ativado.

### "GEMINI_API_KEY não encontrada no .env.local"

**Solução:**
1. Crie arquivo `.env.local` na raiz
2. Adicione sua chave:
   ```
   GEMINI_API_KEY=sua_chave_aqui
   ```
3. Obtenha chave em: https://aistudio.google.com/apikey

### "Erro ao abrir banco de dados: dados.db"

**Solução:**
```bash
python db_init.py
```

Se persistir, delete `dados.db` e crie novamente.

### "Port 5000 already in use"

**Solução:**
```bash
# Encontrar processo usando porta 5000
lsof -i :5000

# Matar processo
kill -9 <PID>
```

### "Prepared statement error"

**Lembre-se:**
```python
# ✅ Correto - com placeholders
db.execute("SELECT * FROM usuarios WHERE usuario = ?", (usuario,))

# ❌ Errado - concatenação de string
db.execute(f"SELECT * FROM usuarios WHERE usuario = '{usuario}'")
```

### "Usuário não isolado no histórico"

**Garantir isolamento:**
```python
# ✅ Sempre usar session.get("user_id") no WHERE
usuario = session.get("user_id")
db.execute(
    "SELECT * FROM duvidas WHERE usuario = ?",
    (usuario,)
)
```

---

## Contato e Dúvidas

- **Issues GitHub:** Abra uma issue para bugs ou dúvidas
- **Discussões:** Use discussions para ideias e features
- **Equipe:** Entre em contato com líderes se precisar de ajuda

---

**Última atualização:** Junho 2026
**Versão:** 1.2