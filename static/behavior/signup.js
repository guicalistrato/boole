function criacao_conta() {
    const usuario = document.getElementById('usuario_criacao').value;
    const senha = document.getElementById('senha_criacao').value;
    const senha_confirma = document.getElementById('senha_confirma').value;

    fetch('/criar-conta', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuario: usuario, senha: senha, senha_confirma: senha_confirma }),
    })
    .then(response => response.json())
        .then(data => {
            if (data.redirect) {
                window.location.href = data.redirect;
            } else {
                alert(data.erro);
            }
        });
}