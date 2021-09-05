const router = require("express").Router();
const { User, Conversation, Message } = require("../../db/models");
const { Op } = require("sequelize");
const onlineUsers = require("../../onlineUsers");

// get all conversations for a user, include latest message text for preview, and all messages
// include other user model so we have info on username/profile pic (don't include current user info)
router.get("/", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const userId = req.user.id;
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: {
          user1Id: userId,
          user2Id: userId,
        },
      },
      attributes: ["id", "user1LastReadAt", "user2LastReadAt"],
      order: [[Message, "createdAt", "ASC"]],
      include: [
        { model: Message, order: ["createdAt", "DESC"] },
        {
          model: User,
          as: "user1",
          where: {
            id: {
              [Op.not]: userId,
            },
          },
          attributes: ["id", "username", "photoUrl"],
          required: false,
        },
        {
          model: User,
          as: "user2",
          where: {
            id: {
              [Op.not]: userId,
            },
          },
          attributes: ["id", "username", "photoUrl"],
          required: false,
        },
      ],
    });

    for (let i = 0; i < conversations.length; i++) {
      const convo = conversations[i];
      const convoJSON = convo.toJSON();
      let lastReadAt = "";

      // set a property "otherUser" so that frontend will have easier access
      if (convoJSON.user1) {
        convoJSON.otherUser = convoJSON.user1;
        delete convoJSON.user1;
        lastReadAt = convoJSON.user2LastReadAt;
      } else if (convoJSON.user2) {
        convoJSON.otherUser = convoJSON.user2;
        delete convoJSON.user2;
        lastReadAt = convoJSON.user1LastReadAt;
      }

      // set property for online status of the other user
      if (onlineUsers.includes(convoJSON.otherUser.id)) {
        convoJSON.otherUser.online = true;
      } else {
        convoJSON.otherUser.online = false;
      }

      // set properties for notification count and latest message preview
      convoJSON.latestMessageText = convoJSON.messages[convoJSON.messages.length - 1].text;
      conversations[i] = convoJSON;
    }

    conversations.sort(
      function (a, b) {
        if (a['messages'][a['messages'].length - 1]["createdAt"] > b['messages'][b['messages'].length - 1]["createdAt"]) {
          return -1;
        } else if (a['messages'][a['messages'].length - 1]["createdAt"] < b['messages'][b['messages'].length - 1]["createdAt"]) {
          return 1;
        } else {
          return 0;
        }
      }
    )
    res.json(conversations);
  } catch (error) {
    next(error);
  }
});

router.patch("/lastRead", async (req, res, next) => {
  const { id, senderId } = req.body;
  const convo = await Conversation.findOne({ where: { id: id } });
  const date = new Date();
  const currentTime = new Date(date.getTime())

  if (convo.user1Id === senderId) {
    convo.user1LastReadAt = currentTime
  } else {
    convo.user2LastReadAt = currentTime
  }
  convo.save()
});

router.get("/lastRead", async (req, res, next) => {
  const { convoId, userId } = req.query;
  if (!convoId || !userId) return

  try {
    const convo = await Conversation.findOne({ where: { id: convoId } });
    let lastReadAt = ""
    if (convo.user1Id === parseInt(userId)) {
      lastReadAt = convo.user1LastReadAt
    } else {
      lastReadAt = convo.user2LastReadAt
    }

    let resLastReadAt = new Date(lastReadAt)
    resLastReadAt.setHours(resLastReadAt.getHours() - 7);

    res.json(resLastReadAt)
  } catch (error) {
    next(error);
  }
});

module.exports = router;
