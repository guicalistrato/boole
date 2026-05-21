// função fechar sidebar
window.closeSidebar = function() {
    document.getElementById("Sidebar").style.width = "0";
    document.getElementById("chat-container").style.marginLeft = "0";
    document.getElementById("openbtn").style.visibility = 'visible';
};

document.addEventListener('DOMContentLoaded', () => {
    carregarSidebarChats();
});

async function carregarSidebarChats() {
    try {
        const response = await fetch('/api/listar_chats');
        
        if (!response.ok) {
            console.error('Falha ao carregar lista de chats');
            return;
        }

        const data = await response.json();

        const conversationList = document.getElementById('conversation-list');
        if (!conversationList) {
            console.error("ERRO CRÍTICO: Elemento 'conversation-list' não foi encontrado no HTML!");
            return;
        }
        
        conversationList.innerHTML = ''; 
        if (data.chats && data.chats.length > 0) {
            data.chats.forEach(chat => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                
                a.href = '/chat/' + chat.id_chat;
                a.textContent = chat.nome_chat || 'Nova Conversa';

                const currentUrlPath = window.location.pathname;
                if (currentUrlPath.includes(chat.id_chat)) {
                    a.classList.add('active-chat');
                }

                li.appendChild(a);
                conversationList.appendChild(li);
            });
        } else {
            console.warn("Aviso: A lista de chats chegou vazia.");
        }

    } catch (error) {
        console.error("Erro ao montar a sidebar:", error);
    }
}

// abrir um novo chat
function nova_conversa() {
    window.location.href = '/chat'
}

window.carregarSidebarChats = carregarSidebarChats;

function abrirLoginPopup() {
    document.getElementById("loginPopup").style.display = "block";
}

function abrir_criar_conta() {
    document.getElementById("criar_conta_popup").style.display = "block";
}

function fecharLoginPopup() {
    document.getElementById("loginPopup").style.display = "none";
}

function fechar_criar_conta() {
    document.getElementById("criar_conta_popup").style.display = "none";
}

function esconder_login() {
    document.getElementById("abrir_login").style.display = "none";
}

function esconder_logout() {
    document.getElementById("logout").style.display = "none";
}

// fechar clicando fora
window.addEventListener("click", function(event) {
    let popup = document.getElementById("loginPopup");
    if (event.target === popup) {
        fecharLoginPopup();
    }
});

// direcionar para o modo debug
function debug() {
     window.location.href = '/debug'
}

//função para alternar entre modo claro e escuro
function toggleTheme() {
    //pega a referência do elemento root para poder alterar o color-scheme do site
    const root = document.documentElement;

    //pega as referências de imagens de todos os ícones no site
    const logo_icon = document.getElementById('boole-icon');
    const theme_icon = document.getElementById('theme-icon');
    const login_icon = document.getElementById('login-icon');
    const logout_icon = document.getElementById('logout-icon');
    const new_chat_icon = document.getElementById('new-chat-icon');
    const dropdown_icon = document.getElementById('dropdown-icon');
    const send_icon = document.getElementById('send-icon');
    const menu_icon = document.getElementById('menu-icon');

    //mudança do tema de claro para escuro junto com a mudança das imagens
    if (root.style.colorScheme === 'light') {
        root.style.colorScheme = 'dark';

        //if statement para evitar erros caso algum dos ícones não esteja presente na página
        if (logo_icon) logo_icon.src = "/static/images/logo-robo.png";
        if (theme_icon) theme_icon.src = "/static/images/theme-icon.png";
        if (login_icon) login_icon.src = "/static/images/botao-login.png";
        if (logout_icon) logout_icon.src = "/static/images/botao-logout.png";
        if (new_chat_icon) new_chat_icon.src = "/static/images/botao-nova-conversa.png";
        if (dropdown_icon) dropdown_icon.src = "/static/images/dropdown-expandir.png";
        if (send_icon) send_icon.src = "/static/images/send_icon.png";
        if (menu_icon) menu_icon.src = "/static/images/menu_icon.png";
    } 
    else {
        root.style.colorScheme = 'light';

        if (logo_icon) logo_icon.src = "/static/images/logo-robo-light.png";
        if (theme_icon) theme_icon.src = "/static/images/theme-icon-light.png";
        if (login_icon) login_icon.src = "/static/images/botao-login-light.png";
        if (logout_icon) logout_icon.src = "/static/images/botao-logout-light.png";
        if (new_chat_icon) new_chat_icon.src = "/static/images/botao-nova-conversa-light.png";
        if (dropdown_icon) dropdown_icon.src = "/static/images/dropdown-expandir-light.png";
        if (send_icon) send_icon.src = "/static/images/send_icon-light.png";
        if (menu_icon) menu_icon.src = "/static/images/menu_icon-light.png";
    }
}

// função listas colapsáveis - em comentário porque nao vai ser necessária na versão atual, mas pode ser util futuramente
//document.addEventListener('DOMContentLoaded', () => {
//    const toggles = document.querySelectorAll('.toggle-button');
//
//    toggles.forEach(btn => {
//      btn.addEventListener('click', function() {
//            this.classList.toggle('active');
//          const content = this.nextElementSibling;
//            if (content) {
//                content.classList.toggle('open');
//            }
//        }); 
//    });
//});