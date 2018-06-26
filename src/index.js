'use strict';

// application options
const options = {
    width: 400,
    height: 225,
    pinned: true
};

let toggleFullscreen;
let loadVideo;
let resetSize;

const posX = Math.round((screen.availWidth - options.width) / 2);
const posY = Math.round((screen.availHeight - options.height) / 2);

// application init
chrome.runtime.onInstalled.addListener(() => {
    createContextMenus();
});

// listen to js events
chrome.runtime.onMessage.addListener(messageListener);

// listen to context menu events
chrome.contextMenus.onClicked.addListener(menuListener)

// application window launch
chrome.app.runtime.onLaunched.addListener(createPlayer);


/**
 * ================================================
 *                 APPLICATION CODE
 * ================================================
 */

function createContextMenus() {
    chrome.contextMenus.create({
        id: 'reset',
        title: 'Reset',
        contexts: ['all']
    });
}

function createPlayer() {
    chrome.app.window.create('src/player.html', {
        id: 'player',
        frame: 'none',
        outerBounds: {
            width: options.width,
            height: options.height,
            left: posX,
            top: posY,
            minWidth: 200,
            minHeight: 150
        },
        alwaysOnTop: true,
        resizable: true
    }, renderPlayer)
}

function renderPlayer(app) {
    app.contentWindow.onload = () => {
        const closeBtn = app.contentWindow.document.getElementById('close');
        const pinBtn = app.contentWindow.document.getElementById('pin');
        const input = app.contentWindow.document.getElementById('input');
        const webview = app.contentWindow.document.getElementById('webview');
        const welcome = app.contentWindow.document.getElementById('welcome');

        webview.addContentScripts(injectControls());

        closeBtn.onclick = () => {
            app.contentWindow.close();
        };

        pinBtn.onclick = () => {
            options.pinned = !options.pinned;
            app.setAlwaysOnTop(options.pinned);
            pinBtn.innerHTML = options.pinned ? 'unpin' : 'pin';
        };

        input.addEventListener('paste', (e) => {
            setTimeout(() => {
                loadVideo(e.target.value);
            });
        });

        toggleFullscreen = () => {
            if (app.isFullscreen()) {
                app.restore();
            } else {
                app.fullscreen();
            }
        }

        resetSize = () => {
            app.outerBounds.setSize(options.width, options.height);
            app.outerBounds.setPosition(posX, posY);
        }

        loadVideo = (url) => {
            const videoId = extractId(url);
            if (!videoId) {
                return;
            }
            webview.src = `https://youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&version=3`;
            webview.style.display = 'block';
            welcome.style.display = 'none';
        }
    };
}

function extractId(url) {
    const parts = url.match(/^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/);
    return parts && parts[2];
}

function injectControls() {
    return [
        {
            name: 'playerCSS',
            matches: ['*://*.youtube.com/*'],
            css: {files: ['src/inject.css']},
            run_at: 'document_start'
        }, {
            name: 'playerJS',
            matches: ['*://*.youtube.com/*'],
            js: {files: ['src/inject.js']},
            run_at: 'document_end'
        }
    ];
}

function messageListener(request) {
    switch (request.event) {
        case 'navigate':
            chrome.browser.openTab({url: request.href});
            break;
        case 'fullscreen':
            toggleFullscreen();
            break;
        case 'loadVideo':
            loadVideo(request.href);
            break;
        default:
            break;
    }
}

function menuListener(info) {
    switch (info.menuItemId) {
        case 'reset':
            resetSize();
            break;
    }
}
