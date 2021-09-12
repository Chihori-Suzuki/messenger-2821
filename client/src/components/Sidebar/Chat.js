import React, { useEffect } from "react";
import { Box } from "@material-ui/core";
import { BadgeAvatar, ChatContent } from "../Sidebar";
import { makeStyles } from "@material-ui/core/styles";
import { setActiveChat } from "../../store/activeConversation";
import { connect } from "react-redux";
import store from "../../store/index";
import { updateIsRead } from '../../store/utils/thunkCreators'
import { updateUnreadMessageCount } from '../../store/conversations'

const useStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 8,
    height: 80,
    boxShadow: "0 2px 10px 0 rgba(88,133,196,0.05)",
    marginBottom: 10,
    display: "flex",
    alignItems: "center",
    "&:hover": {
      cursor: "grab"
    }
  }
}));

const Chat = (props) => {
  const classes = useStyles();
  const { conversation, updateUnreadMessageCount } = props;
  const { otherUser } = conversation;

  useEffect(() => {
    const activeChat = store.getState().activeConversation

    if (otherUser.username === activeChat && conversation.unreadMessageCount > 0) {
      const body = {
        convoId: conversation.id
      }
      updateIsRead(body)
      updateUnreadMessageCount(body.convoId)
    }
  }, [conversation]);

  const handleClick = async (conversation) => {
    await props.setActiveChat(conversation.otherUser.username);

    if (!conversation.id) return

    const body = {
      convoId: conversation.id
    }

    updateIsRead(body)
    updateUnreadMessageCount(body.convoId)
  };

  return (
    <Box onClick={() => handleClick(conversation)} className={classes.root}>
      <BadgeAvatar
        photoUrl={otherUser.photoUrl}
        username={otherUser.username}
        online={otherUser.online}
        sidebar={true}
      />
      <ChatContent conversation={conversation} />
    </Box>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    setActiveChat: (id) => {
      dispatch(setActiveChat(id));
    },
    updateUnreadMessageCount: (convoId) => {
      dispatch(updateUnreadMessageCount(convoId));
    },
  };
};

export default connect(null, mapDispatchToProps)(Chat);
