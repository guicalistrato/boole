function alterar_dados() {
    const nome = document.getElementById('nome_edicao').value;
    const usuario = document.getElementById('usuario_edicao').value;
    const senha = document.getElementById('senha_edicao').value;
    const senha_confirma = document.getElementById('senha_confirma_mudanca').value;

    fetch('/perfil', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome: nome, usuario: usuario, senha: senha, senha_confirma: senha_confirma }),
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