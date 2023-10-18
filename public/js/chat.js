// Initialize a WebSocket connection to the server
const socket = io('http://localhost:3000');

// Get references to various HTML elements
const sendMessage = document.getElementById('send-message');
const chatsCanStored = 1000;
// const addGroup = document.getElementById('addGroup');
const searchUsers = document.getElementById('searchContacts');
const message = document.getElementById('message-input');
const showGroups = document.getElementById('showMyGroups');
const addUsers = document.getElementById('addUsers');
const showGroupMembers = document.getElementById('showGroupMembers');

sendMessage.addEventListener('click', () => {
    if (message.value !== '') {
        postMessage();
    } else {
        const msg = `Can't send an empty message`;
        showErrorMsg(msg);
    }
});

async function postMessage() {
    try {
        const textMessage = message.value;
        const groupdata = JSON.parse(localStorage.getItem('groupDetails')) || { id: null };
        const groupId = groupdata.id;
        const messageObj = { textMessage, groupId };
        const token = localStorage.getItem('token');
        const response = await axios.post('http://localhost:3000/chats/send', messageObj, {
            headers: { "Authorization": token },
        });

        showUsersChatsOnScreen(response.data.textMessage);
        socket.emit('send-message', response.data.textMessage);
        console.log('the message obj is ', response.data.textMessage);

        let usersChats = JSON.parse(localStorage.getItem('usersChats')) || [];
        usersChats.push(response.data.textMessage);
        let chats = usersChats.slice(usersChats.length - chatsCanStored);
        localStorage.setItem('usersChats', JSON.stringify(chats));

        if (response.status === 201) {
            message.value = '';
            sendMedia.value = '';
        }
    } catch (err) {
        console.log(err);
    }
}



window.addEventListener('DOMContentLoaded', async () => {
    try {
        const usersChats = JSON.parse(localStorage.getItem('usersChats')) || [];
        const groupDetails = JSON.parse(localStorage.getItem('groupDetails')) || { id: null, name: 'Chat App' };
        const groupId = groupDetails.id;

        socket.emit('joined-group', groupId);

        if (groupDetails.id === null) {
            document.getElementById('message-input').disabled = true;
            document.getElementById('send-message').disabled = true;
            document.getElementById('showPreviousMsg').textContent = 'Please Create a New Group to Start Conversation';
            document.getElementById('send-media').disabled = true;
        }

        if (groupDetails.id != null) {
            getUserMsgs(groupDetails.id);
        }

        usersChats.forEach(chats => {
            if (groupDetails.id === chats.groupId) {
                showUsersChatsOnScreen(chats);
            }
        });

        socket.on('received-message', messages => {
            console.log('socket message obj is', messages);
            showUsersChatsOnScreen(messages);

            usersChats.push(messages);
            let chats = usersChats.slice(usersChats.length - chatsCanStored);
            localStorage.setItem('usersChats', JSON.stringify(chats));
        });

        showGroupName(groupDetails.name);
        showUserName();
    } catch (err) {
        console.log(err);
    }
});


const getUserMsgs = async (groupId) => {
    try {
        const showPrevMsgs = document.getElementById('showPreviousMsg');
        showPrevMsgs.style.textAlign = 'center';
        const button = document.createElement('button');
        showPrevMsgs.append(button);
        button.textContent = `Show Previous messages`;
        button.className = 'button-18';
        button.onclick = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/chats/Messages/${groupId}`);
                const latestChats = response.data.textMessages;

                if (response.status === 202) {
                    localStorage.setItem('usersChats', JSON.stringify(latestChats));
                    window.location.reload();
                    showPrevMsgs.remove();
                } else if (response.status === 201) {
                    alert(response.data.message);
                    showPrevMsgs.remove();
                }
            } catch (error) {
                console.log(error);
                alert(error.response.data.err);
            }
        };
    } catch (error) {
        console.log(error);
    }
};


function showUsersChatsOnScreen(chats) {
    const token = localStorage.getItem('token');
    const decodeToken = parseJwt(token);

    const ul = document.getElementById('userMessage');
    ul.style.textAlign = 'center';

    const li = document.createElement('li');
    li.classList.add('sent');
    const p = document.createElement('p');
    li.appendChild(p);

    const isURL = isValidURL(chats.message);

    if (chats.userId === decodeToken.userId) {
        p.innerHTML = `you : ${isURL ? `<img src="${chats.message}" alt="${chats.sender}">` : chats.message}`;
    } else {
        p.innerHTML = `${chats.sender} : ${isURL ? `<img src="${chats.message}" alt="${chats.sender}">` : chats.message}`;
    }

    ul.appendChild(li);
}

// Function to display user groups on the screen
const showGroupsOnScreen = (groups, userGroup) => {
    const groupLists = document.getElementById('groupLists');

    const li = document.createElement('li');
    li.classList.add('contact');
    li.addEventListener('click', async () => {
        localStorage.setItem('groupDetails', JSON.stringify(groups));
        window.location.reload();
        localStorage.setItem('isAdmin', JSON.stringify(userGroup.isAdmin));
    });

    const div = document.createElement('div');
    div.classList.add('wrap');
    li.appendChild(div);

    const p = document.createElement('p');
    p.textContent = groups.name;
    p.id = groups.id;
    div.appendChild(p);

    groupLists.appendChild(li);
};


// Function to display user contacts on the screen
const showUsersOnScreen = (users) => {
    const token = localStorage.getItem('token');
    const isAdmin = JSON.parse(localStorage.getItem('isAdmin'));
    const decodeToken = parseJwt(token);

    if (users.id !== decodeToken.userId) {
        const userLists = document.getElementById('userLists');

        const li = document.createElement('li');
        li.classList.add('contact');

        const div = document.createElement('div');
        div.classList.add('wrap');
        li.appendChild(div);

        const p = document.createElement('p');
        p.textContent = users.name;

        const groupData = JSON.parse(localStorage.getItem('groupDetails'));
        if (groupData && isAdmin) {
            const button = document.createElement('button');
            button.textContent = 'Add to Your Group';
            button.classList.add('button-33');
            p.appendChild(button);

            const groupId = groupData.id;
            const toUserId = users.id;
            if (groupData.id) {
                button.addEventListener('click', async () => {
                    try {
                        const addUserToGroup = await axios.post(`http://localhost:3000/group/add/${toUserId}/${groupId}`);
                        const groupDetails = JSON.parse(localStorage.getItem('groupDetails'));
                        if (Number(addUserToGroup.data.userGroup.userId) === users.id) {
                            alert(`You successfully added ${users.name} to ${groupDetails.name}`);
                        }
                    } catch (err) {
                        console.log(err);
                        alert(`${users.name} is already in your Group`);
                    }
                });
            }
        }

        div.appendChild(p);
        userLists.appendChild(li);
    }
};


// Function to display group members on the screen
const showGroupUsersOnScreen = (users, userGroup) => {
    const groupDetails = JSON.parse(localStorage.getItem('groupDetails'));
    const token = localStorage.getItem('token');
    const decodeToken = parseJwt(token);

    const userLists = document.getElementById('userLists');

    const li = document.createElement('li');
    li.classList.add('contact');

    const div = document.createElement('div');
    div.classList.add('wrap');
    li.appendChild(div);

    const p = document.createElement('p');
    p.textContent = users.name;

    const isAdmin = JSON.parse(localStorage.getItem('isAdmin'));
    const removeUser = document.createElement('button');
    removeUser.classList.add('button-45');
    const makeAdmin = document.createElement('button');
    makeAdmin.classList.add('button-29');
    const leaveGroup = document.createElement('button');
    leaveGroup.classList.add('button-62');

    if (userGroup.isAdmin) {
        p.textContent = users.name + ' (Group Admin)';
        p.style.color = 'black';
    }

    if (users.id === decodeToken.userId) {
        leaveGroup.innerHTML = `Leave Group`;
        p.appendChild(leaveGroup);
        const userGroupId = userGroup.id;
        leaveUserGroup(leaveGroup, userGroupId, li);
    }

    if (isAdmin) {
        removeUser.innerHTML = `Remove User`;
        makeAdmin.innerHTML = `Make Admin`;
        p.appendChild(removeUser);
        p.appendChild(makeAdmin);

        if (users.id === decodeToken.userId) {
            removeUser.remove();
            makeAdmin.remove();
        }

        if (userGroup.isAdmin) {
            removeUser.remove();
            makeAdmin.remove();
        }

        removeUser.addEventListener('click', async () => {
            const userGroupId = userGroup.id;
            const res = await axios.delete(`http://localhost:3000/group/remove/${userGroupId}`);
            if (res.status === 200) {
                li.remove();
                alert(`You successfully removed ${users.name} from ${groupDetails.name}`);
            }
        });

        makeAdmin.addEventListener('click', async () => {
            const userGroupId = userGroup.id;
            const res = await axios.post(`http://localhost:3000/group/admin/${userGroupId}`);
            if (res.status === 202) {
                makeAdmin.remove();
                removeUser.remove();
                alert(`You successfully made ${users.name} the admin of ${groupDetails.name}`);
            }
        });
    }

    div.appendChild(p);
    userLists.appendChild(li);
};

// Function to display group title on the screen
const showGroupsListTitle = () => {
    const contacts = document.getElementById('contacts');
    const userLists = document.createElement('ul');
    userLists.id = 'groupLists';
    const userListsLi = document.createElement('li');
    userListsLi.classList.add('contact');
    userLists.appendChild(userListsLi);
    const userListsDiv = document.createElement('div');
    userListsDiv.classList.add('wrap');
    userListsLi.appendChild(userListsDiv);
    const userListH3 = document.createElement('h3');
    userListH3.style.fontWeight = 'bold';
    userListH3.textContent = `My Groups`;
    userListsDiv.appendChild(userListH3);
    const closeBtn = document.createElement('button');
    userListH3.appendChild(closeBtn);
    closeBtn.innerHTML = 'Close';
    closeBtn.classList.add('button-17');
    contacts.appendChild(userLists);
    closeBtn.addEventListener('click', () => {
        userLists.remove();
    });
};

// Function to display user list title on the screen
const showUserListTitle = () => {
    const contacts = document.getElementById('contacts');
    const userLists = document.createElement('ul');
    userLists.id = 'userLists';
    const userListsLi = document.createElement('li');
    userListsLi.classList.add('contact');
    userLists.appendChild(userListsLi);
    const userListsDiv = document.createElement('div');
    userListsDiv.classList.add('wrap');
    userListsLi.appendChild(userListsDiv);
    const userListH3 = document.createElement('h3');
    userListH3.style.fontWeight = 'bold';
    userListH3.textContent = `List of Contacts`;
    userListH3.id = 'userListTitle';
    userListsDiv.appendChild(userListH3);
    const closeBtn = document.createElement('button');
    userListH3.appendChild(closeBtn);
    closeBtn.innerHTML = 'Close';
    closeBtn.classList.add('button-17');
    contacts.appendChild(userLists);
    closeBtn.addEventListener('click', () => {
        userLists.remove();
    });
};

// Function to display group user list title on the screen
const showGroupUserListTitle = () => {
    const contacts = document.getElementById('contacts');
    const userLists = document.createElement('ul');
    userLists.id = 'userLists';
    const userListsLi = document.createElement('li');
    userListsLi.classList.add('contact');
    userLists.appendChild(userListsLi);
    const userListsDiv = document.createElement('div');
    userListsDiv.classList.add('wrap');
    userListsLi.appendChild(userListsDiv);
    const userListH3 = document.createElement('h3');
    userListH3.style.fontWeight = 'bold';
    userListH3.textContent = `Group Members`;
    userListH3.id = 'userListTitle';
    userListsDiv.appendChild(userListH3);
    const closeBtn = document.createElement('button');
    userListH3.appendChild(closeBtn);
    closeBtn.innerHTML = 'Close';
    closeBtn.classList.add('button-17');
    contacts.appendChild(userLists);
    closeBtn.onclick = () => {
        userLists.remove();
    };
};

// Function to display group name on the screen
const showGroupName = (groupName) => {
    const boxName = document.getElementById('boxName');
    boxName.textContent = `${groupName}`;
};

// Function to display user name and role (admin/user) on the screen
const showUserName = () => {
    const decodeToken = parseJwt(localStorage.getItem('token'));
    const userName = document.getElementById('userName');
    userName.textContent = `${decodeToken.name}`;
};



const showNotificationOnScreen = (name) => {
    const ul = document.getElementById('newMessages');
    ul.style.textAlign = 'center';

    const p = document.createElement('p');
    p.style.fontFamily = 'bold';
    p.textContent = `${name} is connected`;

    ul.append(p);
};



showGroups.addEventListener('click', async () => {
    // Get the user's token
    const token = localStorage.getItem('token');

    // Send a GET request to fetch user's groups from the server
    const res = await axios.get('http://localhost:3000/group/groups', { headers: { "Authorization": token } });
    const usersGroups = res.data.groupsList;
    const userGroup = res.data.userGroup;

    // Display the list of user's groups
    showGroupsListTitle();
    for (let i = 0; i < usersGroups.length && i < userGroup.length; i++) {
        showGroupsOnScreen(usersGroups[i], userGroup[i]);
    }
});


// Add a click event listener to the "Show Group Members" button
showGroupMembers.addEventListener('click', async () => {
    const groupDetails = JSON.parse(localStorage.getItem('groupDetails'));
    showGroupUserListTitle();

    // Send a GET request to fetch group members from the server
    const res = await axios.get(`http://localhost:3000/group/members/${groupDetails.id}`);
    const listOfGroupMembers = res.data.usersDetails;
    const userGroupDetails = res.data.userGroup;

    // Display the list of group members
    for (let i = 0, j = 0; i < listOfGroupMembers.length, j < userGroupDetails.length; i++, j++) {
        showGroupUsersOnScreen(listOfGroupMembers[i], userGroupDetails[j]);
    }
});

// Add a click event listener to the "Add Users" button
addUsers.addEventListener('click', async () => {
    // Send a GET request to fetch a list of users from the server
    const res = await axios.get('http://localhost:3000/users');
    const listUsers = res.data.listOfUsers;

    // Display the list of users
    showUserListTitle();
    listUsers.forEach(users => {
        showUsersOnScreen(users);
    });
});

// Function to handle leaving a user group
const leaveUserGroup = (leaveGroup, userGroupId, li) => {
    const groupDetails = JSON.parse(localStorage.getItem('groupDetails'));
    leaveGroup.addEventListener('click', async () => {
        const res = await axios.delete(`http://localhost:3000/group/remove/${userGroupId}`);
        if (res.status === 200) {
            li.remove();
            alert(`You Successfully left ${groupDetails.name}`);
            localStorage.removeItem('groupDetails');
            window.location.reload();
        }
    });
};

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



function isValidURL(str) {
    try {
        new URL(str);
        return true;
    } catch (_) {
        return false;
    }
}


document.getElementById('logoutBtn').addEventListener('click',logout);

function logout() {
  try {
    localStorage.clear();
    
    window.location.href = "/";
  } catch (error) {
    console.log(error);
  }
}