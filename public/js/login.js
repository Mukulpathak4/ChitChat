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

        document.getElementById('someResponse').textContent = `${response.data.message}`;
        document.getElementById('someResponse').style.color = 'green';
        window.location.href = '../html/chat.html';
    } catch (err) {
        console.log(err);

        document.getElementById('someResponse').innerHTML = `Error: ${err.response.data.error}`;
        document.getElementById('someResponse').style.color = 'red';
    }
}
