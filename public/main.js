const socket = io("http://localhost:3000");
const messageContainer = document.getElementById('message-container');
const clientsTotal = document.getElementById("client-total");
const messages = document.getElementById("message-container");
const nameInput = document.getElementById("name-input");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");

messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    sendMessage();
});

socket.on("clients-total", (data) => {
    clientsTotal.innerText = `Total clients connected: ${data}`;
});

function sendMessage() {
    if (messageInput.value === '') return;

    const data = {
        name: nameInput.value,
        message: messageInput.value,
        dateTime: new Date(),
    };

    socket.emit("message", data);
    addMessageToUI(true, data);
    messageInput.value = ''; // Clear input after sending message
}

socket.on("chat-message", (data) => {
    addMessageToUI(false, data);
});

function addMessageToUI(isOwnMessage, data) {
    clearFeedback();

    const element = `
        <li class="${isOwnMessage ? 'message-right' : 'message-left'}">
            <p class="message">
                ${data.message}
                <span>${data.name} ● ${moment(data.dateTime).fromNow()}</span>
            </p>
        </li>
    `;

    messageContainer.innerHTML += element;
    scrollToBottom();
}

function scrollToBottom() {
    messageContainer.scrollTo(0, messageContainer.scrollHeight);
}

messageInput.addEventListener('input', (e) => {
    if (messageInput.value.trim() !== '') {
        socket.emit('feedback', {
            feedback: `✍️ ${nameInput.value} is typing a message`,
        });
    } else {
        socket.emit('feedback', {
            feedback: '',
        });
    }
});

socket.on('feedback', (data) => {
    clearFeedback();

    if (data.feedback !== '') {
        const element = `
            <li class="message-feedback">
                <p class="feedback" id="feedback">${data.feedback}</p>
            </li>
        `;
        messageContainer.innerHTML += element;
    }
});

function clearFeedback() {
    const feedbackElements = document.querySelectorAll('.message-feedback');
    feedbackElements.forEach(element => {
        element.parentNode.removeChild(element);
    });
}
