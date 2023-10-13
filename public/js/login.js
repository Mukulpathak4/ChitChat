const btn = document.getElementById('submit');

btn.addEventListener('click', loginUser);

async function loginUser(e) {
    try {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const loginDetails = {
            email,
            password
        };

        const response = await axios.post('http://localhost:3000/login', loginDetails);

        alert(response.data.message);

        localStorage.setItem('token', response.data.token);

        window.location.href = '../html/chat.html';
    } catch (err) {
        console.log(err);
    }
}
