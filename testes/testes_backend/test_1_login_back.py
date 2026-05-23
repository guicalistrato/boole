def test_login_com_credenciais_validas(client):
    """Login com credenciais válidas"""
    # CRIANDO UM USUARIO PARA TESTAR O LOGIN
    client.post('/criar-conta', json={
        "usuario": "usuario_valido",
        "senha": "senha123",
        "senha_confirma": "senha123"
    })
    
    # TENTANDO LOGAR COM AS CREDENCIAIS CORRETAS
    res = client.post('/login', json={
        "usuario": "usuario_valido",
        "senha": "senha123"
    })
    assert res.status_code == 200
    assert res.get_json()["redirect"] == "/chat"

def test_login_com_senha_incorreta(client):
    """Login com senha incorreta"""
    # CRIANDO UM USUARIO PARA TESTAR O LOGIN
    client.post('/criar-conta', json={
        "usuario": "usuario_senha_errada",
        "senha": "senha123",
        "senha_confirma": "senha123"
    })
    
    # TENTANDO LOGAR COM A SENHA ERRADA
    res = client.post('/login', json={
        "usuario": "usuario_senha_errada",
        "senha": "senha_errada_123"
    })
    assert res.status_code == 401
    assert "erro" in res.get_json()

def test_login_com_campos_vazios(client):
    """Login com campos vazios"""
    # TENTANDO LOGAR COM CAMPOS VAZIOS
    res = client.post('/login', json={
        "usuario": "",
        "senha": ""
    })
    assert res.status_code == 400
    assert "erro" in res.get_json()
    assert "Usuário e senha são obrigatórios" in res.get_json()["erro"]



def test_exibicao_mensagens_de_erro(client):
    """Exibição de mensagens de erro"""
    # Teste 1: Usuário não existe
    res = client.post('/login', json={
        "usuario": "usuario_nao_existe",
        "senha": "qualquer"
    })
    assert res.status_code == 401
    assert "erro" in res.get_json()
    assert "inválidos" in res.get_json()["erro"] or "Usuário" in res.get_json()["erro"]
    
    # Teste 2: Senha errada (mas usuário existe)
    client.post('/criar-conta', json={
        "usuario": "teste_erro",
        "senha": "senha123",
        "senha_confirma": "senha123"
    })
    
    res = client.post('/login', json={
        "usuario": "teste_erro",
        "senha": "senha_qualquer"
    })
    assert res.status_code == 401
    assert "erro" in res.get_json()
    
    # Teste 3: Campos vazios
    res = client.post('/login', json={
        "usuario": "",
        "senha": ""
    })
    assert res.status_code == 400
    assert "erro" in res.get_json()
    assert "Usuário e senha são obrigatórios" in res.get_json()["erro"]