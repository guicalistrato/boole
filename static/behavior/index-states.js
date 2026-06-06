const States_index = {}

States_index.isSending = false;
States_index.hasStarted = false;
States_index.messageCounter = 0;

States_index.setSendingState = function(state){
    const inputField = DOM_index.inputField;
    const sendButton = DOM_index.sendButton;

    States_index.isSending = state;
    inputField.disabled = state;
    sendButton.disabled = state;

    if (state) {
        sendButton.classList.add('is-loading');
    } else {
        sendButton.classList.remove('is-loading');
        DOM_index.autoResizeInput();
        inputField.focus();
    }
}