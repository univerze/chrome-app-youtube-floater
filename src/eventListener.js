const webview = document.getElementById('webview');

webview.addEventListener('contentload', () => {
    webview.contentWindow.postMessage('handshake', '*');
});

window.addEventListener('message', (e) => {
    chrome.runtime.sendMessage(e.data);
});
