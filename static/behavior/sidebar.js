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
    const svg = document.getElementById("símbolo_fixar").cloneNode(true);
    svg.removeAttribute("id");
    svg.classList.remove("svg_hidden");
    fixarbtn.appendChild(svg);

    //a tag <g> que contém o ícone
    const ícone = svg.firstElementChild;

    if (localStorage.getItem(id_chat) == "on"){
        ícone.setAttribute("color","yellow");
        listItem.classList.toggle("pinned");
        fixarbtn.labelName = "desafixar"
    }
    else{
        ícone.setAttribute("color","white");
        localStorage.setItem(id_chat, "off");
        fixarbtn.labelName = "fixar"
    }

    fixarbtn.onclick = () => {
        const label = fixarbtn.nextElementSibling;
        listItem.classList.toggle("pinned");
        if (listItem.classList.contains("pinned")){
            ícone.setAttribute("color","yellow");
            localStorage.setItem(id_chat , "on");
            if (label != null){
                label.textContent = "desafixar";
            }
        }
        else{
            ícone.setAttribute("color","white");
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
    
    const svg = document.getElementById("símbolo_delete").cloneNode(true);
    svg.removeAttribute("id");
    svg.classList.remove("svg_hidden");
    deletebtn.appendChild(svg);

    deletebtn.onclick = () => {
        listItem.remove()
        localStorage.removeItem(id_chat)
        //aqui teria o fetch que removeria a conversa da base de dados
    }

    return deletebtn;
}

function criar_botão_dropdown(){
    const dropdownbtn = document.createElement('button');

    dropdownbtn.classList = "dropdownbtn";

    const svg = document.getElementById("símbolo_dropdown").cloneNode(true);
    svg.removeAttribute("id");
    svg.classList.remove("svg_hidden");
    dropdownbtn.appendChild(svg);

    const dropdownmenu = document.createElement('div')
    dropdownmenu.classList.add("dropdownmenu");
    dropdownmenu.classList.add("dropdown_hidden");
    dropdownbtn.appendChild(dropdownmenu)

    dropdownbtn.onclick = () => {
        for (element of document.querySelectorAll(".dropdownmenu")){
            if (!element.classList.contains("dropdown_hidden") && element!=dropdownmenu){
                element.classList.add("dropdown_hidden");
                break;
            }
        }
        dropdownmenu.classList.toggle("dropdown_hidden");
        console.log("activated")
    }

    dropdownbtn.dropdownmenu = () => {return dropdownmenu}

    return dropdownbtn;
}

function adicionar_opção_dropdown(botão_dropdown, novo_botão, legenda_opção){
    const dropdownbtn = botão_dropdown;
    const dropdownmenu = dropdownbtn.dropdownmenu();//método que eu defini na criação de dropdownbtn
    const newbtn = novo_botão;

    const legenda = document.createElement('label');
    legenda.textContent = legenda_opção;
    legenda.style = "padding-top:4px;";
    legenda.onclick = newbtn.onclick;

    dropdownmenu.appendChild(newbtn);
    dropdownmenu.appendChild(legenda);
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
