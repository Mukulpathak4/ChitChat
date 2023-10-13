const Chat = require('../model/chatModel'); // Import the Chat model if not already imported

const sendMessage = async (req, res) => {
    try {
        // Extract data from the request body
        const { textMessage } = req.body;

        const name = req.user.name;

        // Create a new chat message in the Chat model
        const chat = await Chat.create({
            message: textMessage,
            sender: name,
            userId: req.user.id
        });

        // Respond with a success message and the created chat message
        res.status(201).json({ chat, message: 'Message sent successfully' });

    } catch (err) {
        // Handle errors and respond with a 500 Internal Server Error
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
const getMessages = async (req, res) => {
    try {

        const textMessages = await Chat.findAll();

        // Check if there are any messages
        if (textMessages.length > 0) {
            return res.status(202).json({ textMessages });
        } else {
            // If there are no messages, return a message indicating that
            return res.status(201).json({ message: 'There are no previous messages' });
        }
    } catch (err) {
        // Handle errors and respond with a 500 Internal Server Error
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    sendMessage,
    getMessages
};
