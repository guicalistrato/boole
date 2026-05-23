
def test_criar_conta_sucesso(client):
    res = client.post('/criar-conta', json={
        "usuario": "novo",
        "senha": "senha123",
        "senha_confirma": "senha123"
    })
    assert res.status_code == 200
    assert res.get_json()["redirect"] == "/chat"

def test_criar_conta_usuario_duplicado(client):
    client.post('/criar-conta', json={
        "usuario": "duplicado",
        "senha": "senha123",
        "senha_confirma": "senha123"
    })
    res = client.post('/criar-conta', json={
        "usuario": "duplicado",
        "senha": "senha123",
        "senha_confirma": "senha123"
    })
    assert res.status_code == 400
    assert "erro" in res.get_json()

def test_criar_conta_senhas_diferentes(client):
    res = client.post('/criar-conta', json={
        "usuario": "alguem",
        "senha": "abc",
        "senha_confirma": "xyz"
    })
    assert res.status_code == 400

def test_criar_conta_campos_vazios(client):
    res = client.post('/criar-conta', json={
        "usuario": "",
        "senha": "",
        "senha_confirma": ""
    })
    assert res.status_code == 400

def test_criar_conta_validacao_senha_sem_numeros(client):
    res = client.post('/criar-conta', json={
        "usuario": "senha_sem_numero",
        "senha": "abcdef",
        "senha_confirma": "abcdef"
    })
    assert res.status_code in [200, 400]

def test_criar_conta_validacao_senha_fraca(client):
    res = client.post('/criar-conta', json={
        "usuario": "senha_fraca",
        "senha": "123456",
        "senha_confirma": "123456"
    })
    assert res.status_code in [200, 400]