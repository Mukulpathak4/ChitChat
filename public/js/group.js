 document.addEventListener('DOMContentLoaded', function () {
        var createGroupButton = document.getElementById('addGroup');
        var createGroupPopup = document.getElementById('createGroupPopup');
        var closeButton = document.getElementById('close');

        createGroupButton.addEventListener('click', function () {
            createGroupPopup.style.display = 'block';
        });

        closeButton.addEventListener('click', function () {
            createGroupPopup.style.display = 'none';
        });
    });

const submitbtn = document.getElementById('submitGroup');

submitbtn.addEventListener('click', createGroup);

async function createGroup(e) {
    try {
        e.preventDefault();

        const groupName = document.getElementById('groupName').value;

        const groupObj = {
            groupName,
        };

        const token = localStorage.getItem('token');

        const res = await axios.post('http://localhost:3000/group/create', groupObj, {
            headers: { "Authorization": token },
        });

        localStorage.setItem('groupDetails', JSON.stringify(res.data.newGroup));
        localStorage.setItem('isAdmin', JSON.stringify(true));

        alert(res.data.message);

        if (res.status === 202) {
            document.getElementById('groupName').value = '';
        }
    } catch (err) {
        console.log(err);
        document.getElementById('showResponse').textContent = err.response.data.error;
        document.getElementById('showResponse').style.color = 'red';
    }
}
