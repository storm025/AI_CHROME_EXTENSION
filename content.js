function insertAskAIButton() {
    const existingButton = document.querySelector(".coding_ask_doubt_button__FjwXJ");
    if (!existingButton || document.querySelector(".ask_ai_button")) {
        return;
    }

    const askAIButton = document.createElement("button");
    askAIButton.innerText = "ASK A.I.";
    askAIButton.className = "ask_ai_button";

    askAIButton.onclick = function () {
        toggleChatbox();
    };

    existingButton.parentNode.insertBefore(askAIButton, existingButton);
}

const observer = new MutationObserver(() => {
    insertAskAIButton();
});

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
                <button class="chatbox_clear">🗑 Clear</button>
                <button class="chatbox_close">&times;</button>
            </div>
        </div>
        <div class="chatbox_body"></div>
        <div class="chatbox_footer">
            <input type="text" class="chatbox_input" placeholder="Type your message...">
            <button class="chatbox_send">Send</button>
        </div>`;

    document.body.appendChild(chatbox);

    loadChatHistory(); // Load chat history from local storage

    // Add click outside listener
    document.addEventListener('mousedown', handleClickOutside);

    makeDraggable(chatbox);
    makeResizable(chatbox);

    chatbox.querySelector(".chatbox_close").addEventListener("click", () => {
        chatbox.remove();
        document.removeEventListener('mousedown', handleClickOutside);
    });

    chatbox.querySelector(".chatbox_send").addEventListener("click", () => {
        sendMessage();
    });

    chatbox.querySelector(".chatbox_input").addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    });

    chatbox.querySelector(".chatbox_clear").addEventListener("click", clearChat);
}

function handleClickOutside(event) {
    const chatbox = document.querySelector(".ask_ai_chatbox");
    if (!chatbox) return;

    // Check if the click is outside the chatbox
    if (!chatbox.contains(event.target) &&
        !event.target.classList.contains('ask_ai_button')) {
        chatbox.remove();
        document.removeEventListener('mousedown', handleClickOutside);
    }
}

async function sendMessage() {
    const inputBox = document.querySelector(".chatbox_input");
    const message = inputBox.value.trim();

    if (message === "") return;

    const chatBody = document.querySelector(".chatbox_body");

    // Add User Message to Chat
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

    // Fetch AI Response
    try {
        const aiResponse = await fetchAIResponse(message);

        loadingMessage.remove();

        const aiMessage = document.createElement("div");
        aiMessage.className = "chatbox_message ai_message";
        aiMessage.innerText = aiResponse;
        chatBody.appendChild(aiMessage);

        chatBody.scrollTop = chatBody.scrollHeight;

        saveChatHistory(); // Save chat history to local storage

    } catch (error) {
        loadingMessage.innerText = "Error fetching response!";
    }
}

// Response from the A.I
async function fetchAIResponse(userMessage) {
    const apiKey = "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"; 

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: userMessage }],
        }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "No response from AI.";
}

// Unique problem id of a problem
function getProblemId() {
    const urlParts = window.location.pathname.split("/");
    const problemSlug = urlParts[urlParts.length - 1];
    const problemId = problemSlug.split("-").pop();

    return isNaN(problemId) ? null : problemId;
}

// Save chat history to local storage
function saveChatHistory() {
    const problemId = getProblemId();
    if (!problemId) return;

    const chatMessages = [...document.querySelectorAll(".chatbox_message")].map(msg => ({
        text: msg.innerText,
        sender: msg.classList.contains("user_message") ? "user" : "ai"
    }));

    chrome.storage.local.set({ [problemId]: chatMessages });
}

// Load chat history
function loadChatHistory() {
    const problemId = getProblemId();
    if (!problemId) return;

    chrome.storage.local.get([problemId], (result) => {
        const chatHistory = result[problemId] || [];
        const chatBody = document.querySelector(".chatbox_body");

        chatHistory.forEach(({ text, sender }) => {
            const messageDiv = document.createElement("div");
            messageDiv.className = `chatbox_message ${sender}_message`;
            messageDiv.innerText = text;
            chatBody.appendChild(messageDiv);
        });

        chatBody.scrollTop = chatBody.scrollHeight;
    });
}

// Clears chat history
function clearChat() {
    if (!confirm("Are you sure you want to delete all chats? This action cannot be undone.")) return;

    document.querySelector(".chatbox_body").innerHTML = "";

    const problemId = getProblemId();
    if (problemId) {
        chrome.storage.local.remove(problemId);
    }
}

// Make the chatbox draggable
function makeDraggable(element) {
    const header = element.querySelector(".chatbox_header");
    let offsetX = 0, offsetY = 0, isDragging = false;
    let initialRect = null;

    header.style.cursor = "move";

    header.addEventListener("mousedown", (e) => {
        if (e.target.closest(".chatbox_close")) return;
        isDragging = true;
        initialRect = element.getBoundingClientRect();
        offsetX = e.clientX - initialRect.left;
        offsetY = e.clientY - initialRect.top;
        header.style.userSelect = "none";
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;

        let newX = e.clientX - offsetX;
        let newY = e.clientY - offsetY;

        const maxWidth = window.innerWidth - element.offsetWidth;
        const maxHeight = window.innerHeight - element.offsetHeight;

        newX = Math.max(0, Math.min(newX, maxWidth));
        newY = Math.max(0, Math.min(newY, maxHeight));

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

// Make the chatbox resizable
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
            newWidth = initialRect.width - deltaX;
            if (newWidth >= minWidth) {
                newX = initialRect.left + deltaX;
            }
        } else if (handleClasses.contains('right') || handleClasses.contains('top-right') || handleClasses.contains('bottom-right')) {
            newWidth = initialRect.width + deltaX;
        }

        // Handle vertical resizing
        if (handleClasses.contains('top') || handleClasses.contains('top-left') || handleClasses.contains('top-right')) {
            newHeight = initialRect.height - deltaY;
            if (newHeight >= minHeight) {
                newY = initialRect.top + deltaY;
            }
        } else if (handleClasses.contains('bottom') || handleClasses.contains('bottom-left') || handleClasses.contains('bottom-right')) {
            newHeight = initialRect.height + deltaY;
        }

        // Apply size constraints
        if (newWidth >= minWidth) {
            element.style.width = `${newWidth}px`;
            element.style.left = `${newX}px`;
        }
        if (newHeight >= minHeight) {
            element.style.height = `${newHeight}px`;
            element.style.top = `${newY}px`;
        }

        // Reset right and bottom properties
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

observer.observe(document.body, { childList: true, subtree: true });
window.addEventListener("load", insertAskAIButton);
