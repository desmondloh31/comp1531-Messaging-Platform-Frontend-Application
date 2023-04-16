import { getData } from './dataStore';
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
