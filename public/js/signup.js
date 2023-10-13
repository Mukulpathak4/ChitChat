const btn = document.getElementById('submit');

btn.addEventListener('click', postSignUp);

async function postSignUp(e){
     try {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;

        let signupDetails = {
            name,
            email,
            phone,
            password
        };

        const response = await axios.post('http://localhost:3000/signup', signupDetails);

        alert(response.data.message);

        window.location.href = '../html/login.html';
    } catch (err) {
        alert(err.response.data.error);
    }
}