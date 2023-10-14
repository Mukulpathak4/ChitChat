const sendBtn = document.getElementById('send-button');
const message = document.getElementById('message-input');
sendBtn.addEventListener('click', sendMsg);
const chatsCanStored = 1000;


async function sendMsg() {
     try {
        const textMessage = message.value;

        const messageObj = {
            textMessage,
        };

        const token = localStorage.getItem('token');

        const response = await axios.post('http://localhost:3000/chats/send', messageObj, {
            headers: { "Authorization": token },
        });
        console.log(messageObj);
        showUsersChatsOnScreen(response.data.textMessage);

        let usersChats = JSON.parse(localStorage.getItem('usersChats')) || [];
        usersChats.push(response.data.textMessage);
        let chats = usersChats.slice(usersChats.length - chatsCanStored);
        localStorage.setItem('usersChats', JSON.stringify(chats));

        // Clear the message input field
        if (response.status === 201) {
            message.value = '';
            sendMedia.value = '';
        }
    } catch (err) {
        console.log(err);
    }
}

window.addEventListener('DOMContentLoaded', async () => {
    getUserMsgs();
    setInterval(getUserMsgs, 1000);
});

async function getUserMsgs() {
  try {
        const showPrevMsgs = document.getElementById('showPreviousMsg');
        showPrevMsgs.style.textAlign = 'center';
        const button = document.createElement('button');
        showPrevMsgs.append(button);
        button.innerHTML = `Show Previous messages`;
        button.className = 'button-18';
        button.onclick = async () => {

            const response = await axios.get(`http://localhost:3000/chats/Messages`);
            let lastestChats = response.data.textMessages;

            if (response.status === 202) {
                localStorage.setItem('usersChats', JSON.stringify(lastestChats));
                window.location.reload();
                showPrevMsgs.remove();
            }
            if (response.status === 201) {
                alert(response.data.message);
                showPrevMsgs.remove();
            }
        };
    } catch (err) {
        console.log(err);
        alert(err.response.data.err);
    }
}

function showUsersChatsOnScreen(chats) {
    const token = localStorage.getItem('token');
    const decodeToken = {}; // Define or get the decoded token

    const ul = document.getElementById('main-content');
    ul.style.textAlign = 'center';

    const li = document.createElement('li');
    li.className = 'sent';
    const p = document.createElement('p');
    li.append(p);

    if (chats.userId === decodeToken.userId) {
        if (isValidURL(chats.message)) {
            p.innerHTML = `you : <img src="${chats.message}" alt="${chats.sender}">`;
        } else {
            p.textContent = `you : ${chats.message}`;
        }
    } else {
        if (isValidURL(chats.message)) {
            p.innerHTML = `${chats.sender} : <img src="${chats.message}" alt="${chats.sender}">`;
        } else {
            p.textContent = `${chats.sender} : ${chats.message}`;
        }
    }

    ul.append(li);
}

function isValidURL(str) {
    const pattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+([/?#].*?)?)?$/;
    return pattern.test(str);
}

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error parsing JWT:', error);
        return null;
    }
}