const DOM_index = {}

DOM_index.eventListenerModelos = function(){
    const modeloSelecionado = DOM_index.modeloSelecionado;
    document.querySelectorAll('#opcoes-modelo a').forEach(opcao => {
      opcao.addEventListener('click', (e) => modeloSelecionado.value = e.currentTarget.getAttribute('value'));
    });
}

DOM_index.clearExampleMessages = function(){
  const chatMessages = DOM_index.chatMessages;

  const sampleMessages = chatMessages.querySelectorAll('.message');
  if (sampleMessages.length > 0) {
    chatMessages.innerHTML = '';
  }
}

DOM_index.scrollToBottom = function () {
    const chatMessages = DOM_index.chatMessages;

    chatMessages.scrollTop = chatMessages.scrollHeight;
    window.requestAnimationFrame(function () {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
}

DOM_index.autoResizeInput = function () {
    const inputField = DOM_index.inputField;
    
    inputField.style.height = 'auto';

    const maxHeight = parseFloat(window.getComputedStyle(inputField).maxHeight) || 140;
    const nextHeight = Math.min(inputField.scrollHeight, maxHeight);

    inputField.style.height = String(nextHeight) + 'px';
    inputField.style.overflowY = inputField.scrollHeight > maxHeight ? 'auto' : 'hidden';
}

DOM_index.activateConversationUI = function (titulo = '...') {
    const chatContainer = DOM_index.chatContainer;
    const headerContent = DOM_index.headerContent;
    const chatHeader = DOM_index.chatHeader;

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

DOM_index.appendMessage = function (author, text) {
    const chatMessages = DOM_index.chatMessages;

    States_index.messageCounter += 1;

    const message = document.createElement('div');
    message.className = 'message ' + (author === 'user' ? 'message-user' : 'message-bot');
    message.setAttribute('data-author', author);
    message.setAttribute('data-message-id', String(States_index.messageCounter));

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerHTML = marked.parse(text);
    bubble.style.whiteSpace = 'pre-wrap';

    message.appendChild(bubble);
    chatMessages.appendChild(message);
    DOM_index.scrollToBottom();

    return message;
}

DOM_index.atualizarTituloConversa = function(titulo) {
    const chatHeader = DOM_index.chatHeader;

    // Procura a pill que foi criada na tela
    const topicPill = chatHeader.querySelector('.topic-pill');
    
    // Se ela existir, atualiza o texto
    if (topicPill) {
      topicPill.textContent = titulo;
    }
}

DOM_index.sanitizeInput = function(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

DOM_index.appendTypingMessage = function() {
    const message = DOM_index.appendMessage('bot', '');
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

DOM_index.replaceTypingWithText = function(typingMessage, text) {
    if (!typingMessage) {
        DOM_index.appendMessage('bot', text);
        return;
    }

    const bubble = typingMessage.querySelector('.bubble');

    if (!bubble) {
        DOM_index.appendMessage('bot', text);
        return;
    }

    bubble.classList.remove('typing-bubble');
    bubble.innerHTML = marked.parse(text);
    bubble.style.whiteSpace = 'pre-wrap';
    DOM_index.scrollToBottom();
}

DOM_index.inicializarPágina = function(){
    document.addEventListener('DOMContentLoaded', function () {
        DOM_index.chatContainer = document.getElementById('chat-container');
        DOM_index.chatHeader = document.getElementById('chat-header');
        DOM_index.headerContent = DOM_index.chatHeader ? DOM_index.chatHeader.querySelector('.header-content') : null;
        DOM_index.chatMessages = document.getElementById('chat-messages');
        DOM_index.chatForm = document.getElementById('chat-form');
        DOM_index.inputField = document.getElementById('input-field');
        DOM_index.sendButton = document.getElementById('send-button');
        DOM_index.modeloSelecionado = document.getElementById('modelo');
        DOM_index.modeloSelecionado.value = "padrão";
        
        if (!DOM_index.chatContainer || !DOM_index.chatHeader || !DOM_index.chatMessages
            || !DOM_index.chatForm || !DOM_index.inputField || !DOM_index.sendButton
            || !DOM_index.modeloSelecionado) {
            
            return;
        }

        DOM_index.eventListenerModelos();
        DOM_index.clearExampleMessages();
        DOM_index.autoResizeInput();
        DOM_index.inputField.focus();

        Backend_index.inicializar();

        DOM_index.chatForm.addEventListener('submit', function (event) {
            event.preventDefault();
            Backend_index.handleSubmit();
        })

        DOM_index.inputField.addEventListener('keydown', function (event) {
            // Enter envia; Shift+Enter cria nova linha no textarea
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                Backend_index.handleSubmit();
            }
        });

        DOM_index.inputField.addEventListener('input', DOM_index.autoResizeInput);
    })
}