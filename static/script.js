
document.addEventListener('DOMContentLoaded', () => {

    const API_BASE_URL = 'http://127.0.0.1:5001';

    
    const fanAudio = document.getElementById('fan-audio');
    const radioPlayerAudio = document.getElementById('radio-player-audio');
    const ambianceAudio = document.getElementById('ambiance-audio');
    const yakshiBubble = document.getElementById('yakshi-bubble');
    const gandharvanBubble = document.getElementById('gandharvan-bubble');
    const chatWindow = document.getElementById('chat-window');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const typingIndicator = document.getElementById('typing-indicator');

    const menuBtn = document.getElementById('menu-btn');
    const pattuBtn = document.getElementById('pattu-btn'); 
    const eavesdropBtn = document.getElementById('eavesdrop-btn');
    const radioBtn = document.getElementById('radio-btn');
    const billBtn = document.getElementById('bill-btn');
    const fan = document.getElementById('broken-fan');

    const menuModal = document.getElementById('menu-modal');
    const pattuModal = document.getElementById('pattu-modal');
    const closeMenuBtn = document.getElementById('close-menu');
    const closePattuBtn = document.getElementById('close-pattu');
    const pattuEntries = document.getElementById('pattu-entries');
    const menuImage = document.querySelector('#menu-modal img');
    
    
    let conversationHistory = [];
    let audioStarted = false;
    
    function startAudio() {
        if (audioStarted) return; 
        ambianceAudio.volume = 0.4; 
        ambianceAudio.play().catch(error => {
            
            console.error("Audio playback failed:", error);
        });
        
        audioStarted = true; 
    }

    
    document.body.addEventListener('click', startAudio, { once: true });

    async function fetchChatResponse() {
        typingIndicator.style.display = 'flex';
        try {
            const response = await fetch(`${API_BASE_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ history: conversationHistory })
            });
            if (!response.ok) throw new Error('Network response was not ok.');
            const data = await response.json();
            addMessageToHistory('assistant', data.reply);
            displayMessage(data.reply, 'assistant');
        } catch (error) {
            console.error("Chat API Error:", error);
            displayMessage("Ayyo, the connection to the other dimensions is fuzzy... Try again.", 'assistant');
        } finally {
            typingIndicator.style.display = 'none';
        }
    }

    async function fetchEavesdropSnippet() {
        
        yakshiBubble.classList.remove('visible');
        gandharvanBubble.classList.remove('visible');
        
        typingIndicator.style.display = 'flex';
        try {
            const response = await fetch(`${API_BASE_URL}/eavesdrop`, { method: 'POST' });
            if (!response.ok) throw new Error('Network response was not ok.');
            const data = await response.json();
    
            
            const yakshiData = data.data.find(d => d.role.toLowerCase() === 'yakshi');
            const gandharvanData = data.data.find(d => d.role.toLowerCase() === 'gandharvan');
    
            if (yakshiData && gandharvanData) {
                
                yakshiBubble.innerHTML = ` "${yakshiData.dialogue}"`;
                gandharvanBubble.innerHTML = `"${gandharvanData.dialogue}"`;
    
                
                yakshiBubble.classList.add('visible');
                gandharvanBubble.classList.add('visible');
    
                
                setTimeout(() => {
                    yakshiBubble.classList.remove('visible');
                    gandharvanBubble.classList.remove('visible');
                }, 15000);
            } else {
              
                displayMessage("You try to listen in, but the voices are muddled...", 'assistant');
            }
            
        } catch (error) {
            console.error("Eavesdrop API Error:", error);
            displayMessage("You try to listen in, but only hear the sizzle of a Vada being fried...", 'assistant');
        } finally {
            typingIndicator.style.display = 'none';
        }
    }
    
    async function fetchPattSummary() {
        typingIndicator.style.display = 'flex';
        try {
            const response = await fetch(`${API_BASE_URL}/get-patt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ history: conversationHistory })
            });
            if (!response.ok) throw new Error('Network response was not ok.');
            const data = await response.json();
            
            
            pattuEntries.innerHTML = '';
            if (data.patt_items && data.patt_items.length > 0) {
                let total = 0;
                data.patt_items.forEach(item => {
                    const entryDiv = document.createElement('div');
                    entryDiv.className = 'patt-item';
                    entryDiv.innerHTML = `<span>${item.item_name}</span><span>${item.price} ✨</span>`;
                    pattuEntries.appendChild(entryDiv);
                    total += item.price;
                });
                document.getElementById('patt-counter').textContent = total;
            } else {
                pattuEntries.innerHTML = "<p>Your patt is empty. Lucky you...</p>";
            }
            pattuModal.style.display = 'flex'; 
        } catch (error) {
            console.error("Patt API Error:", error);
            displayMessage("Chetta seems to have misplaced his pattu book...", 'assistant');
        } finally {
            typingIndicator.style.display = 'none';
        }
    }

    async function fetchSarcasticBill() {
        typingIndicator.style.display = 'flex';
        try {
            const response = await fetch(`${API_BASE_URL}/get-bill`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ history: conversationHistory })
            });
            if (!response.ok) throw new Error('Network response was not ok.');
            const data = await response.json();
             
            
            let formattedBill = "Here is your kanakk, as requested:\n\n<table class='bill-table'>";
            formattedBill += "<tr><th>Item</th><th>Reason</th><th>Price</th></tr>";
            data.bill.forEach(item => {
                formattedBill += `<tr><td>${item.item}</td><td>${item.reason}</td><td>${item.price} ✨</td></tr>`;
            });
            formattedBill += "</table>";

            displayMessage(formattedBill, 'assistant');
        } catch (error) {
            console.error("Bill API Error:", error);
            displayMessage("Ah, the bill... my dimensional ink has run dry. You are lucky this time.", 'assistant');
        } finally {
            typingIndicator.style.display = 'none';
        }
    }

    
    function addMessageToHistory(role, content) {
        conversationHistory.push({ role, content });
    }

    function displayMessage(content, role = 'assistant', type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = role === 'user' ? 'user-message' : 'ai-message';
        if (type === 'eavesdrop') {
            messageDiv.style.fontStyle = 'italic';
            messageDiv.style.backgroundColor = '#2a2a3a'; 
        }
        messageDiv.innerHTML = content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        chatWindow.insertBefore(messageDiv, typingIndicator);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    function handleUserInput() {
        const query = userInput.value.trim();
        if (!query) return;
        displayMessage(query, 'user');
        addMessageToHistory('user', query);
        userInput.value = '';
        fetchChatResponse();
    }

    function handleInteractionAsChat(text) {
        displayMessage(text, 'user');
        addMessageToHistory('user', text);
        fetchChatResponse();
    }


    sendBtn.addEventListener('click', handleUserInput);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleUserInput();
    });

    eavesdropBtn.addEventListener('click', fetchEavesdropSnippet);
    billBtn.addEventListener('click', fetchSarcasticBill);
    pattuBtn.addEventListener('click', fetchPattSummary); 

    fan.addEventListener('click', () => {
        // --- NEW EFFECT LOGIC ---
        // Add the class to trigger the CSS animations
        document.body.classList.add('fan-wobble-effect');

        // Set a timer to remove the class after the animation is done
        // This duration should match the animation duration in the CSS (0.8s = 800ms)
        setTimeout(() => {
            document.body.classList.remove('fan-wobble-effect');
        }, 800);
        
        // --- This is your existing logic, it stays the same ---
        if (audioStarted) {
            fanAudio.currentTime = 0;
            fanAudio.play();
        }
        handleInteractionAsChat("(You touched the wobbly fan)");
    });
    radioBtn.addEventListener('click', () => {
        
        if (audioStarted) { 
            radioPlayerAudio.currentTime = 0;
            radioPlayerAudio.play();
        }
       
        handleInteractionAsChat("(You fiddled with the mystical radio)");
    });
    menuBtn.addEventListener('click', () => {
        menuModal.style.display = 'flex';
    });
    
    menuImage.addEventListener('click', (e) => {
       
        const snackName = prompt("Chettan is busy. Type what you want to order (e.g., 'Pazham Pori', 'Vada'):");
        if (snackName && snackName.trim() !== '') {
            handleInteractionAsChat(`I would like to order one ${snackName.trim()}, please.`);
            menuModal.style.display = 'none';
        }
    });
    
    closeMenuBtn.addEventListener('click', () => menuModal.style.display = 'none');
    closePattuBtn.addEventListener('click', () => pattuModal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target == menuModal) menuModal.style.display = 'none';
        if (e.target == pattuModal) pattuModal.style.display = 'none';
    });

   
    function startConversation() {
        const welcomeMessage = "Ah, a new face. Welcome to my humble chaya kada. Entha vishesham?";
        displayMessage(welcomeMessage, 'assistant');
        addMessageToHistory('assistant', welcomeMessage); 
    }

    startConversation();
});