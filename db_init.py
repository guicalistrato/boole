import sqlite3

def init_db():
    # Inicializa o banco de dados com as tabelas e índices necessários.

    with sqlite3.connect('dados.db') as conn:
        cursor = conn.cursor()

        # Tabela de usuários
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS usuarios (
                usuario TEXT PRIMARY KEY,
                senha TEXT NOT NULL
            )
        """)

        # Tabela de dúvidas e respostas
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS duvidas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario TEXT NOT NULL,
                pergunta TEXT NOT NULL,
                resposta TEXT NOT NULL,
                nome_chat TEXT NOT NULL,
                id_chat TEXT NOT NULL,
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario) REFERENCES usuarios(usuario)
            )
        """)

        # Índice para acelerar consultas de histórico por usuário
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_duvidas_usuario
            ON duvidas(usuario)
        """)

        # Tabela de códigos
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS codigos (
            id_chat TEXT NOT NULL,
            codigo TEXT NOT NULL          
            )

        """)

        conn.commit()

    print("Banco de dados inicializado com sucesso!")

if __name__ == "__main__":
    init_db()