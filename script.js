// Just Bot v1.0 - Core Logic Engine (v2.6 Full Structure)
document.addEventListener('DOMContentLoaded', () => {
    const btnToggleSettings = document.getElementById('btnToggleSettings');
    const apiConfigPanel = document.getElementById('apiConfigPanel');
    const grokApiKeyInput = document.getElementById('grokApiKeyInput');
    const btnSaveApi = document.getElementById('btnSaveApi');
    
    const chatFeed = document.getElementById('chatFeed');
    const chatInput = document.getElementById('chatInput');
    const btnSendMessage = document.getElementById('btnSendMessage');
    const quickCmdButtons = document.querySelectorAll('.quick-cmd');

    let grokApiKey = localStorage.getItem('grok_api_key') || '';
    if (grokApiKey && grokApiKeyInput) {
        grokApiKeyInput.value = grokApiKey;
    }

    if (btnToggleSettings && apiConfigPanel) {
        btnToggleSettings.addEventListener('click', () => {
            apiConfigPanel.style.display = apiConfigPanel.style.display === 'none' ? 'block' : 'none';
        });
    }

    if (btnSaveApi && grokApiKeyInput) {
        btnSaveApi.addEventListener('click', () => {
            const keyValue = grokApiKeyInput.value.trim();
            if (keyValue) {
                localStorage.setItem('grok_api_key', keyValue);
                grokApiKey = keyValue;
                alert('🔑 Grok API Key berhasil disimpan!');
                if (apiConfigPanel) apiConfigPanel.style.display = 'none';
            } else {
                alert('⚠️ Harap masukkan API Key yang valid.');
            }
        });
    }

    function appendBubble(text, senderType) {
        if (!chatFeed) return;
        const now = new Date();
        const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        const bubbleElement = document.createElement('div');
        bubbleElement.className = `bubble ${senderType}-bubble`;

        let nameTag = senderType === 'user' ? 'Architect (Khafidz)' : 'Just Bot v1.0';

        bubbleElement.innerHTML = `
            <strong style="display:block; font-size:12px; margin-bottom:4px; color:${senderType === 'user' ? '#9fb8ff' : '#4f8cff'};">${nameTag}</strong>
            <span>${text}</span>
            <small>${timeString}</small>
        `;

        chatFeed.appendChild(bubbleElement);
        chatFeed.scrollTop = chatFeed.scrollHeight;
    }

    async function fetchGrokResponse(promptText) {
        if (!grokApiKey) {
            appendBubble('Akses ditolak. Konfigurasikan API Key Grok Anda terlebih dahulu di menu sidebar.', 'bot');
            return;
        }

        const typingId = 'typing_' + Date.now();
        const typingBubble = document.createElement('div');
        typingBubble.id = typingId;
        typingBubble.className = 'bubble bot-bubble typing';
        typingBubble.innerHTML = `<span></span><span></span><span></span>`;
        chatFeed.appendChild(typingBubble);
        chatFeed.scrollTop = chatFeed.scrollHeight;

        try {
            const response = await fetch('https://api.x.ai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${grokApiKey}`
                },
                body: JSON.stringify({
                    model: 'grok-beta',
                    messages: [
                        { role: 'system', content: 'You are Just Bot v1.0, an advanced web dashboard AI. Your architect is Ahmad Al-Khafidz Badali.' },
                        { role: 'user', content: promptText }
                    ]
                })
            });

            const activeTyping = document.getElementById(typingId);
            if (activeTyping) activeTyping.remove();

            if (!response.ok) {
                const errData = await response.json();
                appendBubble(`API Error: ${errData.error?.message || response.statusText}`, 'bot');
                return;
            }

            const data = await response.json();
            appendBubble(data.choices[0].message.content, 'bot');

        } catch (error) {
            const activeTyping = document.getElementById(typingId);
            if (activeTyping) activeTyping.remove();
            appendBubble(`Network Error: ${error.message}`, 'bot');
        }
    }

    function processSendMessage() {
        if (!chatInput) return;
        const text = chatInput.value.trim();
        if (!text) return;

        appendBubble(text, 'user');
        chatInput.value = '';
        fetchGrokResponse(text);
    }

    if (btnSendMessage) btnSendMessage.onclick = processSendMessage;
    if (chatInput) {
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') processSendMessage();
        });
    }

    // Fungsi klik tombol Quick Command
    quickCmdButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (chatInput) {
                chatInput.value = btn.innerText;
                chatInput.focus();
            }
        });
    });
});
