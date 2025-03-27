function insertAskAIButton() {
    const existingButton = document.querySelector(".coding_ask_doubt_button__FjwXJ");
    if (!existingButton || document.querySelector(".ask_ai_button")) {
        return;
    }

    const askAIButton = document.createElement("button");
    askAIButton.innerText = "ASK A.I.";
    askAIButton.className = "ask_ai_button";

    // Set initial theme and observe theme changes
    updateAskAIButtonTheme(askAIButton);

    const themeToggleButton = document.querySelector(".ant-switch");
    if (themeToggleButton) {
        new MutationObserver(() => updateAskAIButtonTheme(askAIButton))
            .observe(themeToggleButton, { attributes: true, attributeFilter: ["class"] });
    }

    askAIButton.onclick = function () {
        chrome.storage.local.get("userApiKey", (data) => {
            data.userApiKey ? toggleChatbox() : showApiKeyModal();
        });
    };

    existingButton.parentNode.insertBefore(askAIButton, existingButton);
}

const observer = new MutationObserver(insertAskAIButton);

function showApiKeyModal() {
    let modal = document.getElementById("apiKeyModal");

    if (modal) {
        modal.style.display = "flex";
        return;
    }

    // Create Modal
    modal = document.createElement("div");
    modal.id = "apiKeyModal";
    modal.className = "modal";
    modal.innerHTML = `
        <div class="modal-content">
            <span class="modal-close">&times;</span>
            <h2>Enter Your API Key</h2>
            <input type="text" id="apiKeyInput" placeholder="Eg:sk-..." />
            <button id="saveApiKeyBtn">Save</button>
        </div>
    `;

    document.body.appendChild(modal);

    // Event listeners
    document.querySelector(".modal-close").addEventListener("click", closeApiKeyModal);
    document.getElementById("saveApiKeyBtn").addEventListener("click", saveApiKey);
    modal.addEventListener("click", e => {
        if (e.target === modal) closeApiKeyModal();
    });

    modal.style.display = "flex";
}

function closeApiKeyModal() {
    document.getElementById("apiKeyModal").style.display = "none";
}

function saveApiKey() {
    const apiKey = document.getElementById("apiKeyInput").value.trim();
    if (!apiKey) {
        alert("Please enter a valid API Key.");
        return;
    }

    chrome.storage.local.set({ userApiKey: apiKey }, () => {
        alert("API Key Saved!");
        closeApiKeyModal();
    });
}

function getApiKey() {
    return new Promise(resolve => {
        chrome.storage.local.get(["userApiKey"], result => resolve(result.userApiKey || null));
    });
}

function getThemeFromToggleButton() {
    const themeToggleButton = document.querySelector(".ant-switch");
    return themeToggleButton?.classList.contains("ant-switch-checked") ? "dark" : "light";
}

function updateAskAIButtonTheme(askAIButton) {
    if (!askAIButton) return;

    const theme = getThemeFromToggleButton();

    askAIButton.style.backgroundColor = theme === "dark" ? "#2b384e" : "#fff";
    askAIButton.style.color = theme === "dark" ? "white" : "#000";
    askAIButton.style.border = theme === "dark" ? "1px solid #555" : "1px solid #ccc";
}

function toggleChatbox() {
    let chatbox = document.querySelector(".ask_ai_chatbox");

    if (chatbox) {
        chatbox.remove();
        return;
    }

    chatbox = document.createElement("div");
    chatbox.className = "ask_ai_chatbox";

    // Set initial position and size
    chatbox.style.width = '300px';
    chatbox.style.height = '400px';
    chatbox.style.right = '20px';
    chatbox.style.bottom = '20px';

    chatbox.innerHTML =
        `<div class="resize-handle top-left"></div>
        <div class="resize-handle top"></div>
        <div class="resize-handle top-right"></div>
        <div class="resize-handle right"></div>
        <div class="resize-handle bottom-right"></div>
        <div class="resize-handle bottom"></div>
        <div class="resize-handle bottom-left"></div>
        <div class="resize-handle left"></div>
        <div class="chatbox_header">
            <span>AI Chat</span>
            <div class="button-container">
                <button class="chatbox_download">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 3V16M12 16L8 12M12 16L16 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M5 19H19" stroke="white" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
                <button class="chatbox_clear">🗑 Clear</button>
                <button class="chatbox_close">&times;</button>
            </div>
        </div>
        <div class="chatbox_body"></div>
        <div class="chatbox_footer">
          <button class="voice_input">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 16C14.2091 16 16 14.2091 16 12V6C16 3.79086 14.2091 2 12 2C9.79086 2 8 3.79086 8 6V12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M4 12V10C4 9.44772 4.44772 9 5 9C5.55228 9 6 9.44772 6 10V12C6 15.3137 8.68629 18 12 18C15.3137 18 18 15.3137 18 12V10C18 9.44772 18.4477 9 19 9C19.5523 9 20 9.44772 20 10V12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 22V20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>



        <input type="text" class="chatbox_input" placeholder="Type your message...">

            <button class="chatbox_send">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" stroke="white" stroke-width="2"/>
                </svg>
            </button>
        </div>`;


    document.body.appendChild(chatbox);

    loadChatHistory(); // Load chat history from local storage
    makeDraggable(chatbox);
    makeResizable(chatbox);


    // Event listeners
    document.querySelector(".voice_input").addEventListener("click", function() {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = "en-US"; 
        recognition.start();
    
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript.trim().toLowerCase(); 
            document.querySelector(".chatbox_input").value = transcript;

            if (transcript === "stop" || transcript === "exit") {
                stopSpeech();
                document.querySelector(".chatbox_input").value = "";
            }
        };
    
        recognition.onerror = function(event) {
            console.error("Speech recognition error:", event.error);
        };
    });

    chatbox.querySelector(".chatbox_download").addEventListener("click", downloadChat);
    document.addEventListener('mousedown', handleClickOutside);

    chatbox.querySelector(".chatbox_close").addEventListener("click", () => {
        chatbox.remove();
        document.removeEventListener('mousedown', handleClickOutside);
    });

    document.querySelector(".chatbox_send").addEventListener("click", sendMessage);

    chatbox.querySelector(".chatbox_input").addEventListener("keypress", e => {
        if (e.key === "Enter") sendMessage();
    });
    chatbox.querySelector(".chatbox_clear").addEventListener("click", clearChat);
}

// Function to stop AI speech
function stopSpeech() {
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
        console.log("Speech stopped");
    }
}

// text to speech conversion
function speakText(text) {
    if (speechSynthesis.speaking) {
        stopSpeech();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1; 
    speechSynthesis.speak(utterance);
}


function handleClickOutside(event) {
    const chatbox = document.querySelector(".ask_ai_chatbox");
    if (!chatbox) return;

    if (!chatbox.contains(event.target) && !event.target.classList.contains('ask_ai_button')) {
        chatbox.remove();
        document.removeEventListener('mousedown', handleClickOutside);
    }
}

async function sendMessage() {
    const inputBox = document.querySelector(".chatbox_input");
    const message = inputBox.value.trim();

    if (message === "stop" || message === "exit") {
        stopSpeech();
        inputBox.value = "";
        return;
    }

    if (message === "") return;

    const chatBody = document.querySelector(".chatbox_body");
    const problemId = getProblemId();
    if (!problemId) {
        console.error("No problem ID found");
        return;
    }

    // Create user message
    const userMessage = document.createElement("div");
    userMessage.className = "chatbox_message user_message";
    userMessage.innerText = message;
    chatBody.appendChild(userMessage);


    inputBox.value = "";
    chatBody.scrollTop = chatBody.scrollHeight;

    // Show loading message
    const loadingMessage = document.createElement("div");
    loadingMessage.className = "chatbox_message ai_message";
    loadingMessage.innerText = "Thinking...";
    chatBody.appendChild(loadingMessage);
    chatBody.scrollTop = chatBody.scrollHeight;

    try {
        // Fetch problem data and user code
        const problemData = JSON.stringify(await getProblemData());
        const userCode = window.userCodeForAI || "No code found.";
        let chatHistory = await getChatHistory(problemId);

        // console.log("Problem Data:", problemData);
        // console.log("User Code:", userCode);

        // Create chat manager instance
        const chatManager = new InteractiveChatManager(await getApiKey());

        // Fetch AI response
        const aiResponse = await chatManager.fetchAIResponse(message, problemData, userCode, chatHistory);

        // Update loading message with AI response
        loadingMessage.innerHTML = `
        <p>${aiResponse}</p>
        <button class="ai_speaker">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9V15H7L12 20V4L7 9H3Z" stroke="white" stroke-width="2"/>
                <path d="M16.5 7.5C17.91 8.91 18.75 10.86 18.75 13C18.75 15.14 17.91 17.09 16.5 18.5" stroke="white" stroke-width="2"/>
                <path d="M19.5 4.5C21.83 6.83 23.25 9.79 23.25 13C23.25 16.21 21.83 19.17 19.5 21.5" stroke="white" stroke-width="2"/>
            </svg>
        </button>
    `;;
    
    loadingMessage.querySelector(".ai_speaker").addEventListener("click", function() {
        speakText(aiResponse);
    });

        // Save chat history
        saveChatHistory(problemId);
    } catch (error) {
        console.error("Send Message Error:", error);
        loadingMessage.innerText = `Error: ${error.message || "Failed to fetch response"}`;
    }
}

class InteractiveChatManager {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    // Sanitize input to prevent prompt injections
    sanitizeInput(input) {
        return input
            .replace(/<script>.*?<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/[^\w\s.,?!-]/gi, '')
            .slice(0, 1000);
    }

    // Generate context-specific system prompt
    generateSystemPrompt(problemData, userCode, chatHistory) {
        return `You are an AI assistant helping a user solve a coding problem.
        Guidelines:
        1. Only answer queries related to the following problem.
        2. Use previous messages to improve the response.
        3. If the user asks for an editorial solution, suggest hints first. Provide the solution only if explicitly requested.
        4. Stay focused on the problem and avoid unrelated discussions.
        5. Act as nice mentor which helps the user to solve the problem.
        6. Don't provide solutions , hints, editorial code directly, Provide this things only if explicitly requested.

        **Problem Description:**
        ${problemData}
        
        **User's Current Code:**
        \n\n${userCode}\n\n
        **Chat History for Context:**
        ${chatHistory}
        `;
    }

    // Enhanced AI response fetching
    async fetchAIResponse(userMessage, problemData, userCode, chatHistory) {
        const apiKey = await getApiKey();
        if (!apiKey) throw new Error("API Key not found");

        const sanitizedMessage = this.sanitizeInput(userMessage);

        const messages = [
            {
                "role": "system",
                "content": this.generateSystemPrompt(problemData, userCode, chatHistory)
            },
            {
                "role": "user",
                "content": sanitizedMessage
            }
        ];

        try {
            console.log("messages: ", messages);
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: messages,
                    temperature: 0.7,
                    frequency_penalty: 0.5,
                    presence_penalty: 0.5
                })
            });

            const data = await response.json();

            if (data.choices && data.choices.length > 0) {
                return data.choices[0].message.content;
            } else {
                console.error("No response from AI", data);
                return "Sorry, I couldn't generate a response. Please try again.";
            }
        } catch (error) {
            console.error("AI Response Error:", error);
            return `Error: ${error.message}`;
        }
    }
}

//chatHistory for A.I
async function getChatHistory(problemId) {
    return new Promise((resolve) => {
        chrome.storage.local.get([`chat_${problemId}`], (result) => {
            const chatHistory = result[`chat_${problemId}`] || [];
            resolve(chatHistory.map(({ text, sender }) => `${sender}: ${text}`).join("\n"));
        });
    });
}

async function getProblemData() {
    return new Promise((resolve) => {
        // Try multiple storage keys
        chrome.storage.local.get(["problemData", "Body", "problem"], (data) => {
            const problemDescription = data.problemData || data.Body || data.problem || "No problem description found.";
            // console.log("Problem Data Retrieved:", problemDescription);
            resolve(problemDescription);
        });
    });
}


function getProblemId() {
    const urlParts = window.location.pathname.split("/");
    const problemSlug = urlParts[urlParts.length - 1];
    const problemId = problemSlug.split("-").pop();

    return isNaN(problemId) ? null : problemId;
}

function saveChatHistory(problemId) {
    const chatMessages = [...document.querySelectorAll(".chatbox_message")].map(msg => ({
        text: msg.innerText,
        sender: msg.classList.contains("user_message") ? "user" : "ai"
    }));

    // Save chat history using the problem ID
    chrome.storage.local.set({ [`chat_${problemId}`]: chatMessages }, () => {
        console.log("Chat history saved for problem:", problemId);
    });
}

function loadChatHistory() {
    const problemId = getProblemId();
    if (!problemId) {
        console.log("No problem ID found, cannot load chat history");
        return;
    }

    // Use the chat history key with problem ID prefix
    chrome.storage.local.get([`chat_${problemId}`], (result) => {
        const chatHistory = result[`chat_${problemId}`] || [];
        // console.log("Retrieved Chat History:", chatHistory);

        const chatBody = document.querySelector(".chatbox_body");
        if (!chatBody) {
            console.log("Chat body not found");
            return;
        }

        // Clear existing messages before loading history
        chatBody.innerHTML = '';

        chatHistory.forEach(({ text, sender }) => {
            const messageDiv = document.createElement("div");
            messageDiv.className = `chatbox_message ${sender}_message`;
            messageDiv.innerText = text;
            chatBody.appendChild(messageDiv);
        });

        chatBody.scrollTop = chatBody.scrollHeight;
    });
}

function clearChat() {
    if (!confirm("Are you sure you want to delete all chats? This action cannot be undone.")) return;

    document.querySelector(".chatbox_body").innerHTML = "";

    const problemId = getProblemId();
    if (problemId) {
        chrome.storage.local.remove(problemId);
    }
}



// Download the Chat in localMachine
function downloadChat() {
    const chatMessages = [...document.querySelectorAll(".chatbox_message")];

    if (chatMessages.length === 0) {
        alert("No chat history to download.");
        return;
    }

    let chatText = "Chat History:\n\n";
    chatMessages.forEach(msg => {
        const sender = msg.classList.contains("user_message") ? "User" : "AI";
        chatText += `${sender}: ${msg.innerText}\n`;
    });

    const blob = new Blob([chatText], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "AI_Chat_History.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}


function makeDraggable(element) {
    const header = element.querySelector(".chatbox_header");
    let offsetX = 0, offsetY = 0, isDragging = false;

    header.style.cursor = "move";

    header.addEventListener("mousedown", (e) => {
        if (e.target.closest(".chatbox_close")) return;
        isDragging = true;
        const rect = element.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        header.style.userSelect = "none";
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;

        const newX = Math.max(0, Math.min(e.clientX - offsetX, window.innerWidth - element.offsetWidth));
        const newY = Math.max(0, Math.min(e.clientY - offsetY, window.innerHeight - element.offsetHeight));

        element.style.left = `${newX}px`;
        element.style.top = `${newY}px`;
        element.style.right = 'auto';
        element.style.bottom = 'auto';
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
        header.style.userSelect = "auto";
    });
}

function makeResizable(element) {
    const minWidth = 250;
    const minHeight = 300;
    let isResizing = false;
    let currentHandle = null;
    let initialRect = null;
    let initialMousePos = null;

    const handles = element.querySelectorAll('.resize-handle');

    handles.forEach(handle => {
        handle.addEventListener('mousedown', (e) => {
            isResizing = true;
            currentHandle = handle;
            initialRect = element.getBoundingClientRect();
            initialMousePos = { x: e.clientX, y: e.clientY };
            e.preventDefault();
        });
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing || !initialRect || !initialMousePos) return;

        const deltaX = e.clientX - initialMousePos.x;
        const deltaY = e.clientY - initialMousePos.y;
        const handleClasses = currentHandle.classList;

        let newWidth = initialRect.width;
        let newHeight = initialRect.height;
        let newX = initialRect.left;
        let newY = initialRect.top;

        // Handle horizontal resizing
        if (handleClasses.contains('left') || handleClasses.contains('top-left') || handleClasses.contains('bottom-left')) {
            newWidth = Math.max(minWidth, initialRect.width - deltaX);
            if (newWidth >= minWidth) {
                newX = initialRect.left + deltaX;
            }
        } else if (handleClasses.contains('right') || handleClasses.contains('top-right') || handleClasses.contains('bottom-right')) {
            newWidth = Math.max(minWidth, initialRect.width + deltaX);
        }

        // Handle vertical resizing
        if (handleClasses.contains('top') || handleClasses.contains('top-left') || handleClasses.contains('top-right')) {
            newHeight = Math.max(minHeight, initialRect.height - deltaY);
            if (newHeight >= minHeight) {
                newY = initialRect.top + deltaY;
            }
        } else if (handleClasses.contains('bottom') || handleClasses.contains('bottom-left') || handleClasses.contains('bottom-right')) {
            newHeight = Math.max(minHeight, initialRect.height + deltaY);
        }

        // Apply changes
        element.style.width = `${newWidth}px`;
        element.style.height = `${newHeight}px`;
        element.style.left = `${newX}px`;
        element.style.top = `${newY}px`;
        element.style.right = 'auto';
        element.style.bottom = 'auto';
    });

    document.addEventListener('mouseup', () => {
        isResizing = false;
        currentHandle = null;
        initialRect = null;
        initialMousePos = null;
    });
}

function injectScript() {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('inject.js');
    script.onload = function () {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(script);
}

// Main initialization
injectScript();
insertAskAIButton();

window.addEventListener('INJECT_SCRIPT_LOADED', function () {
    window.dispatchEvent(new CustomEvent('GET_USER_CODE'));
});

window.addEventListener("PROBLEM_DATA_FOUND", function (event) {
    chrome.storage.local.set({ problemData: event.detail });
});

window.addEventListener("USER_CODE_UPDATED", function (event) {
    const updatedCode = event.detail.code;
    if (updatedCode) {
        window.userCodeForAI = updatedCode;
    }
});

let lastUrl = location.href;
const problemContentObserver = new MutationObserver(() => {
    const mainContent = document.querySelector(".coding_ask_doubt_button__FjwXJ");
    if (mainContent) {
        insertAskAIButton();
    }
});

new MutationObserver(() => {
    if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(() => {
            insertAskAIButton();
            const chatbox = document.querySelector(".ask_ai_chatbox");
            if (chatbox) {
                toggleChatbox();
            }
            problemContentObserver.observe(document.body, { subtree: true, childList: true });
        }, 1000);
    }
}).observe(document, { subtree: true, childList: true });

problemContentObserver.observe(document.body, { subtree: true, childList: true });