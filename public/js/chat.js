const sendBtn = document.getElementById('send-button');
const message = document.getElementById('message-input');
sendBtn.addEventListener('click', sendMsg);

async function sendMsg() {
    try {
        const textMessage = message.value;
        const token = localStorage.getItem('token');

        const response = await axios.post('http://localhost:3000/chats/send', { message: textMessage }, {
            headers: { "Authorization": token },
        });

        // Clear the message input field
        if (response.status === 201) {
            message.value = '';
        }
    } catch (err) {
        console.log(err);
    }
}
window.addEventListener('DOMContentLoaded', async () => {
    getUserMsgs();
})

async function getUserMsgs() {
    try {
            // Get messages from the server using a GET request
            const response = await axios.get(`http://localhost:3000/chats/messages`);
            let Chats = response.data.textMessages;
            showUsersChatsOnScreen(Chats);
        
    } catch (err) {
        console.log(err);
        alert(err.response.data.err);
    }
};

function showUsersChatsOnScreen(chats) {
    const token = localStorage.getItem('token');
    const decodeToken = parseJwt(token);

    const ul = document.getElementById('main-content');
    ul.style.textAlign = 'center';

    const li = document.createElement('li');
    li.className = 'sent';
    const p = document.createElement('p');
    li.append(p);

    if (isValidURL(chats.message)) {
        p.innerHTML = `${chats.sender} : <img src="${chats.message}" alt="${chats.sender}">`;
    } else {
        p.textContent = `${chats.sender} : ${chats.message}`;
    }

    if (chats.userId === decodeToken.userId) {
        if (isValidURL(chats.message)) {
            p.innerHTML = `you : <img src="${chats.message}" alt="${chats.sender}">`;
        } else {
            p.textContent = `you : ${chats.message}`;
        }
    }

    ul.append(li);
}