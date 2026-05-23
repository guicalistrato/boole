import pytest
import sqlite3                          
from unittest.mock import patch         
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

#***********************CONFIGURAÇÃO PARA TESTES BACKEND (API)************************

@pytest.fixture
def client():
    """Configura a aplicação para testes com banco em memória."""
    from app import app                  
    
    app.config["TESTING"] = True
    app.config["SECRET_KEY"] = "test-secret"

    db = sqlite3.connect(":memory:")
    db.row_factory = sqlite3.Row
    db.executescript("""
        CREATE TABLE usuarios (
            usuario TEXT PRIMARY KEY,
            nome TEXT,
            senha TEXT NOT NULL
        );
        CREATE TABLE duvidas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario TEXT NOT NULL,
            pergunta TEXT NOT NULL,
            resposta TEXT NOT NULL,
            nome_chat TEXT,
            id_chat TEXT,
            data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario) REFERENCES usuarios(usuario)
        );
        CREATE TABLE codigos (
            id_chat TEXT NOT NULL,
            codigo TEXT NOT NULL
        );
    """)

    with patch('app.get_db', return_value=db):
        with app.test_client() as client:
            yield client

@pytest.fixture
def client_logado(client):
    """Cria uma conta e loga, retorna o client já autenticado."""
    client.post('/criar-conta', json={
        "usuario": "teste",
        "senha": "senha123",
        "senha_confirma": "senha123"
    })
    client.post('/login', json={
        "usuario": "teste",
        "senha": "senha123"
    })
    return client

#***********************CONFIGURAÇÃO PARA TESTES FRONTEND (SELENIUM)************************

@pytest.fixture
def driver():
    """
    Abre o navegador Chrome automaticamente antes do teste e fecha depois.
    Usado nos testes de frontend.
    """
    print("\n Abrindo navegador...")
    
    # Configura o Chrome
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service)
    
    # Deixa o navegador em tela cheia
    driver.maximize_window()
    

    driver.implicitly_wait(10)
    
    yield driver
    
    print(" Fechando navegador...")
    driver.quit()


@pytest.fixture
def url_base():
    """
    URL base do projeto para os testes de frontend.
    """
    return "http://localhost:5000"