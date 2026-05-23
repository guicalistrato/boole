def test_historico_nao_logado(client):
    res = client.get('/api/listar_chats')
    assert res.status_code == 200
    assert "chats" in res.get_json()

def test_historico_usuario_logado(client_logado):
    res = client_logado.get('/api/listar_chats')
    assert res.status_code == 200
    assert "chats" in res.get_json()

def test_historico_chat_inexistente(client_logado):
    res = client_logado.get('/api/chat/id_inexistente_123')
    assert res.status_code == 404

def test_historico_salvamento_perguntas(client_logado):
    resposta = client_logado.post('/chat', json={
        "duvida": "O que é Python?",
        "modelo": "flash",
        "num": 1
    })
    assert resposta.status_code == 200
    dados = resposta.get_json()
    assert dados is not None

def test_historico_exibicao_correta(client_logado):
    res = client_logado.get('/api/listar_chats')
    assert res.status_code == 200
    dados = res.get_json()
    assert "chats" in dados
    assert isinstance(dados["chats"], list)

def test_historico_usuario_sem_historico(client):
    # Cria usuário
    client.post('/criar-conta', json={
        "usuario": "novo_sem_historico",
        "senha": "senha123",
        "senha_confirma": "senha123"
    })
    
    # Faz login
    client.post('/login', json={
        "usuario": "novo_sem_historico",
        "senha": "senha123"
    })
    
    # Verifica histórico
    res = client.get('/api/listar_chats')
    assert res.status_code == 200
    dados = res.get_json()
    assert "chats" in dados
    assert isinstance(dados["chats"], list)

def test_historico_persistencia_mensagens(client_logado):
    resposta = client_logado.post('/chat', json={
        "duvida": "Mensagem de persistência",
        "modelo": "flash",
        "num": 1
    })
    assert resposta.status_code == 200

def test_historico_listar_chats_apos_pergunta(client_logado):
    # Faz uma pergunta
    client_logado.post('/chat', json={
        "duvida": "Pergunta 1",
        "modelo": "flash",
        "num": 1
    })
    
    # Lista chats
    res = client_logado.get('/api/listar_chats')
    assert res.status_code == 200
    assert "chats" in res.get_json()