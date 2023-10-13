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
