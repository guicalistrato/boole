const Backend_index = {}

Backend_index.pathParts = window.location.pathname.split('/');
Backend_index.possibleChatId = pathParts[pathParts.length - 1];

Backend_index.carregarHistorico = async function (chatId) {
    try {
        States_index.setSendingState(true); // Desativa o input enquanto carrega

        const response = await fetch('/api/chat/' + chatId);
        
        if (!response.ok) {
            throw new Error('Histórico não encontrado');
        }

        const data = await response.json();
        
        if (data.mensagens && data.mensagens.length > 0) {
            States_index.hasStarted = true;
            DOM_index.activateConversationUI(data.nome_chat);
        
            data.mensagens.forEach(msg => {
            DOM_index.appendMessage('user', msg.pergunta);
            DOM_index.appendMessage('bot', msg.resposta);
        });
        
            // O messageCounter precisa saber quantas mensagens já existem
            // para enviar o número certo para a API do Gemini depois
            States_index.messageCounter = data.mensagens.length * 2; 
        }
    } catch (error) {
        if (!data.debug) {
            console.error(error);
            alert("Não foi possível carregar a conversa.");
        }
        
    } finally {
        States_index.setSendingState(false);
    }
}

Backend_index.requestBotAnswer = async function(question, modelo) {
    // envia pergunta para o servidor usando a URL atual da pagina (/chat ou /chat/id)
    const currentUrl = window.location.pathname;
    const response = await fetch(currentUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ duvida: question, num: States_index.messageCounter, modelo: modelo })
    });

    if (!response.ok) {
        const errorMessage = data && data.erro ? data.erro : 'Falha na requisicao';
        throw new Error(errorMessage);
    }

    let data = null;
    try {
        data = await response.json();
    } catch (_ignored) {
        data = null;
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
    if (States_index.messageCounter < 3) {
        DOM_index.atualizarTituloConversa(titulo);
    }

    // chama a função da sidebar
    if (typeof window.carregarSidebarChats === 'function') {
        window.carregarSidebarChats();
    } else {
        console.warn("A função da sidebar ainda não foi carregada no window.");
    }
      
    return String(data.resultado).trim();
}

Backend_index.handleSubmit = async function() {
    const inputField = DOM_index.inputField;

    const userText = DOM_index.sanitizeInput(inputField.value); // sanitiza o texto digitado pelo usuario

    if (!userText || States_index.isSending) {
        return;
    }

    if (!States_index.hasStarted) {
        States_index.hasStarted = true;
        DOM_index.activateConversationUI();
    }

    DOM_index.appendMessage('user', userText);
    inputField.value = '';
    DOM_index.autoResizeInput();

    const typingMessage = DOM_index.appendTypingMessage();
    States_index.setSendingState(true);

    try {
        const botAnswer = await Backend_index.requestBotAnswer(userText, modeloSelecionado.value);
        DOM_index.replaceTypingWithText(
            typingMessage,
            botAnswer || 'Nao consegui gerar uma resposta agora. Tente novamente.'
        );
    } catch (error) {
        DOM_index.replaceTypingWithText(
            typingMessage,
            'Tive um erro ao buscar a resposta. Tente de novo em instantes.'
        );
    } finally {
        States_index.setSendingState(false);
    }
}

Backend_index.inicializar = function(){
    if (Backend_index.possibleChatId
        && Backend_index.possibleChatId !== 'chat'
        && Backend_index.possibleChatId !== '') {
        
        Backend_index.carregarHistorico(Backend_index.possibleChatId);
    }
};