// import { messageSendV1 } from './channel';
import { getData, setData } from './dataStore';
import { tokenVerify } from './token';
import HttpError from 'http-errors';
// import errorHandler from 'middleware-http-errors';

// message/react/v1
// Given a message within a channel or DM the authorised user is
// part of, adds a "react" to that particular message.

export function messageReactV1(token: string, messageId: number, reactId: number) {
  const data = getData();
  const authUserId = tokenVerify(token) as number;
  const channel = data.channels.find(i => i.messages.find(j => j.messageId === messageId) !== undefined);
  const dm = data.dms.find(i => i.messages.find(j => j.messageId === messageId) !== undefined);
  let isdm = false;
  if (!channel) {
    if (!dm) {
      throw HttpError(400, 'messageId is invalid');
    }
    isdm = true;
  }

  if (reactId !== 1) {
    throw HttpError(400, 'reactId is invalid');
  }

  if (isdm) {
    if (!dm.allMembers.includes(authUserId)) {
      throw HttpError(403, 'User is not a member of this DM');
    }
    const message = dm.messages.find(i => i.messageId === messageId);
    if (message.reacts.uids.includes(authUserId)) {
      throw HttpError(400, 'User has already reacted with this reactId');
    }
    message.reacts[reactId].push(authUserId);
    return {};
  }

  if (!isdm) {
    if (!channel.allMembers.includes(authUserId)) {
      throw HttpError(403, 'User is not a member of this channel');
    }
    const message = channel.messages.find(i => i.messageId === messageId);
    if (message.reacts.uids.includes(authUserId)) {
      throw HttpError(400, 'User has already reacted with this reactId');
    }
    message.reacts.uids.push(authUserId);
    return {};
  }
}

// message/unreact/v1
// Given a message within a channel or DM the authorised user is
// part of, removes a "react" to that particular message.

export function messageUnreactV1(token: string, messageId: number, reactId: number) {
  const data = getData();
  const authUserId = tokenVerify(token) as number;
  const channel = data.channels.find(i => i.messages.find(j => j.messageId === messageId) !== undefined);
  const dm = data.dms.find(i => i.messages.find(j => j.messageId === messageId) !== undefined);
  let isdm = false;
  if (!channel) {
    if (!dm) {
      throw HttpError(400, 'messageId is invalid');
    }
    isdm = true;
  }

  if (reactId !== 1) {
    throw HttpError(400, 'reactId is invalid');
  }

  if (isdm) {
    if (!dm.allMembers.includes(authUserId)) {
      throw HttpError(403, 'User is not a member of this DM');
    }
    const message = dm.messages.find(i => i.messageId === messageId);
    if (!message.reacts.uids.includes(authUserId)) {
      throw HttpError(400, 'User has not reacted with this reactId');
    }
    message.reacts.uids.splice(message.reacts.uids.indexOf(authUserId), 1);
    return {};
  }

  if (!isdm) {
    if (!channel.allMembers.includes(authUserId)) {
      throw HttpError(403, 'User is not a member of this channel');
    }
    const message = channel.messages.find(i => i.messageId === messageId);
    if (!message.reacts.uids.includes(authUserId)) {
      throw HttpError(400, 'User has not reacted with this reactId');
    }
    message.reacts.uids.splice(message.reacts.uids.indexOf(authUserId), 1);
    return {};
  }
}

// message/pin/v1
// Given a message within a channel or DM, marks it as "pinned"

export function messagePinV1(token: string, messageId: number) {
  const data = getData();
  const authUserId = tokenVerify(token) as number;
  const channel = data.channels.find(i => i.messages.find(j => j.messageId === messageId) !== undefined);
  const dm = data.dms.find(i => i.messages.find(j => j.messageId === messageId) !== undefined);
  let isdm = false;
  if (!channel) {
    if (!dm) {
      throw HttpError(400, 'messageId is invalid');
    }
    isdm = true;
  }

  if (isdm) {
    if (dm.creator !== authUserId) {
      throw HttpError(403, 'User does not have permission');
    }
    const message = dm.messages.find(i => i.messageId === messageId);
    if (message.pinned) {
      throw HttpError(400, 'Message is already pinned');
    }
    message.pinned = true;
    return {};
  }

  if (!isdm) {
    if (!channel.ownerMembers.includes(authUserId)) {
      throw HttpError(403, 'User does not have permission');
    }
    const message = channel.messages.find(i => i.messageId === messageId);
    if (message.pinned) {
      throw HttpError(400, 'Message is already pinned');
    }
    message.pinned = true;
    return {};
  }
}

export function messageUnpinV1(token: string, messageId: number) {
  const data = getData();
  const authUserId = tokenVerify(token) as number;
  const channel = data.channels.find(i => i.messages.find(j => j.messageId === messageId) !== undefined);
  const dm = data.dms.find(i => i.messages.find(j => j.messageId === messageId) !== undefined);
  let isdm = false;
  if (!channel) {
    if (!dm) {
      throw HttpError(400, 'messageId is invalid');
    }
    isdm = true;
  }

  if (isdm) {
    if (dm.creator !== authUserId) {
      throw HttpError(403, 'User does not have permission');
    }
    const message = dm.messages.find(i => i.messageId === messageId);
    if (!message.pinned) {
      throw HttpError(400, 'Message is not already pinned');
    }
    message.pinned = false;
    return {};
  }

  if (!isdm) {
    if (!channel.ownerMembers.includes(authUserId)) {
      throw HttpError(403, 'User does not have permission');
    }
    const message = channel.messages.find(i => i.messageId === messageId);
    if (!message.pinned) {
      throw HttpError(400, 'Message is not already pinned');
    }
    message.pinned = false;
    return {};
  }
}

// message/share/v1
// ogMessageId is the ID of the original message. channelId is the channel that the message is being shared to, and is -1 if it is being sent to a DM. dmId is the DM that the message is being shared to, and is -1 if it is being sent to a channel. message is the optional message in addition to the shared message, and will be an empty string '' if no message is given.
// A new message containing the contents of both the original message and the optional message should be sent to the channel/DM identified by the channelId/dmId. The format of the new message does not matter as long as both the original and optional message exist as a substring within the new message. Once sent, this new message has no link to the original message, so if the original message is edited/deleted, no change will occur for the new message.

function messageSend(authUserId: number, channelId: number, dmId: number, message: string) {
  const data = getData();
  const user = data.users.find(i => i.authUserId === authUserId);
  const channel = data.channels.find(i => i.channelId === channelId);
  const dm = data.dms.find(i => i.dmId === dmId);

  let ischannel = false;
  if (dmId === -1) {
    ischannel = true;
    if (!channel) {
      throw HttpError(400, 'channelId is invalid');
    }
  } else if (!dm) {
    throw HttpError(400, 'dmId is invalid');
  }

  if (!user) {
    throw HttpError(400, 'authUserId is invalid');
  }

  if (ischannel) {
    if (channel.allMembers.find((i: number) => i === authUserId) === undefined) {
      throw HttpError(403, 'authUserId is not a member of the channel with ID channelId');
    }
  } else if (!ischannel) {
    if (dm.allMembers.find((i: number) => i === authUserId) === undefined) {
      throw HttpError(403, 'authUserId is not a member of the DM with ID dmId');
    }
  }

  if (message.length > 1000) {
    throw HttpError(400, 'message length is greater than 1000 characters');
  } else if (message.length === 0) {
    throw HttpError(400, 'message length is 0');
  }

  const Id = data.msgcount;
  data.msgcount++;

  if (ischannel) {
    channel.messages.push({
      messageId: Id,
      senderId: authUserId,
      message: message,
      timeSent: Date.now(),
      reacts: {
        reactId: 1,
        uids: [],
      },
      pinned: false,
    });
  } else {
    dm.messages.push({
      messageId: Id,
      senderId: authUserId,
      message: message,
      timeSent: Date.now(),
      reacts: {
        reactId: 1,
        uids: [],
      },
      pinned: false,
    });
  }

  setData(data);
  return { messageId: Id };
}

export function messageShareV1(token: string, ogMessageId: number, channelId: number, dmId: number, message: string) {
  const data = getData();
  const authUserId = tokenVerify(token) as number;

  let finalMsg = '';
  const ogMsgc = data.channels.find(i => i.messages.find(j => j.messageId === ogMessageId) !== undefined);
  const ogMsgd = data.dms.find(i => i.messages.find(j => j.messageId === ogMessageId) !== undefined);
  let ogMsg;
  if (!ogMsgc && !ogMsgd) {
    throw HttpError(400, 'Original message does not exist');
  } else if (!ogMsgd) {
    ogMsg = ogMsgc;
  } else {
    ogMsg = ogMsgd;
  }

  if ((channelId === -1 && dmId === -1) || (channelId !== -1 && dmId !== -1)) {
    throw HttpError(400, 'Invalid channelId/dmId');
  }

  if (message.length > 1000) {
    throw HttpError(400, 'Message is too long');
  }

  console.log(ogMsg);

  const og = ogMsg.messages.find(i => i.messageId === ogMessageId);
  finalMsg = og.message + '-->' + message;

  if (channelId !== -1) {
    const result = messageSend(authUserId, channelId, -1, finalMsg).messageId;
    return { sharedMessageId: result };
  } else {
    const result = messageSend(authUserId, -1, dmId, finalMsg).messageId;
    return { sharedMessageId: result };
  }
}
