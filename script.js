// Just Bot v1.0 - Core Frontend Engine (Grok Integration)
// Architect: Ahmad Al-Khafidz Badali

document.addEventListener('DOMContentLoaded', () => {
    // 1. DOM Elements Mapping
    const btnToggleSettings = document.querySelector('.settings-btn, [class*="settings"]'); 
    const apiConfigSection = document.querySelector('.api-config, [class*="config"]');
    const apiKeyInput = document.getElementById('grokApiKeyInput') || document.querySelector('input[type="password"], input[placeholder*="xai"]');
    const btnSaveKey = document.getElementById('btnSaveKey') || document.querySelector('button[id*="Save"], button[class*="Simpan"]');
    const chatFeed = document.getElementById('chatFeed') || document.querySelector('.chat-feed, [class*="feed"]');
    const chatInput = document.getElementById('chatInput') || document.querySelector('input[placeholder*="Ketik"]');
    const btnSendMessage = document.getElementById('btnSendMessage') || document.querySelector('button[id*="Send"], footer button');

    // 2. Load Secured API Key from Local Storage
    let grokApiKey = localStorage.getItem('grok_api_key') || '';
    if (grokApiKey && apiKeyInput) {
        apiKeyInput.value = grokApiKey;
    }

    // 3. Toggle Settings Banner Interaction
    if (btnToggleSettings && apiConfigSection) {
        btnToggleSettings.addEventListener('click', () => {
            apiConfigSection.classList.toggle('hidden');
        });
    }

    // 4. Save API Key Event
    if (btnSaveKey && apiKeyInput) {
        btnSaveKey.addEventListener('click', () => {
            const keyValues = apiKeyInput.value.trim();
            if (keyValues) {
                localStorage.setItem('grok_api_key', keyValues);
                grokApiKey = keyValues;
                alert('🔑 Grok API Key berhasil disimpan dengan aman di storage browser Anda!');
                if (apiConfigSection) apiConfigSection.classList.add('hidden');
            } else {
                alert('⚠️ Harap masukkan API Key yang valid sebelum menyimpan.');
            }
        });
    }

    // 5. Append Message Element to Chat Feed
    function appendMessage(sender, text, time = 'Baru saja') {
        if (!chatFeed) return;

        const msgWrapper = document.createElement('div');
        // Deteksi alignment berdasarkan pengirim
        if (sender.toLowerCase() === 'architect' || sender.toLowerCase() === 'user') {
            msgWrapper.className = 'flex flex-col items-end space-y-1 mb-4';
            msgWrapper.innerHTML = `
                <div class="bg-blue-600 text-white p-3 rounded-xl rounded-tr-none max-w-[85%] text-sm">
                    <p class="font-bold text-xs text-blue-200 mb-1">Architect (Khafidz) <span class="font-normal opacity-70">${time}</span></p>
                    <p>${text}</p>
                </div>
            `;
        } else if (sender.toLowerCase() === 'system') {
            msgWrapper.className = 'flex flex-col items-center mb-4';
            msgWrapper.innerHTML = `
                <div class="bg-zinc-900 border border-amber-500/30 text-amber-400 px-4 py-2 rounded-lg text-xs font-mono">
                    [SYSTEM EVENT]: ${text}
                </div>
            `;
        } else {
            // Default Just Bot Response
            msgWrapper.className = 'flex flex-col items-start space-y-1 mb-4';
            msgWrapper.innerHTML = `
                <div class="bg-zinc-900 border border-zinc-800 text-zinc-100 p-3 rounded-xl rounded-tl-none max-w-[85%] text-sm">
                    <p class="font-bold text-xs text-cyan-400 mb-1">Just Bot v1.0 <span class="font-normal text-zinc-500">${time}</span></p>
                    <p>${text}</p>
                </div>
            `;
        }

        chatFeed.appendChild(msgWrapper);
        chatFeed.scrollTop = chatFeed.scrollHeight;
    }

    // 6. Connect & Fetch Data from X.AI Grok API
    async function requestGrokAI(promptText) {
        if (!grokApiKey) {
            appendMessage('System', 'Akses ditolak. Silakan masukkan Grok API Key Anda terlebih dahulu lewat menu pengaturan.');
            return;
        }

        // Buat elemen indikator loading
        const loadingId = 'loader_' + Date.now();
        const loadingIndicator = document.createElement('div');
        loadingIndicator.id = loadingId;
        loadingIndicator.className = 'text-xs font-mono text-zinc-500 italic mb-4 animate-pulse';
        loadingIndicator.innerText = ' Just Bot sedang memproses logika via Grok...';
        if (chatFeed) {
            chatFeed.appendChild(loadingIndicator);
            chatFeed.scrollTop = chatFeed.scrollHeight;
        }

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
                        { 
                            role: 'system', 
                            content: 'You are Just Bot v1.0, an advanced AI system integrated into a web interface. Your architect is Ahmad Al-Khafidz Badali. Keep your answers logical, sharp, clear, and professional.' 
                        },
                        { role: 'user', content: promptText }
                    ]
                })
            });

            // Hapus loader setelah response didapatkan
            const targetLoader = document.getElementById(loadingId);
            if (targetLoader) targetLoader.remove();

            if (!response.ok) {
                const errPayload = await response.json();
                appendMessage('System', `API Error: ${errPayload.error?.message || response.statusText}`);
                return;
            }

            const data = await response.json();
            const replyResult = data.choices[0].message.content;
            
            const now = new Date();
            const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            appendMessage('Just Bot v1.0', replyResult, timeString);

        } catch (error) {
            const targetLoader = document.getElementById(loadingId);
            if (targetLoader) targetLoader.remove();
            appendMessage('System', `Gagal terhubung ke server: ${error.message}`);
        }
    }

    // 7. Event Handler Kirim Pesan
    function processUserAction() {
        if (!chatInput) return;
        const textMessage = chatInput.value.trim();
        if (!textMessage) return;

        const now = new Date();
        const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        // Tampilkan pesan user ke layar
        appendMessage('Architect', textMessage, timeString);
        chatInput.value = '';

        // Mintai respon ke engine Grok
        requestGrokAI(textMessage);
    }

    if (btnSendMessage) {
        btnSendMessage.addEventListener('click', processUserAction);
    }
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') processUserAction();
        });
    }
});
      
