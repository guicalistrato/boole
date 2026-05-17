from functools import wraps
from flask import redirect, render_template, session, g
import sqlite3

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
    if 'db' not in g:
        g.db = sqlite3.connect('dados.db')
        g.db.row_factory = sqlite3.Row
    return g.db

def obter_historico_chat(usuario):
    """Retorna as mensagens anteriores do usuário no formato para o Gemini."""
    db = get_db()
    linhas = db.execute(
        "SELECT pergunta, resposta FROM duvidas WHERE usuario = ? ORDER BY data_criacao ASC",
        (usuario,)
    ).fetchall()

    historico = []
    for linha in linhas:
        historico.append({"role": "user",  "parts": [{"text": linha["pergunta"]}]})
        historico.append({"role": "model", "parts": [{"text": linha["resposta"]}]})
    return historico