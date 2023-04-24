import { getData, setData } from './dataStore';
import { tokenVerify } from './token';
import HttpError from 'http-errors';

function usersAll(target: any) {
  // check that token is valid
  console.log('target', target);
  const data = getData();
  const users = [];
  for (const userData of data.users) {
    if (target.includes(userData.authUserId)) {
      const alan = {
        uId: userData.authUserId,
        email: userData.email,
        nameFirst: userData.nameFirst,
        nameLast: userData.nameLast,
        handleStr: userData.handleStr
      };
      users.push(alan);
    }
  }
  return users;
}

export function channelDetailsV1(token: string, channelId: number) {
  // Determining whether authUserId is valid
  const data = getData();
  const authUser = tokenVerify(token) as number;
  const user = data.users.find(i => i.authUserId === authUser);
  const channel = data.channels.find(i => i.channelId === channelId);

  if (!channel) {
    throw HttpError(400, 'channelId is invalid');
  }

  if (!user) {
    throw HttpError(403, 'authUserId is invalid');
  }

  // Determine whether the channelId is valid & user is a part of the channel
  for (const currentChannel in data.channels) {
    const channel = data.channels[currentChannel];
    if (channel.channelId === channelId && (channel.ownerMembers.includes(authUser) || channel.allMembers.includes(authUser))) {
      console.log({ name: channel.name, isPublic: channel.isPublic, ownerMembers: usersAll(channel.ownerMembers), allMembers: usersAll(channel.allMembers) });
      return { name: channel.name, isPublic: channel.isPublic, ownerMembers: usersAll(channel.ownerMembers), allMembers: usersAll(channel.allMembers) };
    }
  }
  throw HttpError(403, 'User is not a part of the channel or invalid channelId');
}

export function channelMessagesV1(authUserId: number, channelId: number, start: number) {
  const data = getData();
  const user = data.users.find(i => i.authUserId === authUserId);
  const channel = data.channels.find(i => i.channelId === channelId);

  if (!user) {
    return { error: 'authUserId is invalid' };
  } else if (!channel) {
    throw HttpError(400, 'channelId is invalid');
  } else if (channel.messages.length < start) {
    throw HttpError(400, 'start is greater than the total number of messages in the channel');
  } else if (channel.allMembers.find((i: number) => i === authUserId) === undefined) {
    throw HttpError(403, 'authUserId is not a member of the channel with ID channelId');
  }

  const result = {
    messages: [] as object[],
    start: start,
    end: start + 50 < channel.messages.length ? start + 50 : -1,
  };
  for (let i = 0; i < channel.messages.length; i++) {
    if (i < 50) {
      let isThisUserReacted = false;
      if (channel.messages[i].reacts.uids.includes(authUserId)) {
        isThisUserReacted = true;
      }
      result.messages.push({
        messageId: channel.messages[i].messageId,
        uId: channel.messages[i].senderId,
        message: channel.messages[i].message,
        timeSent: channel.messages[i].timeSent,
        reacts: [{
          reactId: 1,
          uIds: channel.messages[i].reacts.uids,
          isThisUserReacted: isThisUserReacted
        }],
        isPinned: channel.messages[i].isPinned
      });
    }
  }
  console.log(result);
  return result;
}

export function dmMessagesV1(token: string, dmId: number, start: number) {
  const authUserId = tokenVerify(token) as number;
  const data = getData();
  const user = data.users.find(i => i.authUserId === authUserId);
  const dm = data.dms.find(i => i.dmId === dmId);

  if (!user) {
    throw HttpError(403, 'authUserId is invalid');
  } else if (!dm) {
    throw HttpError(400, 'dmId is invalid');
  } else if (dm.messages.length < start) {
    throw HttpError(400, 'start is greater than the total number of messages in the channel');
  } else if (dm.allMembers.find((i: number) => i === authUserId) === undefined) {
    throw HttpError(403, 'authUserId is not a member of the DM with ID DmId');
  }

  /// may need to reverse order of msgs in result
  const result = {
    messages: [] as object[],
    start: start,
    end: start + 50 < dm.messages.length ? start + 50 : -1,
  };
  for (let i = 0; i < dm.messages.length; i++) {
    if (i < 50) {
      let isThisUserReacted = false;
      if (dm.messages[i].reacts.uids.includes(authUserId)) {
        isThisUserReacted = true;
      }
      result.messages.push({
        messageId: dm.messages[i].messageId,
        uId: dm.messages[i].senderId,
        message: dm.messages[i].message,
        timeSent: dm.messages[i].timeSent,
        reacts: [{
          reactId: 1,
          uIds: dm.messages[i].reacts.uids,
          isThisUserReacted: isThisUserReacted
        }],
        isPinned: dm.messages[i].isPinned
      });
    }
  }

  return result;
}

export function messageSendV1(authUserId: number, channelId: number, dmId: number, message: string) {
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
    throw HttpError(403, 'authUserId is invalid');
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
      isPinned: false,
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
      isPinned: false,
    });
  }

  setData(data);
  return { messageId: Id };
}

export function messageDeleteV1(token: string, messageId: number) {
  const data = getData();
  const authUserId = tokenVerify(token) as number;
  const user = data.users.find(i => i.authUserId === authUserId);
  if (!user) {
    throw HttpError(403, 'authUserId is invalid');
  }

  const channelmsg = data.channels.find(i => i.messages.find(j => j.messageId === messageId) !== undefined);
  const DMmsg = data.dms.find(i => i.messages.find(j => j.messageId === messageId) !== undefined);
  if (!channelmsg && !DMmsg) {
    throw HttpError(400, 'messageId is invalid');
  }

  if (channelmsg.messages.find(i => i.messageId === messageId).senderId !== authUserId) {
    throw HttpError(403, 'authUserId is not the sender of the message with ID messageId');
  }

  if (!channelmsg) {
    DMmsg.messages = DMmsg.messages.filter(i => i.messageId !== messageId);
  } else if (!DMmsg) {
    channelmsg.messages = channelmsg.messages.filter(i => i.messageId !== messageId);
  }
  setData(data);
  return {};
}

export function messageEditV1(token: string, messageId: number, message: string) {
  const data = getData();
  const authUserId = tokenVerify(token) as number;
  const user = data.users.find(i => i.authUserId === authUserId);
  if (!user) {
    throw HttpError(403, 'authUserId is invalid');
  } else if (message.length > 1000) {
    throw HttpError(400, 'message length is greater than 1000 characters');
  }

  const channelmsg = data.channels.find(i => i.messages.find(j => j.messageId === messageId));
  const DMmsg = data.dms.find(i => i.messages.find(j => j.messageId === messageId));

  if (!channelmsg && !DMmsg) {
    throw HttpError(400, 'messageId is invalid');
  }

  if (message.length === 0) {
    messageDeleteV1(token, messageId);
    return { message: '' };
  } else {
    let response;
    if (!channelmsg) {
      response = DMmsg.messages.find(i => i.messageId === messageId);
      if (response.senderId !== authUserId) {
        throw HttpError(403, 'authUserId is not the sender of the message with ID messageId');
      }
      response.message = message;

      setData(data);
      return {};
    } else if (!DMmsg) {
      response = channelmsg.messages.find(i => i.messageId === messageId);
      if (response.senderId !== authUserId) {
        throw HttpError(403, 'authUserId is not the sender of the message with ID messageId');
      }
      response.message = message;

      setData(data);
      return {};
    }
  }
}

export function channelInviteV1(authUserId: number, channelId: number, uId: number) {
  /// Determining whether authUserId is valid
  const data = getData();
  const user = data.users.find(i => i.authUserId === authUserId);
  const channel = data.channels.find(i => i.channelId === channelId);
  const guest = data.users.find(i => i.authUserId === uId);

  if (!user) {
    throw HttpError(403, 'authUserId is invalid');
  } else if (!channel) {
    throw HttpError(400, 'channelId is invalid');
  } else if (!guest) {
    throw HttpError(400, 'uId is invalid');
  }

  let check = false;
  for (let i = 0; i < data.channels.length; i++) {
    for (let j = 0; j < data.channels[i].allMembers.length; j++) {
      if (data.channels[i].channelId === channelId) {
        if (data.channels[i].allMembers[j] === uId) {
          check = true;
        }
      }
    }
  }

  if (check === true) {
    throw HttpError(400, 'User is already a member of channel');
  }

  check = false;
  for (let i = 0; i < data.channels.length; i++) {
    for (let j = 0; j < data.channels[i].allMembers.length; j++) {
      if (data.channels[i].channelId === channelId) {
        if (data.channels[i].allMembers[j] === authUserId) {
          check = true;
        }
      }
    }
  }

  if (check === false) {
    throw HttpError(403, 'authUser is NOT a member of channel');
  }

  for (let i = 0; i < data.channels.length; i++) {
    if (data.channels[i].channelId === channelId) {
      data.channels[i].allMembers.push(uId);
    }
  }
  return {};
}

export function channelJoinV1(token: string, channelId: number) {
  const data = getData();
  // check if authUserId is valid
  const authUserId = tokenVerify(token) as number;
  const user = data.users.find(i => i.authUserId === authUserId);
  if (!user) {
    throw HttpError(403, 'authUserId is invalid');
  }

  // check if channelId refers to a valid channel
  const channel = data.channels.find(i => i.channelId === channelId);
  if (!channel) {
    throw HttpError(400, 'channelId is invalid');
  }

  // check if user is already a member of a channel
  let check = false;
  for (let i = 0; i < data.channels.length; i++) {
    for (let j = 0; j < data.channels[i].allMembers.length; j++) {
      if (data.channels[i].channelId === channelId) {
        if (data.channels[i].allMembers[j] === authUserId) {
          check = true;
        }
      }
    }
  }

  if (check === true) {
    throw HttpError(400, 'User is already a member of channel');
  }

  // check if channel is private
  if (channel.isPublic !== true) {
    throw HttpError(403, 'Channel is private');
  }

  channel.allMembers.push(authUserId);
  setData(data);
  return {};
}

// IT2 channel leave implementation:
export function channelLeaveV1(token: string, channelId: number) {
  const data = getData();
  const authUserId = tokenVerify(token) as number;
  const findChannelId = data.channels.find(i => i.channelId === channelId);
  // console.log(findChannelId)
  // const isChannelMember = findChannelId.allMembers.includes(authUserId);
  const findUser = data.users.find(i => i.authUserId === authUserId);

  if (!findChannelId) {
    throw HttpError(400, 'channelId is not part of a valid channel');
  }

  if (!findUser) {
    throw HttpError(403, 'authUserId is not part of a valid user');
  }

  // checks if user is not a  member of channel:
  if (!findChannelId.allMembers.includes(authUserId)) {
    throw HttpError(403, 'channelId is valid, but the user is not a member of the channel');
  }

  // leave the channel based on authUserId
  findChannelId.allMembers = findChannelId.allMembers.filter((i) => i !== authUserId);

  setData(data);
  return {};
}

export function channelAddOwnerV1(token: string, channelId: number, uId: number) {
  const data = getData();
  const authUserId = tokenVerify(token) as number;
  const findChannelId = data.channels.find(i => i.channelId === channelId);
  const findUser = data.users.find(i => i.authUserId === uId);
  if (!findUser) {
    throw HttpError(403, 'uId is not part of a valid user');
  }

  if (typeof authUserId !== 'number') {
    throw HttpError(403, 'token is invalid');
  }

  if (!findChannelId) {
    throw HttpError(400, 'channelId is not part of a valid channel');
  }

  // checks if user is not a member of channel:
  if (!findChannelId.allMembers.includes(uId)) {
    throw HttpError(400, 'user is not a member of the channel');
  }

  // checks if user is already an owner of channel:
  if (findChannelId.ownerMembers.includes(uId)) {
    throw HttpError(400, 'user is already an owner of the channel');
  }

  // checks if authUserId is an owner of channel:
  if (!findChannelId.ownerMembers.includes(authUserId)) {
    throw HttpError(403, 'channelId is valid, but user is not an owner of the channel');
  }

  findChannelId.ownerMembers.push(uId);
  setData(data);

  return {};
}

export function channelRemoveOwnerV1(token: string, channelId: number, uId: number) {
  const data = getData();
  const authUserId = tokenVerify(token) as number;
  const findChannelId = data.channels.find((i) => i.channelId === channelId);
  const findUser = data.users.find((i) => i.authUserId === uId);
  if (!findUser) {
    throw HttpError(403, 'uId is not part of a valid user');
  }

  if (typeof authUserId !== 'number') {
    throw HttpError(403, 'token is invalid');
  }

  if (!findChannelId) {
    throw HttpError(400, 'channelId is not part of a valid channel');
  }

  // checks if user is not a member of channel:
  if (!findChannelId.allMembers.includes(uId)) {
    throw HttpError(400, 'user is not a member of the channel');
  }

  // checks if user is not an owner of channel:
  if (!findChannelId.ownerMembers.includes(authUserId)) {
    throw HttpError(403, 'channelId is valid, but user is not an owner of the channel');
  }

  findChannelId.ownerMembers.splice(uId);
  setData(data);

  return {};
}
