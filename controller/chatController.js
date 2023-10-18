const Chat = require('../model/chatModel');
const ArchivedChat = require('../model/archivedChatModel');

const postMessage = async (req, res) => {
    try {
        const { textMessage, groupId } = req.body;

        const name = req.user.name;
        const chats = await Chat.create({
            message: textMessage,
            sender: name,
            groupId: groupId,
            userId: req.user.id
        });

        res.status(201).json({ textMessage: chats, message: 'Successfully sent message' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getMessages = async (req, res) => {
    try {
        const { groupId } = req.params;

        const textMessages = await Chat.findAll({ where: { groupId } });

        if (textMessages.length > 0) {
            return res.status(202).json({ textMessages });
        } else {
            return res.status(201).json({ message: 'There are no previous messages' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    postMessage,
    getMessages,
}
