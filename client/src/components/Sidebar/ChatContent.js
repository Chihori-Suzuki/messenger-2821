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
    background: theme.palette.primary.main,
    borderRadius: "15px",
    margin: theme.space.margin.main
  },
  text: {
    fontSize: theme.typography.fontSize,
    fontWeight: "bold",
    color: theme.palette.fontColor.main,
    letterSpacing: -0.2,
    padding: theme.space.padding.main,
  },
}));


const ChatContent = (props) => {
  const classes = useStyles();

  const { conversation } = props;
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
      {conversation.unreadMessageCount > 0 &&
        <Box className={classes.bubble}>
          <Typography className={classes.text}>{conversation.unreadMessageCount}</Typography>
        </Box> 
      }
    </Box>
  );
};

export default ChatContent;
