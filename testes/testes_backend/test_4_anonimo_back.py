
def test_historico_usuario_anonimo(client):
    client.get('/continuar-sem-login')
    res = client.get('/api/listar_chats')
    assert res.status_code == 200
    assert "chats" in res.get_json()
def test_continuar_sem_login_redireciona(client):
    res = client.get('/continuar-sem-login')
    assert res.status_code == 302  # Redirecionamento
    assert '/chat' in res.location
def test_criacao_sessao_anonima(client):
    res = client.get('/continuar-sem-login')
    assert res.status_code == 302
    # Acessa o chat
    res = client.get('/chat')
    assert res.status_code == 200
def test_anonimo_bloqueio_de_funcionalidades_exclusivas(client):
    #deletar conversa
    client.get('/continuar-sem-login')
    
    res = client.delete('/chat/qualquer_id')
    # Deve retornar erro
    assert res.status_code in [401, 404]
def test_anonimo_pode_fazer_login_depois(client):
    # Primeiro navega como anônimo
    client.get('/continuar-sem-login')
    client.post('/chat', json={
        "duvida": "Pergunta antes do login",
        "modelo": "flash",
        "num": 1
    })
    
    # Cria conta e faz login
    client.post('/criar-conta', json={
        "usuario": "anonimo_que_logou",
        "senha": "senha123",
        "senha_confirma": "senha123"
    })
    
    res = client.post('/login', json={
        "usuario": "anonimo_que_logou",
        "senha": "senha123"
    })
    assert res.status_code == 200
    
    # Após login, o histórico NÃO deve ter as perguntas anônimas
    res = client.get('/api/listar_chats')
    assert res.get_json()["chats"] == []  # Histórico vazio (perguntas anônimas não ficam salvas)