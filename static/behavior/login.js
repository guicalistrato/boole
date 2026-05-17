// função do botão fazer login
function enviar_dados() {
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuario: usuario, senha: senha }),
    })
    .then(response => response.json()) 

    .then(data => {
        if (data.redirect) {
            window.location.href = '/chat'; 
        } else if (data.erro) {
            alert(data.erro); 
        }
    })
    .catch(error => console.error('Erro:', error));
    
}

function criar_conta() {
    window.location.href = '/criar-conta';
}

function continuar_sem_login() {
    window.location.href = '/continuar-sem-login';
}
