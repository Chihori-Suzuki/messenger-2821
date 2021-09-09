const router = require("express").Router();
const { Conversation, Message } = require("../../db/models");
const onlineUsers = require("../../onlineUsers");
const Sequelize = require('sequelize')

// expects {recipientId, text, conversationId } in body (conversationId will be null if no conversation exists yet)
router.post("/", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const senderId = req.user.id;
    const { recipientId, text, conversationId, sender } = req.body;

    // if we already know conversation id, we can save time and just add it to message and return
    if (conversationId) {
      const message = await Message.create({ senderId, text, conversationId });
      return res.json({ message, sender });
    }
    // if we don't have conversation id, find a conversation to make sure it doesn't already exist
    let conversation = await Conversation.findConversation(
      senderId,
      recipientId
    );

    if (!conversation) {
      // create conversation
      conversation = await Conversation.create({
        user1Id: senderId,
        user2Id: recipientId,
      });
      if (onlineUsers.includes(sender.id)) {
        sender.online = true;
      }
    }
    const message = await Message.create({
      senderId,
      text,
      conversationId: conversation.id,
    });
    res.json({ message, sender });
  } catch (error) {
    next(error);
  }
});

router.patch("/unreadMessage", async (req, res, next) => {
  const { convoId, userId } = req.body;
  if (!convoId || !userId) return
  try {
    const unreadMessages = await Message.findAll({
      where: {
        [Sequelize.Op.and]: {
          conversationId: convoId,
          user1IsRead: false,
          [Sequelize.Op.not]: {
            senderId: userId
          }
        }
      },
      attributes: ["id", "user1IsRead", "user2IsRead"],
      include: [{
        model: Conversation,
        where: {
          id: convoId
        },
        attributes: ["user1Id", "user2Id"],
      }],
    });
    
    for (let i = 0; i < unreadMessages.length; i++) {
      if (unreadMessages[i].conversation.user1Id == parseInt(userId) && !unreadMessages[i].user1IsRead) {
        unreadMessages[i].user1IsRead = true
        unreadMessages[i].save();
      } else if (unreadMessages[i].conversation.user2Id == parseInt(userId) && !unreadMessages[i].user2IsRead) {
        unreadMessages[i].user2IsRead = true
        unreadMessages[i].save();
      }
    }
  } catch (error) {
    next(error);
  }
});

router.get("/unreadMessage", async (req, res, next) => {
  const { convoId, userId } = req.query;
  if (!convoId || !userId) return
  try {
    const unreadMessages = await Message.findAll({
      where: {
        [Sequelize.Op.and]: {
          conversationId: convoId,
          user1IsRead: false,
          [Sequelize.Op.not]: {
            senderId: userId
          }
        }
      },
      attributes: ["user1IsRead", "user2IsRead"],
      include: [{
        model: Conversation,
        where: {
          id: convoId
        },
        attributes: ["user1Id", "user2Id"],
      }],
    });
    let unreadMessageCount = 0

    for (let unreadMessage of unreadMessages) {
      if (unreadMessage.conversation.user1Id === parseInt(userId) && !unreadMessage.user1IsRead) {
        unreadMessageCount += 1
      } else if (unreadMessage.conversation.user2Id === parseInt(userId) && !unreadMessage.user2IsRead) {
        unreadMessageCount += 1
      }
    }
    res.json(unreadMessageCount)
  } catch (error) {
    next(error);
  }
});

module.exports = router;
