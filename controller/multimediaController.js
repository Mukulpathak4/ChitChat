// Import necessary modules and models
const Chats = require('../model/chatModel');
const S3service = require('../s3Service/s3'); 

const postMediaFile = async (req, res) => {
    try {
        const { groupId } = req.params; 
        const userId = req.user.id; 
        const name = req.user.name;
        const file = req.file.buffer;
        const fileName = `${userId} ${req.file.originalname}`;

        const fileUrl = await S3service.uploadToS3(file, fileName);

        const postFile = await Chats.create({ message: fileUrl, sender: name, groupId: Number(groupId), userId });

        res.status(202).json({ files: postFile, message: `File sent successfully` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Internal Server Error` });
    }
}

module.exports = {
    postMediaFile
}
