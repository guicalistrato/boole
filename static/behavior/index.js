// script responsável por controlar toda a logica da area de chat:
// - captura eventos do usuario (envio de mensagem)
// - renderiza mensagens na tela
// - faz requisição ao backend
// - controla estados como "digitando" e "carregando"

// IIFE para evitar poluição do escopo global
(function () {
  'use strict';

  // aguarda o carregamento completo do DOM antes de executar o script
  document.addEventListener('DOMContentLoaded', function () {
    // referencias aos elementos principais do chat no DOM
    /*           FEITO          */
    const chatContainer = document.getElementById('chat-container');
    const chatHeader = document.getElementById('chat-header');
    const headerContent = chatHeader ? chatHeader.querySelector('.header-content') : null;
    const chatMessages = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const inputField = document.getElementById('input-field');
    const sendButton = document.getElementById('send-button');
    const modeloSelecionado = document.getElementById('modelo');
    modeloSelecionado.value = "padrão";

    // atualiza quando uma opção é clicada
    /*           FEITO          */
    document.querySelectorAll('#opcoes-modelo a').forEach(opcao => {
      opcao.addEventListener('click', (e) => modeloSelecionado.value = e.currentTarget.getAttribute('value'));
    });

    // garante que todos os elementos necessarios existem antes de continuar
    /*           FEITO          */
    if (!chatContainer || !chatHeader || !chatMessages || !chatForm || !inputField || !sendButton || !modeloSelecionado) {
      return;
    }

    // inicialização da interface

    /* esses três foram colocados em index-DOM.js */
    /*       FEITO      */
    injectDynamicStyles();
    /*       FEITO      */
    clearExampleMessages();
    /*       FEITO      */
    autoResizeInput();
    /*       FEITO      */
    inputField.focus();

    // estados de controle da aplicação

    /* essas três variáveis foram colocadas em index-states.js */
    /*       FEITO      */
    let isSending = false;
    let hasStarted = false;
    let messageCounter = 0;

    // acessa a variável id_chat que o Flask renderiza ou le direto da URL

    /* essas duas variáveis foram colocadas em index-backend.js */
    /*       FEITO      */
    const pathParts = window.location.pathname.split('/');
    const possibleChatId = pathParts[pathParts.length - 1]; 
    
    /*       FEITO      */
    if (possibleChatId && possibleChatId !== 'chat' && possibleChatId !== '') {
        carregarHistorico(possibleChatId);
    }

    // busca o historico no back
    /*       FEITO      */
    async function carregarHistorico(chatId) {
      try {
        setSendingState(true); // Desativa o input enquanto carrega

        const response = await fetch('/api/chat/' + chatId);
        
        if (!response.ok) {
            throw new Error('Histórico não encontrado');
        }
        
        const data = await response.json();
        
        if (data.mensagens && data.mensagens.length > 0) {
          hasStarted = true;
          activateConversationUI(data.nome_chat);
          
          data.mensagens.forEach(msg => {
            appendMessage('user', msg.pergunta);
            appendMessage('bot', msg.resposta);
          });
          
          // O messageCounter precisa saber quantas mensagens já existem
          // para enviar o número certo para a API do Gemini depois
          messageCounter = data.mensagens.length * 2; 
        }
      } catch (error) {
        if (!data.debug) {
          console.error(error);
          alert("Não foi possível carregar a conversa.");
        }
        
      } finally {
        setSendingState(false);
      }
    }

    // eventos de envio de mensagem (formulario e tecla enter)
    /*      FEITO      */
    chatForm.addEventListener('submit', function (event) {
      event.preventDefault();
      handleSubmit();
    });

    /*      FEITO      */
    inputField.addEventListener('keydown', function (event) {
      // Enter envia; Shift+Enter cria nova linha no textarea
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSubmit();
      }
    });

    /*      FEITO      */
    inputField.addEventListener('input', autoResizeInput);

    // função principal responsavel por enviar a mensagem do usuario
    // e processar a resposta do bot
    /*      FEITO      */
    async function handleSubmit() {
      const userText = sanitizeInput(inputField.value); // sanitiza o texto digitado pelo usuario

      if (!userText || isSending) {
        return;
      }

      if (!hasStarted) {
        hasStarted = true;
        activateConversationUI();
      }

      appendMessage('user', userText);
      inputField.value = '';
      autoResizeInput();

      const typingMessage = appendTypingMessage();
      setSendingState(true);

      try {
        const botAnswer = await requestBotAnswer(userText, modeloSelecionado.value);
        replaceTypingWithText(
          typingMessage,
          botAnswer || 'Nao consegui gerar uma resposta agora. Tente novamente.'
        );
      } catch (error) {
        replaceTypingWithText(
          typingMessage,
          'Tive um erro ao buscar a resposta. Tente de novo em instantes.'
        );
      } finally {
        setSendingState(false);
      }
    }

    // ativa mudanças visuais quando a primeira mensagem é enviada
    /*       FEITO      */
    function activateConversationUI(titulo = '...') {
      chatContainer.classList.add('chat-started');

      if (headerContent) {
        headerContent.style.display = 'none';
      }

      if (!chatHeader.querySelector('.topic-pill')) {
        const topicPill = document.createElement('div');
        topicPill.className = 'topic-pill';
        topicPill.textContent = titulo;
        chatHeader.appendChild(topicPill);
      }
    }

  /*        FEITO      */
  function atualizarTituloConversa(titulo) {
    // Procura a pill que foi criada na tela
    const topicPill = chatHeader.querySelector('.topic-pill');
    
    // Se ela existir, atualiza o texto
    if (topicPill) {
      topicPill.textContent = titulo;
    }
  }

    // cria e adiciona uma mensagem (usuario ou bot) no chat
    /*       FEITO     */
    function appendMessage(author, text) {
      messageCounter += 1;

      const message = document.createElement('div');
      message.className = 'message ' + (author === 'user' ? 'message-user' : 'message-bot');
      message.setAttribute('data-author', author);
      message.setAttribute('data-message-id', String(messageCounter));

      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      bubble.innerHTML = marked.parse(text);
      bubble.style.whiteSpace = 'pre-wrap';

      message.appendChild(bubble);
      chatMessages.appendChild(message);
      scrollToBottom();

      return message;
    }

    // exibe animação de "bot digitando"
    /*      FEITO      */
    function appendTypingMessage() {
      const message = appendMessage('bot', '');
      const bubble = message.querySelector('.bubble');

      if (!bubble) {
        return message;
      }

      bubble.classList.add('typing-bubble');
      bubble.setAttribute('aria-label', 'Boole esta digitando');
      bubble.innerHTML = '';

      for (let i = 0; i < 3; i += 1) {
        const dot = document.createElement('span');
        dot.className = 'typing-dot';
        dot.style.animationDelay = String(i * 0.15) + 's';
        bubble.appendChild(dot);
      }

      return message;
    }

    // substitui a animação de digitação pelo texto final da resposta
    /*       FEITO      */
    function replaceTypingWithText(typingMessage, text) {
      if (!typingMessage) {
        appendMessage('bot', text);
        return;
      }

      const bubble = typingMessage.querySelector('.bubble');

      if (!bubble) {
        appendMessage('bot', text);
        return;
      }

      bubble.classList.remove('typing-bubble');
      bubble.innerHTML = marked.parse(text);
      bubble.style.whiteSpace = 'pre-wrap';
      scrollToBottom();
    }

    // faz requisição ao backend para obter resposta da IA
    /*      FEITO      */
    async function requestBotAnswer(question, modelo) {
      // envia pergunta para o servidor usando a URL atual da pagina (/chat ou /chat/id)
      const currentUrl = window.location.pathname;
      const response = await fetch(currentUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ duvida: question, num: messageCounter, modelo: modelo })
      });

      let data = null;
      try {
        data = await response.json();
      } catch (_ignored) {
        data = null;
      }

      if (!response.ok) {
        const errorMessage = data && data.erro ? data.erro : 'Falha na requisicao';
        throw new Error(errorMessage);
      }

      if (!data || !data.resultado) {
        throw new Error('Resposta vazia');
      }
      
      // se for um chat recém-criado, atualiza a URL do navegador com o novo ID
      if (data.novo_chat && data.id_chat) {
        window.history.pushState({}, '', '/chat/' + data.id_chat);
      }
      
      // atualiza o titulo do chat
      const titulo = String(data.titulo).trim();

      // atualizar titulo caso seja primeira mensagem
      if (messageCounter < 3) {
        atualizarTituloConversa(titulo);
      }

      // chama a função da sidebar
      if (typeof window.carregarSidebarChats === 'function') {
          window.carregarSidebarChats();
      } else {
          console.warn("A função da sidebar ainda não foi carregada no window.");
      }
      
      return String(data.resultado).trim();
    }

    // controla estado de envio (loading/desabilitado)
    /*        FEITO      */
    function setSendingState(state) {
      isSending = state;
      inputField.disabled = state;
      sendButton.disabled = state;

      if (state) {
        sendButton.classList.add('is-loading');
      } else {
        sendButton.classList.remove('is-loading');
        autoResizeInput();
        inputField.focus();
      }
    }

    // mantem o scroll sempre no final do chat
    /*      FEITO      */
    function scrollToBottom() {
      chatMessages.scrollTop = chatMessages.scrollHeight;
      window.requestAnimationFrame(function () {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      });
    }

    // auto-ajusta altura do textarea ate o max-height e ativa scroll interno
    /*      FEITO      */
    function autoResizeInput() {
      inputField.style.height = 'auto';

      const maxHeight = parseFloat(window.getComputedStyle(inputField).maxHeight) || 140;
      const nextHeight = Math.min(inputField.scrollHeight, maxHeight);

      inputField.style.height = String(nextHeight) + 'px';
      inputField.style.overflowY = inputField.scrollHeight > maxHeight ? 'auto' : 'hidden';
    }

    // remove espaços extras e normaliza entrada do usuario
    /*      FEITO      */
    function sanitizeInput(value) {
      return String(value || '').replace(/\s+/g, ' ').trim();
    }

    // remove mensagens de exemplo iniciais do chat
    /*      FEITO      */
    function clearExampleMessages() {
      const sampleMessages = chatMessages.querySelectorAll('.message');
      if (sampleMessages.length > 0) {
        chatMessages.innerHTML = '';
      }
    }

    // capitaliza e limita o tamanho do texto
    /* Não estava sendo usado então eu não coloquei */
    function capAndTrim(text) {
      const safe = String(text || '').trim();

      if (!safe) {
        return 'Nova duvida';
      }

      const normalized = safe.charAt(0).toUpperCase() + safe.slice(1);

      if (normalized.length <= 40) {
        return normalized;
      }

      return normalized.slice(0, 39).trim() + '...';
    }

    // injeta estilos CSS dinamicamente via JavaScript
    /*     Movido para um arquivo css separado    */
    /*      FEITO      */
    function injectDynamicStyles() {
      if (document.getElementById('chat-js-dynamic-style')) {
        return;
      }

      const style = document.createElement('style');
      style.id = 'chat-js-dynamic-style';
      style.textContent = [
        '.chat-container.chat-started .chat-header { min-height: 72px; }',
        '.chat-container.chat-started .chat-main { padding-top: 8px; }',
        '.topic-pill {',
        '  position: absolute;',
        '  top: 24px;',
        '  left: 50%;',
        '  transform: translateX(-50%);',
        '  max-width: min(70vw, 380px);',
        '  padding: 8px 14px;',
        '  border-radius: 8px;',
        '  background: rgba(15, 179, 190, 0.18);',
        '  border: 1px solid rgba(15, 179, 190, 0.26);',
        '  color: #71dbe3;',
        '  font-size: 1rem;',
        '  font-weight: 700;',
        '  white-space: nowrap;',
        '  overflow: hidden;',
        '  text-overflow: ellipsis;',
        '}',
        '.typing-bubble { display: inline-flex; align-items: center; gap: 6px; min-height: 26px; }',
        '.typing-dot {',
        '  width: 7px;',
        '  height: 7px;',
        '  border-radius: 50%;',
        '  background: rgba(230, 248, 248, 0.95);',
        '  animation: chatTyping 1s infinite ease-in-out;',
        '}',
        '.send-button.is-loading { opacity: 0.55; pointer-events: none; }',
        '@keyframes chatTyping {',
        '  0%, 80%, 100% { transform: translateY(0); opacity: 0.35; }',
        '  40% { transform: translateY(-3px); opacity: 1; }',
        '}',
        '@media (max-width: 700px) {',
        '  .topic-pill { max-width: 82vw; font-size: 0.72rem; }',
        '}'
      ].join('');

      document.head.appendChild(style);
    }
  });
})();

// COMPORTAMENTO MENU DROPDOWN DE SELECIONAR MODELO
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
