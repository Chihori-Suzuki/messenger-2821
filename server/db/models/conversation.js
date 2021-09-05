const { Op, DataTypes } = require("sequelize");
const db = require("../db");
const Message = require("./message");

const Conversation = db.define("conversation", {
  user1LastReadAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: '2021-09-02 17:25:08.966-07',
  },
  user2LastReadAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: '2021-09-02 17:25:08.966-07',
  },
});

// find conversation given two user Ids

Conversation.findConversation = async function (user1Id, user2Id) {
  const conversation = await Conversation.findOne({
    where: {
      user1Id: {
        [Op.or]: [user1Id, user2Id]
      },
      user2Id: {
        [Op.or]: [user1Id, user2Id]
      }
    }
  });

  // return conversation or null if it doesn't exist
  return conversation;
};

module.exports = Conversation;
