const Backend_index = {}

Backend_index.pathParts = window.location.pathname.split('/');
Backend_index.possibleChatId = Backend_index.pathParts[Backend_index.pathParts.length - 1];
Backend_index.isDebugRoute = window.location.pathname === '/debug';

Backend_index.carregarHistorico = async function (chatId) {
    let data = null;
    try {
        States_index.setSendingState(true); // Desativa o input enquanto carrega

        const response = await fetch('/api/chat/' + chatId);

        if (!response.ok) {
            throw new Error('Histórico não encontrado');
        }

        data = await response.json();

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
        console.error(error);
        alert("Não foi possível carregar a conversa.");
    } finally {
        States_index.setSendingState(false);
    }
}

Backend_index.requestBotAnswer = async function(question, modelo) {
    const currentUrl = window.location.pathname;
    const isDebugMode = DOM_index.chatContainer?.getAttribute('data-debug-mode') === 'true';

    let finalChatUrl = currentUrl;
    if (currentUrl === '/debug') {
        finalChatUrl = '/chat'; // Se for a pagina inicial de debug, a primeira pergunta vai para /chat
    }

    // Se estamos em /debug com codigo, primeiro salvamos o codigo no backend
    if (isDebugMode && window.DebugAPI && window.DebugAPI.isEnabled()) {
        try {
            const debugData = window.DebugAPI.getDebugData();

            // POST para /debug para salvar codigo e marcar session["debug"] = True
            const debugResponse = await fetch('/debug', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
                body: JSON.stringify({ codigo: debugData.codigo })
            });

            const debugResult = await debugResponse.json();

            if (!debugResponse.ok) {
                const errorMessage = debugResult && debugResult.erro ? debugResult.erro : 'Erro ao salvar código de debug';
                throw new Error(errorMessage);
            }

            if (debugResult && debugResult.redirect) {
                finalChatUrl = debugResult.redirect;
                window.history.pushState({}, '', finalChatUrl);
                window.DebugAPI.clearDebugCode();
            }
        } catch (error) {
            // se getDebugData falhar (ex: codigo vazio), o erro é lançado aqui
            throw new Error(`Erro no modo debug: ${error.message}`);
        }
    }

    const body = {
        duvida: question,
        num: States_index.messageCounter,
        modelo: modelo
    };

    const response = await fetch(finalChatUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errorMessage = errData.erro || `Falha na requisição (status: ${response.status})`;
        throw new Error(errorMessage);
    }

    const data = await response.json();

    if (!data || !data.resultado) {
        throw new Error('Resposta do servidor está vazia ou mal formatada.');
    }

    if (data.novo_chat && data.id_chat) {
        window.history.pushState({}, '', '/chat/' + data.id_chat);
    }

    const titulo = String(data.titulo).trim();

    if (States_index.messageCounter < 3) {
        DOM_index.atualizarTituloConversa(titulo);
    }

    if (typeof window.carregarSidebarChats === 'function') {
        window.carregarSidebarChats();
    }

    return String(data.resultado).trim();
}

Backend_index.handleSubmit = async function() {
    const userText = DOM_index.inputField.value; // Pega o valor bruto, sem sanitizar ainda

    if (!userText.trim() || States_index.isSending) {
        return;
    }

    if (!States_index.hasStarted) {
        States_index.hasStarted = true;
        DOM_index.activateConversationUI();
    }

    DOM_index.appendMessage('user', userText);
    DOM_index.inputField.value = '';
    DOM_index.autoResizeInput();

    const typingMessage = DOM_index.appendTypingMessage();
    States_index.setSendingState(true);

    try {
        const botAnswer = await Backend_index.requestBotAnswer(userText, DOM_index.modeloSelecionado ? DOM_index.modeloSelecionado.value : "padrão");
        DOM_index.replaceTypingWithText(
            typingMessage,
            botAnswer || 'Nao consegui gerar uma resposta agora. Tente novamente.'
        );
    } catch (error) {
        console.error('Erro no handleSubmit:', error);
        DOM_index.replaceTypingWithText(
            typingMessage,
            `Desculpe, ocorreu um erro ao processar sua dúvida. Detalhe: ${error.message}`
        );
    } finally {
        States_index.setSendingState(false);
    }
}

Backend_index.inicializar = function(){
    if (!Backend_index.isDebugRoute
        && Backend_index.possibleChatId
        && Backend_index.possibleChatId !== 'chat'
        && Backend_index.possibleChatId !== '') {
        
        Backend_index.carregarHistorico(Backend_index.possibleChatId);
    }
};