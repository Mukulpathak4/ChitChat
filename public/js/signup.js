const btn = document.getElementById('submit');

btn.addEventListener('click', storeSignupDetails);

async function storeSignupDetails(e) {
    try {
        e.preventDefault();

        const name = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const phoneNumber = document.getElementById('phoneNumber').value;
        const password = document.getElementById('password').value;

        let signupDetails = {
            name,
            email,
            phoneNumber,
            password
        };

        const response = await axios.post('http://localhost:3000/signup', signupDetails);

        alert(response.data.message);

        document.getElementById('someResponse').textContent = `${response.data.message}`;
        document.getElementById('someResponse').style.color = 'green';

        window.location.href = '../html/login.html';
    } catch (err) {
        alert(err.response.data.error);

        document.getElementById('someResponse').innerHTML = `Error: ${err.response.data.error}`;
        document.getElementById('someResponse').style.color = 'red';
        console.log(err);
    }
}
