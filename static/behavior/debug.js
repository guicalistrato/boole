// gerenciamento do modo debug integrado ao chat
// controla estado, UI, validação de codigo e comunicação com backend

(function () {
  'use strict';

  // estado privado do debug
  let debugState = {
    enabled: false,
    code: '',
    codeElement: null,
    containerElement: null,
    isValid: false
  };

  const DEBUG_CONTAINER_ID = 'debug-code-container';
  const DEBUG_INPUT_ID = 'debug-code-input';
  const DEBUG_OUTPUT_ID = 'debug-output-container';
  const MIN_CODE_LENGTH = 5;
  const MAX_CODE_LENGTH = 50000;

  // Inicia quando a pagina carrega
  document.addEventListener('DOMContentLoaded', initDebugMode);

  function initDebugMode() {
    const chatContainer = document.getElementById('chat-container');
    const isDebugMode = chatContainer?.getAttribute('data-debug-mode') === 'true';

    debugState.codeElement = document.getElementById('input-field');

    if (isDebugMode) {
      enableDebugMode();
      //createDebugUI();
    }

    window.DebugAPI = {
      isEnabled: () => debugState.enabled,
      getCode: () => debugState.code,
      enableDebugMode: enableDebugMode,
      disableDebugMode: disableDebugMode,
      validateCode: validateCode,
      getDebugData: getDebugData,
      clearDebugCode: clearDebugCode,
      renderDebugInfo: renderDebugInfo
    };
  }

  // Ativa modo debug
  function enableDebugMode() {
    if (debugState.enabled) return;

    debugState.enabled = true;

    if (debugState.codeElement) {
      debugState.codeElement.placeholder = 'Cole seu código aqui para debug...';
      debugState.codeElement.focus();
      setupCodeInputListener();
    }
  }

  // desativa modo debug
  function disableDebugMode() {
    if (!debugState.enabled) return;
    debugState.enabled = false;
    hideDebugContainer();
    clearDebugCode();
  }

  // Limpa codigo digitado
  function clearDebugCode() {
    debugState.code = '';
    debugState.isValid = false;

    if (debugState.codeElement) {
      debugState.codeElement.value = '';
    }
  }

  // cria UI uma única vez
  function createDebugUI() {
    if (document.getElementById(DEBUG_CONTAINER_ID)) return;

    const chatForm = document.getElementById('chat-form');
    if (!chatForm) return;

    const container = document.createElement('div');
    container.id = DEBUG_CONTAINER_ID;
    container.setAttribute('data-debug-section', 'code-container');

    const label = document.createElement('label');
    label.htmlFor = DEBUG_INPUT_ID;
    label.setAttribute('data-debug-section', 'code-label');
    label.textContent = 'Seu código:';

    const codeInput = document.createElement('textarea');
    codeInput.id = DEBUG_INPUT_ID;
    codeInput.placeholder = 'Cole seu código aqui para debug...';
    codeInput.setAttribute('rows', '8');
    codeInput.setAttribute('data-debug-section', 'code-input');
    codeInput.setAttribute('spellcheck', 'false');

    const feedbackContainer = document.createElement('div');
    feedbackContainer.id = 'debug-feedback';
    feedbackContainer.setAttribute('data-debug-section', 'feedback');
    feedbackContainer.setAttribute('aria-live', 'polite');

    const charCounter = document.createElement('span');
    charCounter.id = 'debug-char-counter';
    charCounter.setAttribute('data-debug-section', 'char-counter');
    charCounter.textContent = `0 / ${MAX_CODE_LENGTH}`;

    feedbackContainer.appendChild(charCounter);
    container.appendChild(label);
    container.appendChild(codeInput);
    container.appendChild(feedbackContainer);

    chatForm.parentNode.insertBefore(container, chatForm);

    debugState.containerElement = container;
    debugState.codeElement = codeInput;

    setupCodeInputListener();
  }

  function showDebugContainer() {
    if (debugState.containerElement) {
      debugState.containerElement.style.display = 'block';
    }
  }

  function hideDebugContainer() {
    if (debugState.containerElement) {
      debugState.containerElement.style.display = 'none';
    }
  }

  function focusCodeInput() {
    if (debugState.codeElement) {
      debugState.codeElement.focus();
    }
  }

  // Valida se o cdigo e valido
  function validateCode(code) {
    const trimmed = String(code || '').trim();

    if (trimmed.length === 0) {
      debugState.isValid = false;
      return { valid: false, error: 'Código não pode estar vazio' };
    }

    if (trimmed.length < MIN_CODE_LENGTH) {
      debugState.isValid = false;
      return { valid: false, error: `Mínimo ${MIN_CODE_LENGTH} caracteres` };
    }

    if (trimmed.length > MAX_CODE_LENGTH) {
      debugState.isValid = false;
      return { valid: false, error: `Máximo ${MAX_CODE_LENGTH} caracteres` };
    }

    if (!/[a-zA-Z0-9]/.test(trimmed)) {
      debugState.isValid = false;
      return { valid: false, error: 'Adicione código válido' };
    }

    debugState.isValid = true;
    debugState.code = trimmed;
    return { valid: true };
  }

  // Atualiza feedback visual
  function updateCodeValidationState() {
    if (!debugState.codeElement) return;

    const feedbackEl = document.getElementById('debug-feedback');
    const counterEl = document.getElementById('debug-char-counter');

    if (!feedbackEl || !counterEl) return;

    const validation = validateCode(debugState.codeElement.value);
    const charCount = debugState.codeElement.value.length;

    counterEl.textContent = `${charCount} / ${MAX_CODE_LENGTH}`;
    feedbackEl.innerHTML = '';

    if (!validation.valid && debugState.codeElement.value.length > 0) {
      const errorMsg = document.createElement('span');
      errorMsg.setAttribute('data-debug-section', 'error-message');
      errorMsg.setAttribute('role', 'alert');
      errorMsg.style.color = 'var(--error-color, #ff6b6b)';
      errorMsg.textContent = validation.error;
      feedbackEl.appendChild(errorMsg);
    }
  }

  // ertorna dados prontos para enviar
  function getDebugData() {
    if (!debugState.enabled) {
      return null;
    }

    const trimmed = String(debugState.code || '').trim();

    // No modo debug, 
    if (trimmed.length === 0) {
      throw new Error('Por favor, cole seu código no campo de entrada');
    }

    // limite mximo apenas
    if (trimmed.length > MAX_CODE_LENGTH) {
      throw new Error(`Máximo ${MAX_CODE_LENGTH} caracteres`);
    }

    debugState.code = trimmed;
    return {
      codigo: debugState.code,
      modo_debug: true,
      timestamp: new Date().toISOString()
    };
  }

  // Renderiza info de debug na resposta
  function renderDebugInfo(debugInfo) {
    if (!debugInfo || !debugState.enabled) {
      return null;
    }

    const debugOutput = document.createElement('div');
    debugOutput.id = DEBUG_OUTPUT_ID;
    debugOutput.setAttribute('data-debug-section', 'output');

    if (debugInfo.execution_time) {
      const timeEl = document.createElement('p');
      timeEl.innerHTML = `<strong>⏱️ Tempo:</strong> ${debugInfo.execution_time}ms`;
      debugOutput.appendChild(timeEl);
    }

    if (debugInfo.errors && debugInfo.errors.length > 0) {
      const errorsEl = document.createElement('div');
      const errTitle = document.createElement('strong');
      errTitle.textContent = '❌ Erros:';
      errorsEl.appendChild(errTitle);

      debugInfo.errors.forEach(err => {
        const errItem = document.createElement('p');
        errItem.style.marginLeft = '1rem';
        errItem.textContent = `• ${err}`;
        errorsEl.appendChild(errItem);
      });

      debugOutput.appendChild(errorsEl);
    }

    if (debugInfo.output) {
      const outputEl = document.createElement('p');
      outputEl.innerHTML = `<strong>📤 Output:</strong> <code>${escapeHtml(debugInfo.output)}</code>`;
      debugOutput.appendChild(outputEl);
    }

    return debugOutput;
  }

  // Configura listeners do textarea
  function setupCodeInputListener() {
    if (!debugState.codeElement || debugState.codeElement.dataset.debugBound === 'true') {
      return;
    }

    debugState.codeElement.dataset.debugBound = 'true';

    debugState.codeElement.addEventListener('input', function(event) {
      debugState.code = event.target.value;
    });

    debugState.codeElement.addEventListener('keydown', function(event) {
      if (event.key === 'Tab') {
        event.preventDefault();

        const start = event.target.selectionStart;
        const end = event.target.selectionEnd;

        event.target.value =
          event.target.value.substring(0, start) + '\t' + event.target.value.substring(end);

        event.target.selectionStart = event.target.selectionEnd = start + 1;
        debugState.code = event.target.value;
      }
    });
  }

  // Escapa HTML para segurança
  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, (m) => map[m]);
  }

  // Limpa ao sair
  window.addEventListener('beforeunload', () => {
    clearDebugCode();
  });

})();