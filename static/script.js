// script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    // The base URL of your Flask backend.
    // If you are running both on the same machine, this is correct.
    const API_BASE_URL = 'http://127.0.0.1:5001';

    // --- DOM Elements ---
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
    
    // --- State Management ---
    // This is the single source of truth for the conversation.
    // It will be sent to the backend with every request.
    let conversationHistory = [];

    // --- ======================== ---
    // --- API Communication Layer ---
    // --- ======================== ---

    // Fetches a standard chat response
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

    // Fetches an eavesdrop snippet
    async function fetchEavesdropSnippet() {
        typingIndicator.style.display = 'flex';
        try {
            const response = await await fetch(`${API_BASE_URL}/eavesdrop`, { method: 'POST' });
            if (!response.ok) throw new Error('Network response was not ok.');
            const data = await response.json();
            // Eavesdropping doesn't add to main history, it's a peek into the world
            displayMessage(data.data, 'assistant', 'eavesdrop');
        } catch (error) {
            console.error("Eavesdrop API Error:", error);
            displayMessage("You try to listen in, but only hear the sizzle of a Vada being fried...", 'assistant');
        } finally {
            typingIndicator.style.display = 'none';
        }
    }
    
    // Fetches the sarcastic bill
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
             // The bill is a one-off response, so we display it.
            displayMessage(data.bill, 'assistant');
        } catch (error) {
            console.error("Bill API Error:", error);
            displayMessage("Ah, the bill... my dimensional ink has run dry. You are lucky this time.", 'assistant');
        } finally {
            typingIndicator.style.display = 'none';
        }
    }

    // --- ======================== ---
    // --- UI & State Functions ---
    // --- ======================== ---

    /**
     * Adds a message to the local conversation history state.
     * @param {string} role - 'user' or 'assistant'.
     * @param {string} content - The text of the message.
     */
    function addMessageToHistory(role, content) {
        conversationHistory.push({ role, content });
    }

    /**
     * Displays a message in the chat window.
     * @param {string} content - The text to display.
     * @param {string} role - 'user' or 'assistant'.
     * @param {string} type - Optional type for special styling, e.g., 'eavesdrop'.
     */
    function displayMessage(content, role = 'assistant', type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = role === 'user' ? 'user-message' : 'ai-message';
        if (type === 'eavesdrop') {
            messageDiv.style.fontStyle = 'italic';
            messageDiv.style.opacity = '0.8';
        }
        // Use innerHTML to correctly render newlines (\n) as <br> tags
        messageDiv.innerHTML = content.replace(/\n/g, '<br>');
        
        chatWindow.insertBefore(messageDiv, typingIndicator);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    /**
     * Handles user text input and initiates the API call.
     */
    function handleUserInput() {
        const query = userInput.value.trim();
        if (!query) return;

        displayMessage(query, 'user');
        addMessageToHistory('user', query);
        userInput.value = '';

        fetchChatResponse(); // Call the main chat API
    }

    /**
     * Handles clicks on interactive elements by treating them as user input.
     * This simplifies the backend to only need one main chat endpoint.
     * @param {string} text - The text representing the user's action.
     */
    function handleInteractionAsChat(text) {
        displayMessage(text, 'user');
        addMessageToHistory('user', text);
        fetchChatResponse();
    }


    // --- ======================== ---
    // --- Event Listeners Setup ---
    // --- ======================== ---

    // Listen for Send button click and Enter key press
    sendBtn.addEventListener('click', handleUserInput);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleUserInput();
    });

    // Feature Button Listeners
    eavesdropBtn.addEventListener('click', fetchEavesdropSnippet);
    billBtn.addEventListener('click', () => {
        addMessageToHistory('user', 'Chetta, can I get the bill?');
        fetchSarcasticBill();
    });
    
    // For elements without a dedicated endpoint, we simulate user input
    fan.addEventListener('click', () => handleInteractionAsChat("(You touched the wobbly fan)"));
    radioBtn.addEventListener('click', () => handleInteractionAsChat("(You fiddled with the mystical radio)"));
    menuBtn.addEventListener('click', () => {
        menuModal.style.display = 'flex';
        // Add a message to let the AI know the user is looking at the menu
        addMessageToHistory('user', '(You are looking at the Kadi Menu)');
    });
    
    menuImage.addEventListener('click', () => {
        const snackName = prompt("Chettan is busy. Type what you want to order (e.g., 'Pazham Pori', 'Zrakk Bites'):");
        if (snackName) {
            handleInteractionAsChat(`I'd like to order one ${snackName}, please.`);
            menuModal.style.display = 'none';
        }
    });

    // The "Pattu Book" is now just part of the conversation, managed by the AI.
    // Clicking it can ask the AI what's on the tab.
    pattuBtn.addEventListener('click', () => {
        handleInteractionAsChat("Chetta, what's on my patt so far?");
    });
    
    // Modal closing logic
    closeMenuBtn.addEventListener('click', () => menuModal.style.display = 'none');
    closePattuBtn.addEventListener('click', () => pattuModal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target == menuModal) menuModal.style.display = 'none';
        if (e.target == pattuModal) pattuModal.style.display = 'none';
    });

    // --- Initial Welcome Message ---
    function startConversation() {
        const welcomeMessage = "Ah, a new face. Welcome to my humble chaya kada. Entha vishesham?";
        displayMessage(welcomeMessage, 'assistant');
        addMessageToHistory('assistant', welcomeMessage);
    }

    startConversation();
});