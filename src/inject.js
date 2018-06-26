(() => {

    let appWindow;

    // Receive handshake from the player eventlistener
    window.addEventListener('message', (e) => {
        appWindow = e.source;
    });

    window.addEventListener('load', () => {
        setTimeout(() => {

            document.addEventListener('mousedown', function(e) {
                e.preventDefault();

                const className = e.target.className;
                console.log(className, className.includes('ypt-youtube-button'));

                switch(true){
                    case className.includes('ytp-youtube-button'):
                        appWindow.postMessage({event: 'navigate', href: e.target.href}, '*');
                        break;

                    case className.includes('ytp-fullscreen-button'):
                        appWindow.postMessage({event: 'fullscreen'}, '*');
                        break;

                    case className.includes('ytp-ce-covering-overlay'):
                        appWindow.postMessage({event: 'loadVideo', href: e.target.href}, '*');
                        break;
                }
            }, false);
        }, 1000)

    });

})();
