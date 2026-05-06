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
8. [Documentação de Endpoints](#documentação-de-endpoints)
9. [Troubleshooting](#troubleshooting)

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

Isso cria as tabelas `usuarios` e `duvidas` em `dados.db`.

### Passo 6: Rodar a Aplicação

```bash
flask run
```

Acesse `http://localhost:5000` no navegador.

---

Se quiser ver as alterações no código rodando em tempo real, execute:

```bash
flask --app app.py run --debug
```


## Estrutura do Projeto

```
boole/
├── app.py                 # Aplicação Flask principal (rotas, autenticação, histórico)
├── boole.py               # Integração com Google Gemini API (tutor IA)
├── db_init.py             # Script de inicialização do banco de dados
├── funcoes.py             # Funções auxiliares (decorador @login_required)
├── requirements.txt       # Dependências do projeto
├── test_app.py            # Testes automatizados
├── dados.db               # Banco de dados SQLite (gerado automaticamente)
├── .env.local             # Variáveis de ambiente (não commit)
├── .gitignore             # Arquivos ignorados pelo git
├── README.md              # Documentação principal do projeto
├── CONTRIBUTING.md        # Este arquivo
│
├── static/                 # Recursos estáticos (Jinja2)
│   │
│   ├── images/             # Imagens usadas no site
│   │
│   ├── style/              # Arquivos em CSS (estilização)    
│   │   ├── index.css       # Estilo da página principal 
│   │   ├── login.css       # Estilo do componente de login/signup
│   │   └── sidebar.css     # Estilo do componente menu lateral
│   │
│   └── behavior/           # Arquivos em JavaScript (comportamento)
│       ├── signup.js       # Comportamento (funções) do componente de criar conta  
│       ├── index.js        # Comportamento (funções) da página principal 
│       ├── login.js        # Comportamento (funções) do componente de login
│       ├── logout.js       # Comportamento (funções) do botão de logout
│       └── sidebar.js      # Comportamento (funções) do componente menu lateral
│
├── templates/             # Templates HTML (Jinja2)
│   ├── index.html         # Página principal (chat com Boole)
│   ├── login.html         # Componente pop-up de login/signup
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
- `GET /` - Página inicial (chat com Boole)
- `POST /` - Enviar dúvida e salvar resposta
- `GET /historico` - Obter todas as dúvidas do usuário
- `GET /historico/<id>` - Obter dúvida específica
- `GET /login` - Página de login
- `POST /login` - Autenticar usuário
- `GET /criar-conta` - Página de criar conta
- `POST /criar-conta` - Registrar novo usuário

#### `boole.py`
Gerencia integração com Google Gemini API:
- `run_boole(pergunta)` - Processa pergunta e retorna resposta do tutor

#### `funcoes.py`
Funções auxiliares:
- `@login_required` - Decorador que protege rotas

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
feature/descrição-da-feature/nome-autor

# Correções de bugs
fix/descrição-do-bug/nome-autor

# Melhorias de código
refactor/descrição/nome-autor

# Documentação
docs/descrição/nome-autor
```

**Exemplos:**
```bash
git checkout -b feature/menu-lateral/luiz
git checkout -b fix/validacao-form-login/gui
git checkout -b refactor/otimizar-queries-db/leon
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
# (ou no GitLab/Gitea conforme sua plataforma)

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

**Exemplo:**
```javascript
// Enviar dúvida para backend
async function enviarDuvida(duvida) {
  try {
    const response = await fetch('/', {
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
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario TEXT NOT NULL,
    pergunta TEXT NOT NULL,
    resposta TEXT NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario) REFERENCES usuarios(usuario)
);

-- Sempre usar prepared statements em Python:
db.execute(
    "INSERT INTO duvidas (usuario, pergunta, resposta) VALUES (?, ?, ?)",
    (usuario, pergunta, resposta)
)
```

---

## Processo de Pull Request

### Antes de Fazer o PR

1. **Verify local changes:**
   ```bash
   git status
   git diff main...your-branch
   ```

2. **Executar testes locais:**
   ```bash
   python test_app_extended.py
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
- [ ] Não há breakings changes
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

### Revisão de Code

Todo PR precisa de **pelo menos 2 aprovações** antes de merge:
- 1 do líder técnico (Guilherme)
- 1 do líder backend (Luiz) ou QA (Keroly) ou PO (Gabriela)

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
python test_app_extended.py
```

**O que é testado:**
- ✅ Banco de dados criado corretamente
- ✅ Prepared statements usados (proteção SQL injection)
- ✅ Isolamento por usuário (user_id no WHERE)
- ✅ Rotas implementadas
- ✅ Função salvar_duvida funciona

### Testes Manuais

Sempre teste localmente:

1. **Criar conta nova:**
   - Acessar `/criar-conta`
   - Preencher usuário, senha, confirmar
   - Verificar se redireciona para login

2. **Login:**
   - Acessar `/login`
   - Usar credenciais criadas
   - Verificar se acessa `/` (chat)

3. **Chat com Boole:**
   - Enviar pergunta: "O que é uma variável?"
   - Verificar se resposta aparece
   - Verificar se histórico atualiza

4. **Histórico:**
   - Clicar em "Minhas Dúvidas"
   - Verificar se todas as dúvidas aparecem
   - Clicar em uma dúvida e verificar detalhes

---

## Documentação de Endpoints

### GET /

**Descrição:** Página principal (chat com Boole)

**Proteção:** Requer login (`@login_required`)

**Response:**
- HTML da página index.html

---

### POST /

**Descrição:** Enviar dúvida e receber resposta do tutor IA

**Proteção:** Requer login

**Request Body:**
```json
{
  "duvida": "Como fazer um loop em Python?"
}
```

**Response (200):**
```json
{
  "resultado": "Um loop permite repetir código. Em Python, temos for e while..."
}
```

**Response (400):**
```json
{
  "erro": "Dúvida não pode estar vazia"
}
```

**Internamente:**
- Chama `run_boole(duvida)` para obter resposta
- Salva em banco com `salvar_duvida(usuario, pergunta, resposta)`

---

### GET /historico

**Descrição:** Obter todas as dúvidas do usuário autenticado

**Proteção:** Requer login

**Response (200):**
```json
{
  "duvidas": [
    {
      "id": 1,
      "pergunta": "O que é uma variável?",
      "resposta": "Uma variável é um espaço na memória...",
      "data_criacao": "2026-04-24 10:30:00"
    },
    {
      "id": 2,
      "pergunta": "Como fazer loops?",
      "resposta": "Loops permitem repetir código...",
      "data_criacao": "2026-04-24 11:00:00"
    }
  ]
}
```

---

### GET /historico/<int:duvida_id>

**Descrição:** Obter uma dúvida específica do usuário

**Proteção:** Requer login + isolamento por usuário

**Response (200):**
```json
{
  "id": 1,
  "pergunta": "O que é uma variável?",
  "resposta": "Uma variável é um espaço na memória...",
  "data_criacao": "2026-04-24 10:30:00"
}
```

**Response (404):**
```json
{
  "erro": "Dúvida não encontrada"
}
```

---

### GET /login

**Descrição:** Página de login

**Response:** HTML do formulário de login

---

### POST /login

**Descrição:** Autenticar usuário

**Request Body:**
```json
{
  "usuario": "seu_usuario",
  "senha": "sua_senha"
}
```

**Response (200 - sucesso):**
```json
{
  "redirect": "/"
}
```

**Response (401 - erro):**
```json
{
  "erro": "Usuário ou senha incorretos"
}
```

**Internamente:**
- Limpa sessão anterior
- Valida entrada
- Verifica hash de senha contra banco
- Armazena `user_id` na sessão

---

### GET /criar-conta

**Descrição:** Página para criar conta

**Response:** HTML do formulário

---

### POST /criar-conta

**Descrição:** Registrar novo usuário

**Request Body:**
```json
{
  "usuario": "novo_usuario",
  "senha": "senha_forte",
  "senha_confirma": "senha_forte"
}
```

**Response (200 - sucesso):**
```json
{
  "redirect": "/login"
}
```

**Response (400 - erro):**
```json
{
  "erro": "Esse nome de usuário já está em uso."
}
```

**Internamente:**
- Valida se usuário já existe
- Verifica se senhas coincidem
- Faz hash da senha com `generate_password_hash()`
- Insere em tabela `usuarios`

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

# Ou rodar em porta diferente
python app.py --port 5001
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

**Última atualização:** Abril 2026  
**Versão:** 1.0
