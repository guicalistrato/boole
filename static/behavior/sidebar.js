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
                const fixarbtn = document.createElement('button');
                
                a.href = '/chat/' + chat.id_chat;
                a.textContent = chat.nome_chat || 'Nova Conversa';

                const currentUrlPath = window.location.pathname;
                if (currentUrlPath.includes(chat.id_chat)) {
                    a.classList.add('active-chat');
                }


                /*Armazenamento da conversa no localStorage
                  isso serve para manter o pin depois que a pessoa muda de rota
                  e também para manter mesmo que a pessoa feche a aba */
                /*OBS: Caso queira que o pin vá embora quando a pessoa fecha a aba
                       pode mudar de localStorage para sessionStorage */
                
                //checagem se essa conversa já foi armazenada
                if (!localStorage.getItem(chat.id_chat)){//impede que o pin de uma conversa seja resetado
                    //armazena a conversa
                    localStorage.setItem(chat.id_chat, "0");//0=pin off, 1=pin on
                }

                //         Adição de estilização e propriedades
                fixarbtn.classList = "fixarbtn";
                //colocar o símbolo svg
                const símbolo = document
                                .getElementById("símbolo_fixar")//pega o ícone svg original
                                .cloneNode(true);//cria uma cópia do ícone svg
                símbolo.removeAttribute("id");//remove o id para não ter id's duplicados
                símbolo.style="background:transparent;";//remove o display:none; que esconde o original
                fixarbtn.appendChild(símbolo);

                //função para fazer ele fixar
                fixarbtn.onclick = (evento) => {
                    //navegação para pegar a tag <g> que contém o ícone
                    const ícone = fixarbtn.firstElementChild.firstElementChild;
                    //extrai o li a partir do botão
                    const listItem = fixarbtn.parentElement;

                    listItem.classList.toggle("pinned");
                    //muda a cor do ícone e atualiza o localStorage
                    if (listItem.classList.contains("pinned")){
                        ícone.setAttribute("color","yellow");
                        localStorage.setItem(chat.id_chat , "1");
                    }
                    else{
                        ícone.setAttribute("color","white");
                        localStorage.setItem(chat.id_chat, "0");
                    }
                }

                //navegação para pegar a tag <g> que contém o ícone
                const g = fixarbtn.firstElementChild.firstElementChild;
                //seta a cor e a posição dependendo do localStorage
                if (localStorage.getItem(chat.id_chat) == "1"){
                    li.classList.toggle("pinned");
                    g.setAttribute("color","yellow");
                }
                else{
                    g.setAttribute("color","white");
                }


                li.appendChild(a);
                li.appendChild(fixarbtn);
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

// COMPORTAMENTO MENU DROPDOWN DE PERFIL/LOGIN e SIGNIN
const botaoPerfil = document.getElementById('perfil-opcoes-btn');
const menuPerfil = document.getElementById('perfil-opcoes');

// abre/fecha o menu ao clicar no botão
botaoPerfil.addEventListener('click', function(event) {
  event.stopPropagation();
  menuPerfil.classList.toggle('show');
});

// captura o clique em um item do menu para atualizar o botão
const itensPerfil = menuPerfil.querySelectorAll('li a');

itensPerfil.forEach(function(itemPerfil) {
  itemPerfil.addEventListener('click', function(event) {
    event.preventDefault(); // impede a página de recarregar/pular
    event.stopPropagation(); // impede o clique de fechar o menu antes da hora
    
    // fecha o menu após a seleção
    menuPerfil.classList.remove('show');
  });
});

// fecha o menu se o usuário clicar em qualquer outro lugar da tela
document.addEventListener('click', function() {
  if (menuPerfil.classList.contains('show')) {
    menuPerfil.classList.remove('show');
  }
});

