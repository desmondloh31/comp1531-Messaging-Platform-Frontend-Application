import { getData, setData } from './dataStore';
import { tokenVerify } from './token';
import HttpError from 'http-errors';

// sees if the standup is currently active
function standupActiveV1(token: string, channelId: number) {
  const data = getData();
  const authUserId = tokenVerify(token) as number;
  const findUser = data.users.find(i => i.authUserId === authUserId);
  const findChannelId = data.channels.find((i) => i.channelId === channelId);

  if (!findUser) {
    throw HttpError(400);
  }
  if (!findChannelId) {
    // raise error 400 in HTTP: Bad Request
    throw HttpError(400, 'channelId is invalid');
  }
  if (!findChannelId.allMembers.includes(authUserId)) {
    // raise error 403 in HTTP: Forbidden
    throw HttpError(403, 'user is not a member of the channel');
  }

  const isActive = findChannelId.standupActive;
  const timeFinish = findChannelId.standupTimeFinish || null;

  return { isActive, timeFinish };
}

// start a standup with a timer:
function standupStartV1(token: string, channelId: number, length: number) {
  const data = getData();
  const authUserId = tokenVerify(token) as number;
  const findUser = data.users.find(i => i.authUserId === authUserId);
  const findChannelId = data.channels.find((i) => i.channelId === channelId);

  if (!findUser) {
    throw HttpError(400);
  }
  if (!findChannelId) {
    // raise error 400: Bad request
    throw HttpError(400, 'ChannelId is invalid');
  }
  if (!findChannelId.allMembers.includes(authUserId)) {
    // raise error 403: Forbidden
    throw HttpError(403, 'user is not a member of the channel');
  }
  if (findChannelId.standupActive) {
    // raise error 400: Bad request
    throw HttpError(400, 'a standup is already active in this channel');
  }
  if (length < 0) {
    // raise error 400: Bad Request
    throw HttpError(400, 'length cannot be a negative integer');
  }

  findChannelId.standupActive = true;
  const timeFinish = Math.floor(Date.now() / 1000) + length;
  findChannelId.standupTimeFinish = timeFinish;

  setData(data);

  setTimeout(() => {
    const messages = findChannelId.standupBuffer || [];
    const packagedMessage = messages
      .map(m => `${data.users.find(u => u.authUserId === m.user)?.handleStr}: ${m.message}`)
      .join(' ');

    if (packagedMessage.length > 0) {
      const message = {
        messageId: data.msgcount + 1,
        senderId: authUserId,
        message: packagedMessage,
        timeSent: Math.floor(Date.now() / 1000),
        reacts: {
          reactId: 1,
          uids: [] as number[],
        },
        pinned: false,
      };
      findChannelId.messages.push(message);
      data.msgcount += 1;
      // setData(data);
    }
    findChannelId.standupActive = false;
    findChannelId.standupTimeFinish = undefined;
    findChannelId.standupBuffer = undefined;
    setData(data);
  }, length * 1000);

  setData(data);
  return { timeFinish };
}

// stores messages in a buffer and sends all messages after standup timer is over
function standupSendV1(token: string, channelId: number, message: string) {
  const data = getData();
  const authUserId = tokenVerify(token) as number;
  const findUser = data.users.find(i => i.authUserId === authUserId);
  const findChannelId = data.channels.find((i) => i.channelId === channelId);

  if (!findUser) {
    throw HttpError(400);
  }
  if (!findChannelId) {
    // raise error 400: Bad request
    throw HttpError(400, 'channelId is invalid');
  }
  if (!findChannelId.allMembers.includes(authUserId)) {
    // raise error 403: Forbidden
    throw HttpError(403, 'user is not a member of the channel');
  }
  if (!findChannelId.standupActive) {
    // raise error 400: Bad request
    throw HttpError(400, 'a standup is not currently running');
  }
  if (message.length > 1000) {
    // raise error 400: Bad Request
    throw HttpError(400, 'message length cannot be more than 1000 words');
  }

  const standupMessage = {
    user: authUserId,
    message: message,
    timestamp: Math.floor(Date.now() / 1000),
  };

  if (!findChannelId.standupBuffer) {
    findChannelId.standupBuffer = [standupMessage];
  } else {
    findChannelId.standupBuffer.push(standupMessage);
  }

  setData(data);
  return {};
}

// miscellaneous function: getting users 20 most recent notifications:
function getNotificationsV1(token: string) {
  const data = getData();
  const authUserId = tokenVerify(token);
  const user = data.users.find(u => u.authUserId === authUserId);

  if (!user) {
    throw HttpError(400);
  }

  const notifications = user.notifications
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 20);

  return { notifications };
}

// search/v1:
function searchV1(queryStr: string) {
  const data = getData();
  const messages = [];

  if (queryStr.length < 1 || queryStr.length > 1000) {
    throw HttpError(400, 'queryStr must be between 1 and 1000 characters in length');
  }

  for (const channel of data.channels) {
    for (const message of channel.messages) {
      if (message.message.toLowerCase().includes(queryStr.toLowerCase())) {
        messages.push(message);
      }
    }
  }

  for (const dm of data.dms) {
    for (const message of dm.messages) {
      if (message.message.toLowerCase().includes(queryStr.toLowerCase())) {
        messages.push(message);
      }
    }
  }

  return { messages };
}

export { standupActiveV1, standupSendV1, standupStartV1, getNotificationsV1, searchV1 };
