from functools import wraps
from flask import redirect, render_template, session, g
import sqlite3
import time
from random import seed, randint
# este arquivo foi criado para armazenar funções auxiliares

# protege paginas que precisam de login
def login_required(funcao):
    @wraps(funcao)
    def decorated_function(*args, **kwargs):
        if session.get("user_id") is None:
            return redirect("/login")
        return funcao(*args, **kwargs)

    return decorated_function

def get_db():
    # Retorna a conexão com o banco de dados para a requisição atual.
    if 'db' not in g:
        g.db = sqlite3.connect('dados.db')
        g.db.row_factory = sqlite3.Row
    return g.db

def obter_historico_chat(usuario):
    """Retorna as mensagens anteriores do usuário no formato para o Gemini."""
    db = get_db()
    linhas = db.execute(
        "SELECT pergunta, resposta FROM duvidas WHERE usuario = ? ORDER BY data_criacao DESC LIMIT 20",
        (usuario,)
    ).fetchall()

    historico = []
    for linha in reversed(linhas):  # inverte para que a ordem seja do mais antigo para o mais recente
        historico.append({"role": "user",  "parts": [{"text": linha["pergunta"]}]})
        historico.append({"role": "model", "parts": [{"text": linha["resposta"]}]})
    return historico
def salvar_duvida(usuario, pergunta, resposta, nome_chat, id_chat):
    # Salva uma dúvida e sua resposta no banco de dados.
    try:
        db = get_db()
        db.execute(
            "INSERT INTO duvidas (usuario, pergunta, resposta, nome_chat, id_chat) VALUES (?, ?, ?, ?, ?)",
            (usuario, pergunta, resposta, nome_chat, id_chat)
        )
        db.commit()
        return True
    except Exception as e:
        print(f"Erro ao salvar dúvida: {e}")
        return False
    
def salvar_codigo(codigo, id_chat):
    try:
        db = get_db()
        db.execute(
            "INSERT INTO codigos (id_chat, codigo) VALUES (?, ?)", (id_chat, codigo)
        )
        db.commit()
        return True
    except Exception as e:
        print(f"Erro ao salvar código: {e}")
        return False

def receber_codigo(id):
    try:
        db = get_db()
        cursor = db.execute(
            "SELECT codigo FROM codigos WHERE id_chat = ?", (id,) 
        )
        resultado = cursor.fetchone()

        if resultado is not None:
            return resultado[0]

        return None
    except Exception:
        print("Código não encontrado")
        return None

# essa função recebe as duvidas de um mesmo chat
def receber_duvidas_chat(id):
    db = get_db()
    cursor = db.execute(
        "SELECT * FROM duvidas WHERE id_chat = ?", (id,) 
    )
    resultado = cursor.fetchall()
    resultado = [dict(linha) for linha in resultado]
    return resultado

def obter_historico(usuario):
    # Obtém todas as dúvidas e respostas de um usuário, ordenadas por data decrescente.
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

def obter_duvida(usuario, duvida_id):
    # Obtém uma dúvida específica de um usuário.
    try:
        db = get_db()
        cursor = db.execute(
            """SELECT id, pergunta, resposta, data_criacao
               FROM duvidas
               WHERE id = ? AND usuario = ?""",
            (duvida_id, usuario)
        )
        resultado = cursor.fetchone()
        return dict(resultado) if resultado else None
    except Exception as e:
        print(f"Erro ao obter dúvida: {e}")
        return None

# cria um id único
def criar_id(tamanho):
    timeseed = int(time.time())
    seed(timeseed)

    caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    codigo = ''
    for i in range(tamanho):
        prob = randint(0, 35)
        # seleciona um caractere aleatorio para adicionar ao codigo
        codigo += caracteres[prob]

    return(codigo)

def checar_autenticacao():
    #Retorna (usuario, erro) onde erro é uma resposta Flask ou None. Centraliza a lógica de autenticação usada nas rotas de histórico.
    if session.get("anonymous"):
        return None, ({"erro": "Faça login para acessar seu histórico"}, 401)
    usuario = session.get("user_id")
    if not usuario:
        return None, ({"erro": "Não autenticado"}, 401)
    return usuario, None
