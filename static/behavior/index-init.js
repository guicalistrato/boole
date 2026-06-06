    //toda a função do antigo index.js está aqui
    //distribuída entre três objetos:
    //DOM_index: manipulações do DOM e coisas relacionadas
    //States_index: manipulação de estados
    //Backend_index: comunicação com o backend
    DOM_index.inicializarPágina();
    
    const botao = document.getElementById('modelo');
    const menu = document.getElementById('opcoes-modelo');

    // abre/fecha o menu ao clicar no botão
    botao.addEventListener('click', function(event) {
        event.stopPropagation();
        menu.classList.toggle('show');
    });

    // captura o clique em um item do menu para atualizar o botão
    const itens = menu.querySelectorAll('li a');

    itens.forEach(function(item) {
        item.addEventListener('click', function(event) {
            event.preventDefault(); // impede a página de recarregar/pular
            event.stopPropagation(); // impede o clique de fechar o menu antes da hora
        
            // busca o texto dentro da tag <strong> do item clicado
            const tituloSelecionado = item.querySelector('strong').textContent;
        
            // atualiza o texto do botão principal
            botao.textContent = tituloSelecionado;
        
            // fecha o menu após a seleção
            menu.classList.remove('show');
        });
    });

        // fecha o menu se o usuário clicar em qualquer outro lugar da tela
    document.addEventListener('click', function() {
        if (menu.classList.contains('show')) {
            menu.classList.remove('show');
        }
    });
