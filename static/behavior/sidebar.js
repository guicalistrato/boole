// função fechar sidebar
closeSidebar = function() {
    document.getElementById("Sidebar").style.width = "0";
    document.getElementById("chat-container").style.marginLeft = "0";
    document.getElementById("openbtn").style.visibility = 'visible';
};

// função abrir sidebar
openSidebar = function () {
  const sidebar = document.getElementById('Sidebar');
  const menu_button = document.getElementById('openbtn');
  const container = document.getElementById('chat-container');

  if (!sidebar || !container) {
    return;
  }

  menu_button.style.visibility = 'hidden';
  sidebar.style.width = '300px';  
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
                const fixarbtn = criar_botão_fixar(li, chat.id_chat);
                const deletebtn = criar_botão_delete(li, chat.id_chat);
                const dropdownbtn = criar_botão_dropdown();

                a.href = '/chat/' + chat.id_chat;
                a.textContent = chat.nome_chat || 'Nova Conversa';

                const currentUrlPath = window.location.pathname;
                if (currentUrlPath.includes(chat.id_chat)) {
                    a.classList.add('active-chat');
                }

                adicionar_opção_dropdown(dropdownbtn, fixarbtn, fixarbtn.labelName);
                adicionar_opção_dropdown(dropdownbtn, deletebtn, "deletar");

                li.appendChild(dropdownbtn);
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

function criar_botão_fixar(li, id_chat){//recebe o elemento <li> que corresponde à conversa
    const fixarbtn = document.createElement('button');
    const listItem = li; //para evitar modificações acidentais

    if (!localStorage.getItem(id_chat)){
        localStorage.setItem(id_chat, "off");
    }

    fixarbtn.classList = "fixarbtn";

    const img = document.getElementById("pin_image-dark").cloneNode();
    img.id = "";//remove o id para evitar conflitos de id
    img.style = ""; //remove o display none
    fixarbtn.appendChild(img)

    fixarbtn.img = img;

    if (localStorage.getItem(id_chat) == "on"){
        listItem.classList.toggle("pinned");
        fixarbtn.labelName = "desafixar"
    }
    else{
        localStorage.setItem(id_chat, "off");
        fixarbtn.labelName = "fixar"
    }

    fixarbtn.onclick = () => {
        const label = fixarbtn.nextElementSibling;
        listItem.classList.toggle("pinned");
        if (listItem.classList.contains("pinned")){
            localStorage.setItem(id_chat , "on");
            if (label != null){
                label.textContent = "desafixar";
            }
        }
        else{
            localStorage.setItem(id_chat, "off");
            if (label != null){
                label.textContent = "fixar";
            }
        }
    }


    return fixarbtn;

}

function criar_botão_delete(li, id_chat){//recebe o elemento <li> que corresponde à conversa
    const deletebtn = document.createElement('button');
    const listItem = li; //para evitar modificações acidentais

    deletebtn.classList = "deletebtn";
    
    const img = document.getElementById("delete_image-dark").cloneNode();
    img.id = "";//remove o id para evitar conflitos de id
    img.style = ""; //remove o display none
    deletebtn.appendChild(img)

    deletebtn.img = img;

    deletebtn.onclick = async () => {
    try {
        const response = await fetch(`/chat/${id_chat}`, {
            method: 'DELETE',
        });

        if (!response.ok) throw new Error('Erro ao deletar');

        listItem.remove();
        localStorage.removeItem(id_chat);
    } catch (err) {
        console.error('Falha ao deletar conversa:', err);
    }
}

    return deletebtn;
}

function criar_botão_dropdown(){
    const dropdownbtn = document.createElement('button');

    dropdownbtn.classList = "dropdownbtn";

    const img = document.getElementById("dropdown_image-dark").cloneNode();
    img.id = "";//remove o id para evitar conflitos de id
    img.style = ""; //remove o display none
    dropdownbtn.appendChild(img)
    
    dropdownbtn.img = img;

    const dropdownmenu = document.createElement('div')
    dropdownmenu.classList.add("dropdownmenu");
    dropdownmenu.classList.add("dropdown_hidden");
    dropdownbtn.appendChild(dropdownmenu)

    dropdownbtn.dropdownmenu = dropdownmenu;

    dropdownbtn.onclick = () => {
        for (element of document.querySelectorAll(".dropdownmenu")){
            if (!element.classList.contains("dropdown_hidden") && element!=dropdownmenu){
                element.classList.add("dropdown_hidden");
                break;
            }
        }
        dropdownmenu.classList.toggle("dropdown_hidden");
    }

    return dropdownbtn;
}

function adicionar_opção_dropdown(botão_dropdown, novo_botão, legenda_opção){
    const dropdownbtn = botão_dropdown;
    const dropdownmenu = dropdownbtn.dropdownmenu;//método que eu defini na criação de dropdownbtn
    const newbtn = novo_botão;

    const legenda = document.createElement('label');
    legenda.textContent = legenda_opção;
    legenda.style = "padding-top: 4px;";
    legenda.onclick = newbtn.onclick;

    newbtn.legenda = legenda;

    dropdownmenu.appendChild(newbtn);
    dropdownmenu.appendChild(legenda);
}

// abrir um novo chat
function nova_conversa() {
    window.location.href = '/chat'
}

window.carregarSidebarChats = carregarSidebarChats;

// controle de popups 
function abrirPerfilPopup() {
    document.getElementById("editar-perfil-popup").style.display = "block";
}

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

function fechar_editar_perfil() {
    document.getElementById("editar-perfil-popup").style.display = "none";
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

// COMPORTAMENTO DO ÍCONE DE PERFIL DO MENU DROPDOWN QUANDO CLICADO
const menuButton = document.querySelector('.profile-icon');

menuButton.addEventListener('click', function(event) {

    //impede o link de atualizar a página imediatamente se for um '#'
    event.preventDefault(); 

    // toggle (mudança) de classe pra ativar o efeito de outline no css
    this.classList.toggle('profile-icon-active');
  });
;

//função para alternar entre modo claro e escuro
function toggleTheme() {
    //pega a referência do elemento root para poder alterar o color-scheme do site
    const root = document.documentElement;

    //mudança do tema de claro para escuro junto com a mudança das imagens
    if (root.style.colorScheme === 'light') {
        root.style.colorScheme = 'dark';
        localStorage.setItem('theme', 'dark'); //salva o estado do tema para manter consistência entre páginas
        toggleIcons('dark');
    }

    else {
        root.style.colorScheme = 'light';
        localStorage.setItem('theme', 'light'); //salva estado do tema
        toggleIcons('light');
    }
}

//função para aplicar o tema salvo ao carregar uma página nova
function aplicarTemaSalvo() {
    const temaSalvo = localStorage.getItem('theme');
    const root = document.documentElement;

    if (temaSalvo === 'dark') {
        root.style.colorScheme = 'dark';
        toggleIcons('dark');
    }

    else if (temaSalvo === 'light') {
        root.style.colorScheme = 'light';
        toggleIcons('light');
    }
}

//função separada para alternar os ícones do site
function toggleIcons(theme) {
    //pega as referências de imagens de todos os ícones no site
    const logo_icon = document.getElementById('boole-icon');
    const theme_icon = document.getElementById('theme-icon');
    const login_icon = document.getElementById('login-icon');
    const new_chat_icon = document.getElementById('new-chat-icon');
    const debug_icon = document.getElementById('debug-icon');
    const dropdown_icon = document.getElementById('dropdown-icon');
    const send_icon = document.getElementById('send-icon');
    const menu_icon = document.getElementById('menu-icon');

    if (theme === 'dark') {
        if (logo_icon) logo_icon.src = "/static/images/logo-robo.png";
        if (theme_icon) theme_icon.src = "/static/images/theme-icon.png";
        if (login_icon) login_icon.src = "/static/images/botao-menu-perfil.png";
        if (new_chat_icon) new_chat_icon.src = "/static/images/botao-nova-conversa.png";
        if (debug_icon) debug_icon.src = "/static/images/botao-debug.png";
        if (dropdown_icon) dropdown_icon.src = "/static/images/dropdown-expandir.png";
        if (send_icon) send_icon.src = "/static/images/send_icon.png";
        if (menu_icon) menu_icon.src = "/static/images/menu_icon.png";

        //pegar os botões da conversa com querySelectorAll porque o número varia
        const fixarbtns = document.querySelectorAll(".fixarbtn");
        const deletebtns = document.querySelectorAll(".deletebtn");
        const dropdownbtns = document.querySelectorAll(".dropdownbtn")
        
        const new_fixarbtn_img = document.getElementById("pin_image-dark");
        const new_deletebtn_img = document.getElementById("delete_image-dark");
        const new_dropdownbtn_img = document.getElementById("dropdown_image-dark");

        for (let i = 0; i < fixarbtns.length; i+=1){
            const fixarbtn = fixarbtns[i];
            
            fixarbtn.img.src = new_fixarbtn_img.src;
            fixarbtn.legenda.style.color = "white";
        }
        for (let i = 0; i < deletebtns.length; i+=1){
            const deletebtn = deletebtns[i];

            deletebtn.img.src = new_deletebtn_img.src;
            deletebtn.legenda.style.color = "white";
        }
        for (let i = 0; i < dropdownbtns.length; i+=1){
            const dropdownbtn = dropdownbtns[i];

            dropdownbtn.img.src = new_dropdownbtn_img.src;
            dropdownbtn.dropdownmenu.style.backgroundColor = "#022028"
        }
    }
    else {
        root.style.colorScheme = 'light';

    else if (theme === 'light') {
        if (logo_icon) logo_icon.src = "/static/images/logo-robo-light.png";
        if (theme_icon) theme_icon.src = "/static/images/theme-icon-light.png";
        if (login_icon) login_icon.src = "/static/images/botao-menu-perfil-light.png";
        if (new_chat_icon) new_chat_icon.src = "/static/images/botao-nova-conversa-light.png";
        if (debug_icon) debug_icon.src = "/static/images/botao-debug-light.png";
        if (dropdown_icon) dropdown_icon.src = "/static/images/dropdown-expandir-light.png";
        if (send_icon) send_icon.src = "/static/images/send_icon-light.png";
        if (menu_icon) menu_icon.src = "/static/images/menu_icon-light.png";

        const fixarbtns = document.querySelectorAll(".fixarbtn");
        const deletebtns = document.querySelectorAll(".deletebtn");
        const dropdownbtns = document.querySelectorAll(".dropdownbtn")
        
        const new_fixarbtn_img = document.getElementById("pin_image-light");
        const new_deletebtn_img = document.getElementById("delete_image-light");
        const new_dropdownbtn_img = document.getElementById("dropdown_image-light");

        for (let i = 0; i < fixarbtns.length; i+=1){
            const fixarbtn = fixarbtns[i];
            
            fixarbtn.img.src = new_fixarbtn_img.src;
            fixarbtn.legenda.style.color = "#022028";
        }
        for (let i = 0; i < deletebtns.length; i+=1){
            const deletebtn = deletebtns[i];

            deletebtn.img.src = new_deletebtn_img.src;
            deletebtn.legenda.style.color = "#022028";

        }
        for (let i = 0; i < dropdownbtns.length; i+=1){
            const dropdownbtn = dropdownbtns[i];

            dropdownbtn.img.src = new_dropdownbtn_img.src;
            dropdownbtn.dropdownmenu.style.backgroundColor = "white";
        }
    }
}

aplicarTemaSalvo(); //aplica o tema salvo ao carregar a página