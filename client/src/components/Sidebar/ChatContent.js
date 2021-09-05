import React from "react";
import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "space-between",
    marginLeft: 20,
    marginRight: 20,
    flexGrow: 1,
  },
  username: {
    fontWeight: "bold",
    letterSpacing: -0.2,
  },
  previewText: {
    fontSize: 12,
    color: "#9CADC8",
    letterSpacing: -0.17,
  },
  bubble: {
    background: "#3A8DFF",
    borderRadius: "15px",
    margin: "8px 0"
  },
  text: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: -0.2,
    padding: "2px 8px"
  },
}));


const ChatContent = (props) => {
  const classes = useStyles();

  const { conversation, unreadMessageCount } = props;
  const { latestMessageText, otherUser } = conversation;

  return (
    <Box className={classes.root}>
      <Box>
        <Typography className={classes.username}>
          {otherUser.username}
        </Typography>
        <Typography className={classes.previewText}>
          {latestMessageText}
        </Typography>
      </Box>
      {unreadMessageCount > 0 ?
        <Box className={classes.bubble}>
          <Typography className={classes.text}>{unreadMessageCount}</Typography>
        </Box> 
      : null}
    </Box>
  );
};

export default ChatContent;
