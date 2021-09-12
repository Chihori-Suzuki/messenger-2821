const sortFunc = (a, b) => {
  const first = a['messages'][a['messages'].length - 1]
  const second = b['messages'][b['messages'].length - 1]
  if (!first || !second) {
    return 0
  }
  if (first["createdAt"] > second["createdAt"]) {
    return -1;
  } else if (first["createdAt"] < second["createdAt"]) {
    return 1;
  } else {
    return 0;
  }
}

export const addMessageToStore = (state, payload) => {
  const { message, sender } = payload;
  // if sender isn't null, that means the message needs to be put in a brand new convo
  if (sender !== null) {
    const newConvo = {
      id: message.conversationId,
      otherUser: sender,
      messages: [message],
    };
    newConvo.latestMessageText = message.text;
    return [newConvo, ...state];
  }

  const newState = state.map((convo) => {
    if (convo.id === message.conversationId) {
      const convoCopy = { ...convo };
      const newMessages = [...convo.messages];
      convoCopy.messages = [...newMessages, message];
      convoCopy.latestMessageText = message.text;
      convoCopy.unreadMessageCount = convo.unreadMessageCount + 1;
      return convoCopy;
    } else {
      return convo;
    }
  });
  newState.sort(sortFunc);
  return newState;
};

export const addOnlineUserToStore = (state, id) => {
  return state.map((convo) => {
    if (convo.otherUser.id === id) {
      const convoCopy = { ...convo };
      convoCopy.otherUser.online = true;
      return convoCopy;
    } else {
      return convo;
    }
  });
};

export const removeOfflineUserFromStore = (state, id) => {
  return state.map((convo) => {
    if (convo.otherUser.id === id) {
      const convoCopy = { ...convo };
      convoCopy.otherUser.online = false;
      return convoCopy;
    } else {
      return convo;
    }
  });
};

export const addSearchedUsersToStore = (state, users) => {
  const currentUsers = {};

  // make table of current users so we can lookup faster
  state.forEach((convo) => {
    currentUsers[convo.otherUser.id] = true;
  });

  const newState = [...state];
  users.forEach((user) => {
    // only create a fake convo if we don't already have a convo with this user
    if (!currentUsers[user.id]) {
      let fakeConvo = { otherUser: user, messages: [] };
      newState.push(fakeConvo);
    }
  });

  return newState;
};

export const addNewConvoToStore = (state, recipientId, message) => {

  const newState = state.map((convo) => {
    if (convo.otherUser.id === recipientId) {
      const convoCopy = { ...convo };
      const newMessages = [...convo.messages];
      convoCopy.id = message.conversationId;
      convoCopy.messages = [...newMessages, message];
      convoCopy.latestMessageText = message.text;
      return convoCopy;
    } else {
      return convo;
    }
  });

  newState.sort(sortFunc);

  return newState;
};

export const updateUnreadMessageCountInStore = (state, convoId) => {

  const newState = state.map((convo) => {
    if (convo.id === convoId) {
      const convoCopy = { ...convo };
      convoCopy.unreadMessageCount = 0;
      return convoCopy;
    } else {
      return convo;
    }
  });

  return newState;
};