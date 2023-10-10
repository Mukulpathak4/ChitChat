const btn = document.getElementById('submit');

btn.addEventListener('click', postSignUp);
const isStringInvalid = (string) => {
    return string == undefined || string.length === 0;
}
async function postSignUp(e){
    try{
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

        if (isStringInvalid(name) || isStringInvalid(email) || isStringInvalid(phone) || isStringInvalid(password)){
            alert("Bad parameters. Something is missing");
          }
          else{
            const response = await axios.post('http://localhost:3000/signup', signupDetails);
          }
    }
    catch(err){
        alert(err.response.data.error);
    }
}