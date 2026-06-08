//função ajudante para abstrair código repetido das funções que lidam com dados do perfil do usuário
async function postJSON(url, dados) {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
    });
    return response.json();
}

// usada no signup
async function criacao_conta() {
    const data = await postJSON('/criar-conta', {
        nome:          document.getElementById('nome').value,
        usuario:       document.getElementById('usuario_criacao').value,
        senha:         document.getElementById('senha_criacao').value,
        senha_confirma: document.getElementById('senha_confirma').value,
    });
    data.redirect ? window.location.href = data.redirect : alert(data.erro);
}

//usada no login
async function enviar_dados() {
    const data = await postJSON('/login', {
        usuario: document.getElementById('usuario').value,
        senha:   document.getElementById('senha').value,
    });
    data.redirect ? window.location.href = '/chat' : alert(data.erro);
}

//usada na edição do perfil
async function alterar_dados() {
    const data = await postJSON('/perfil', {
        nome:          document.getElementById('nome_edicao').value,
        usuario:       document.getElementById('usuario_edicao').value,
        senha:         document.getElementById('senha_edicao').value,
        senha_confirma: document.getElementById('senha_confirma_mudanca').value,
    });
    data.redirect ? window.location.href = data.redirect : alert(data.erro);
}

//toggle do modo de editar dados no perfil
function ativarModoEdicao() {
    document.getElementById("modo-visualizacao").style.display = "none";
    document.getElementById("modo-edicao").style.display = "flex";
    document.getElementById("subtitulo").textContent = "Edite suas informações";
}

function ativarModoVisualizacao() {
    document.getElementById("modo-edicao").style.display = "none";
    document.getElementById("modo-visualizacao").style.display = "flex";
    document.getElementById("subtitulo").textContent = "Gerencie suas informações";}


// funções de mudança de página
function criar_conta() {
    window.location.href = '/criar-conta';
}

function continuar_sem_login() {
    window.location.href = '/continuar-sem-login';
}

function logout() {
    window.location.href = '/logout'
}