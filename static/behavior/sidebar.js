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
    //checa o atributo de color-scheme no root e muda o seu valor para o oposto
    const root = document.documentElement;
    
    if (root.style.colorScheme === 'light') {
        root.style.colorScheme = 'dark';
    } else {
        root.style.colorScheme = 'light';
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