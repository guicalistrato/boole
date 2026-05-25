from flask import Flask, render_template, request, session, g, redirect, url_for, jsonify
from werkzeug.security import check_password_hash, generate_password_hash
from flask_session import Session
from boole import run_boole
from funcoes import get_db, salvar_duvida, salvar_codigo, receber_codigo, criar_id

# ============= CONFIGURAÇÃO =============

app = Flask(__name__)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

@app.after_request
def after_request(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response

# ============= BANCO DE DADOS =============
@app.teardown_appcontext
def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()

# ============= ROTAS =============
# página inicial
@app.get("/")
def index():
    return redirect("/chat")

# rota do chat
@app.get("/chat")
@app.get("/chat/<id_chat>")
def chat_get(id_chat=None):
    # recebe nome atraves do email, para ser adicionado na saudação, e checar que botao deve ser posto na sidebar
    usuario = session.get("user_id")
    
    db = get_db()
    nome = db.execute("SELECT nome FROM usuarios WHERE usuario = ?", (usuario,)).fetchone()
    
    if nome == None:
        nome = ""
    else:
        nome = f", {nome[0]}"

    # checa se há um codigo na id atual para alterar para modo debug
    if receber_codigo(id_chat) == None:
        session["debug"] = False
    
    else:
        session["debug"] = True

    return render_template("index.html", id_chat=id_chat, nome=nome)

@app.post("/chat")
@app.post("/chat/<id_chat>")
def chat_post(id_chat=None):
    dados = request.get_json()

    # recebe um codigo caso o chat seja de modo debug
    codigo = None
    debug = False
    if session.get("debug") == True:
        codigo = receber_codigo(id_chat)
        debug = True

    if not dados:
        return {"erro": "Dados não recebidos"}, 400

    num = dados.get('num')  # número de perguntas já feitas
    modelo = dados.get('modelo')
    duvida = dados.get('duvida', '').strip()
    if not duvida:
        return {"erro": "Dúvida não pode estar vazia"}, 400

    # se não há id_chat, cria um novo
    novo_chat = id_chat is None
    if novo_chat:
        id_chat = criar_id(20)

    usuario = session.get("user_id")
    resposta_boole, titulo = run_boole(duvida, usuario, modelo=modelo, codigo=codigo, num=num)

    if usuario:
        salvar_duvida(usuario, duvida, resposta_boole, titulo if num <= 2 else None, id_chat)

    return {"resultado": resposta_boole, "titulo": titulo, "id_chat": id_chat, "novo_chat": novo_chat, "debug": debug}, 200

# rota para deletar conversas
@app.route('/chat/<id_chat>', methods=['DELETE'])
def deletar_conversa(id_chat):
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("DELETE FROM duvidas WHERE id_chat = ?", (id_chat,))
    db.commit()
    
    if cursor.rowcount == 0:
        return jsonify({'erro': 'Conversa não encontrada'}), 404
    
    return jsonify({'mensagem': 'Conversa deletada com sucesso'}), 200

# nova rota de historico
@app.get("/api/chat/<id_chat>")
def api_obter_chat_especifico(id_chat):
    usuario = session.get("user_id")
    db = get_db()
    
    # Busca todas as mensagens desse chat que pertencem a este usuário
    linhas = db.execute(
        "SELECT pergunta, resposta, nome_chat FROM duvidas WHERE id_chat = ? AND usuario = ? ORDER BY data_criacao ASC",
        (id_chat, usuario)
    ).fetchall()

    if not linhas:
        return {"erro": "Chat não encontrado ou não pertence a este usuário"}, 404

    # Formata os dados para enviar ao frontend
    mensagens = [{"pergunta": linha["pergunta"], "resposta": linha["resposta"]} for linha in linhas]
    nome_chat = linhas[0]["nome_chat"] # O nome_chat se repete, pegamos do primeiro

    return {"mensagens": mensagens, "nome_chat": nome_chat}, 200

@app.get("/api/listar_chats")
def api_listar_chats():
    usuario = session.get("user_id")
    db = get_db()
    
    # Busca os chats únicos do usuário, ordenando pelo mais recente
    linhas = db.execute(
        """
        SELECT id_chat, nome_chat 
        FROM duvidas 
        WHERE usuario = ? 
        GROUP BY id_chat 
        ORDER BY MIN(id) DESC
        """,
        (usuario,)
    ).fetchall()

    # Formata como uma lista de dicionários
    chats = [{"id_chat": linha["id_chat"], "nome_chat": linha["nome_chat"]} for linha in linhas]

    return {"chats": chats}, 200

# redireciona para um chat em modo debug
@app.route('/debug', methods=['GET', 'POST'])
def debug():
    if request.method == 'POST':
        dados = request.get_json()
        codigo = dados.get('codigo', '')
        id_chat = criar_id(20)
        session["debug"] = True
        salvar_codigo(codigo, id_chat)
        url = url_for('chat_get', id_chat=id_chat)
        return jsonify({'redirect': url})  # retorna a URL como JSON
    else:
        return render_template('debug.html')


@app.get('/continuar-sem-login')
def continuar_sem_login():
    session.clear()
    session["anonymous"] = True
    return redirect("/chat")

@app.get('/login')
def login_get():
    if session.get("user_id"):
        return redirect("/chat")

@app.post('/login')
def login_post():
    session.clear()
    dados = request.get_json()

    if not dados:
        return {"erro": "Dados não recebidos"}, 400

    usuario = dados.get('usuario', '').strip()
    senha = dados.get('senha', '')

    if not usuario or not senha:
        return {"erro": "Usuário e senha são obrigatórios"}, 400

    row = get_db().execute(
        "SELECT senha FROM usuarios WHERE usuario = ?", (usuario,)
    ).fetchone()

    if row and check_password_hash(row["senha"], senha):
        session["user_id"] = usuario
        session.pop("anonymous", None)
        return {"redirect": "/chat", "usuario" : usuario}, 200
    else:
        return {"erro": "Usuário ou senha inválidos"}, 401

@app.post('/criar-conta')
def criar_conta_post():
    session.clear()
    dados = request.get_json()

    if not dados:
        return {"erro": "Dados não recebidos"}, 400
    
    nome = dados.get('nome', '').strip()
    usuario = dados.get('usuario', '').strip()
    senha = dados.get('senha', '')
    senha_confirma = dados.get('senha_confirma', '')

    if not usuario or not senha:
        return {"erro": "Usuário e senha são obrigatórios"}, 400

    if senha != senha_confirma:
        return {"erro": "As senhas não coincidem"}, 400

    db = get_db()
    if db.execute(
        "SELECT 1 FROM usuarios WHERE usuario = ?", (usuario,)
    ).fetchone():
        return {"erro": "Esse email já está sendo utilizado!"}, 400

    db.execute(
        "INSERT INTO usuarios (usuario, nome, senha) VALUES (?, ?, ?)",
        (usuario, nome, generate_password_hash(senha))
    )
    db.commit()

    session["user_id"] = usuario
    session.pop("anonymous", None)

    return {"redirect": "/chat", "usuario" : usuario}, 200

# mudar dados do perfil
@app.post('/perfil')
def alterar_dados():
    dados = request.get_json()

    usuario_antigo = session.get("user_id")

    # receber dados novos
    nome = dados.get('nome')
    usuario = dados.get('usuario', '').strip()
    senha = dados.get('senha', '')
    senha_confirma = dados.get('senha_confirma', '')

    # atualiza tabelas SQL com novos dados
    if senha == senha_confirma:
        db = get_db()
        db.execute("UPDATE duvidas SET usuario = ? WHERE usuario = ?", (usuario, usuario_antigo))
        db.execute("UPDATE usuarios SET usuario = ?, senha = ?, nome = ? WHERE usuario = ?", (usuario, generate_password_hash(senha), nome, usuario_antigo))
        db.commit()
        session["user_id"] = usuario

    return {"redirect": "/chat"}, 200

# logout
@app.route("/logout")
def logout():
    session.clear()

    return redirect("/chat")

if __name__ == "__main__":
    app.run(debug=True)