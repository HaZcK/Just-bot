// Just Bot v1.0 - Core Logic Engine (v2.1)
// Architect: Ahmad Al-Khafidz Badali (Gorontalo)

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inisialisasi Elemen DOM
    const btnToggleSettings = document.getElementById('btnToggleSettings');
    const apiConfigPanel = document.getElementById('apiConfigPanel');
    const grokApiKeyInput = document.getElementById('grokApiKeyInput');
    const btnSaveApi = document.getElementById('btnSaveApi');
    
    const chatFeed = document.getElementById('chatFeed');
    const chatInput = document.getElementById('chatInput');
    const btnSendMessage = document.getElementById('btnSendMessage');
    const quickCmdButtons = document.querySelectorAll('.quick-cmd-btn');

    // 2. Load Secured API Key dari Local Storage Browser
    let grokApiKey = localStorage.getItem('grok_api_key') || '';
    if (grokApiKey && grokApiKeyInput) {
        grokApiKeyInput.value = grokApiKey;
    }

    // Toggle Panel API Key
    if (btnToggleSettings && apiConfigPanel) {
        btnToggleSettings.addEventListener('click', () => {
            apiConfigPanel.style.display = apiConfigPanel.style.display === 'none' ? 'block' : 'none';
        });
    }

    // Fungsi Simpan API Key
    if (btnSaveApi && grokApiKeyInput) {
        btnSaveApi.addEventListener('click', () => {
            const keyValue = grokApiKeyInput.value.trim();
            if (keyValue) {
                localStorage.setItem('grok_api_key', keyValue);
                grokApiKey = keyValue;
                alert('🔑 Grok API Key berhasil disimpan! Sistem siap digunakan.');
                if (apiConfigPanel) apiConfigPanel.style.display = 'none';
            } else {
                alert('⚠️ Harap masukkan API Key x.ai yang valid.');
            }
        });
    }

    // 3. Fungsi Pembuat Bubble Chat Dinamis
    function appendBubble(sender, text, type) {
        if (!chatFeed) return;

        const now = new Date();
        const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message message-${type}`;

        let senderTag = 'Just Bot v1.0';
        if (type === 'user') senderTag = 'Architect (Khafidz)';
        if (type === 'system') senderTag = '[SYSTEM_EVENT]';

        messageDiv.innerHTML = `
            <div class="message-meta">
                <span class="sender-tag">${senderTag}</span>
                <span class="time-tag">${timeString}</span>
            </div>
            <div class="message-body">${text}</div>
        `;

        chatFeed.appendChild(messageDiv);
        
        // Auto-scroll HANYA pada container chatFeed
        chatFeed.scrollTop = chatFeed.scrollHeight;
    }

    // 4. Integrasi ke API X.AI (Grok Engine)
    async function fetchGrokAI(userPrompt) {
        if (!grokApiKey) {
            appendBubble('System', 'Akses ditolak. Konfigurasikan API Key Grok Anda terlebih dahulu melalui tombol roda gigi di atas.', 'system');
            return;
        }

        // Tampilkan Loading Indicator
        const loaderId = 'grok_loader_' + Date.now();
        const loaderDiv = document.createElement('div');
        loaderDiv.id = loaderId;
        loaderDiv.className = 'chat-message message-system';
        loaderDiv.innerHTML = `
            <div class="message-body" style="color: #64748b; font-style: italic;">
                <i class="fa-solid fa-spinner fa-spin"></i> Just Bot sedang memproses logika via Grok Engine...
            </div>
        `;
        chatFeed.appendChild(loaderDiv);
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
                        { 
                            role: 'system', 
                            content: 'You are Just Bot v1.0, an advanced web dashboard AI. Your architect is Ahmad Al-Khafidz Badali. Keep your answers clear, logical, and secure.' 
                        },
                        { role: 'user', content: userPrompt }
                    ]
                })
            });

            // Hapus Loading Indicator setelah ada respon
            const activeLoader = document.getElementById(loaderId);
            if (activeLoader) activeLoader.remove();

            if (!response.ok) {
                const errData = await response.json();
                appendBubble('System', `API Error: ${errData.error?.message || response.statusText}`, 'system');
                return;
            }

            const data = await response.json();
            const botReply = data.choices[0].message.content;
            
            // Tampilkan balasan bot di kiri
            appendBubble('Just Bot v1.0', botReply, 'bot');

        } catch (error) {
            const activeLoader = document.getElementById(loaderId);
            if (activeLoader) activeLoader.remove();
            appendBubble('System', `Network Error: ${error.message}`, 'system');
        }
    }

    // 5. Pengendali Aksi Kirim Pesan (Event Handlers)
    function handleMessageSubmission() {
        if (!chatInput) return;
        const messageText = chatInput.value.trim();
        if (!messageText) return;

        // Cetak bubble user ke kanan
        appendBubble('Architect (Khafidz)', messageText, 'user');
        chatInput.value = '';

        // Kirim permintaan ke server Grok AI
        fetchGrokAI(messageText);
    }

    // Eksekusi Klik Tombol Kirim
    if (btnSendMessage) {
        btnSendMessage.onclick = handleMessageSubmission;
    }

    // Eksekusi Tombol Enter pada Keyboard/Tablet
    if (chatInput) {
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                handleMessageSubmission();
            }
        });
    }

    // Klik Otomatis Quick Command
    quickCmdButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (chatInput) {
                chatInput.value = btn.innerText;
                chatInput.focus();
            }
        });
    });
});
