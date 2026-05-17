/*
if (data.novo_chat && data.id_chat) {
        window.history.pushState({}, '', '/chat/' + data.id_chat);
      } 
*/

function enviar_debug() {
    const codigo = document.getElementById('codigo').value;
    fetch('/debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: codigo }),
    })
    .then(res => res.json())
    .then(data => {
        if (data.redirect) window.location.href = data.redirect; 
    });
}