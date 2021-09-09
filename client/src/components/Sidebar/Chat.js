import React, { useEffect, useState } from "react";
import { Box } from "@material-ui/core";
import { BadgeAvatar, ChatContent } from "../Sidebar";
import { makeStyles } from "@material-ui/core/styles";
import { setActiveChat } from "../../store/activeConversation";
import { connect } from "react-redux";
import store from "../../store/index";
import { updateIsRead, getUnreadMessageCount } from '../../store/utils/thunkCreators'

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
  const { conversation } = props;
  const { otherUser } = conversation;
  const [ unreadMessageCount, setUnreadMessageCount ] = useState(0)

  useEffect(() => {
    const activeChat = store.getState().activeConversation
    const userId = store.getState().user.id

    const fetchLastReadCount = async () => {
      if (otherUser.username === activeChat) {
        const body = {
          convoId: conversation.id,
          userId
        }
        updateIsRead(body)
        setUnreadMessageCount(0)
        return
      }
  
      const unreadMessageCountparams = {
        convoId: conversation.id,
        userId: userId,
      }

      const fetchedUnreadMessageCount = await getUnreadMessageCount(unreadMessageCountparams);
      
      setUnreadMessageCount(fetchedUnreadMessageCount);
    }
    fetchLastReadCount();

  }, [conversation]);

  const handleClick = async (conversation) => {
    await props.setActiveChat(conversation.otherUser.username);
    const userId = store.getState().user.id;

    const params = {
      convoId: conversation.id,
      userId
    }
    if (!conversation.id) return

    updateIsRead(params)
    setUnreadMessageCount(0)
  };

  return (
    <Box onClick={() => handleClick(conversation)} className={classes.root}>
      <BadgeAvatar
        photoUrl={otherUser.photoUrl}
        username={otherUser.username}
        online={otherUser.online}
        sidebar={true}
      />
      <ChatContent conversation={conversation} unreadMessageCount={unreadMessageCount} />
    </Box>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    setActiveChat: (id) => {
      dispatch(setActiveChat(id));
    }
  };
};

export default connect(null, mapDispatchToProps)(Chat);
