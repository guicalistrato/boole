//toda a função do antigo index.js está aqui
//distribuída entre três objetos:
//DOM_index: manipulações do DOM e coisas relacionadas
//States_index: manipulação de estados
//Backend_index: comunicação com o backend
DOM_index.inicializarPágina();
     
const botao = document.getElementById('modelo');
const menu = document.getElementById('opcoes-modelo');

if (botao && menu) {
    botao.addEventListener('click', function (event) {
        event.stopPropagation();
        menu.classList.toggle('show');
    });

    const itens = menu.querySelectorAll('li a');

    itens.forEach(function (item) {
        item.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();

            const tituloSelecionado = item.querySelector('strong').textContent;
            botao.textContent = tituloSelecionado;
            menu.classList.remove('show');
        });
    });

    document.addEventListener('click', function () {
        if (menu.classList.contains('show')) {
            menu.classList.remove('show');
        }
    });
}