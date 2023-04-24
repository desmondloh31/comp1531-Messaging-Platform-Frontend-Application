import { getData, setData } from './dataStore';
import { tokenVerify } from './token';

import HttpError from 'http-errors';
/**
 * @module channels
 */

/**
 *
 * @param {integer} authUserId - user id explantation
 *
 * @returns {object} channels - channels explanation
 */

// parameters and returrn
export function channelsListAllV1(token: string) {
  const data = getData();
  const authUser = tokenVerify(token);
  const user = data.users.find((i: any) => i.authUserId === authUser);
  if (!user) {
    throw HttpError(400, 'authUserId is invalid');
  } else {
    const channels = [];
    for (let i = 0; i < data.channels.length; i++) {
      for (let j = 0; j < data.channels[i].allMembers.length; j++) {
        channels.push({ channelId: data.channels[i].channelId, name: data.channels[i].name });
      }
    }
    console.log({ channels: channels });
    return { channels: channels };
  }
}

// creating the channel from the uuid and authUserId
export function channelsCreateV1(token: string, name: string, isPublic: boolean) {
  const data = getData();

  const authUserId = tokenVerify(token) as number;
  // check if authUserId is valid:

  const authUser = data.users.find(i => i.authUserId === authUserId);
  if (!authUser) {
    throw HttpError(400, 'authUserId is invalid');
  }

  // check if name is valid:
  if (name.length < 1 || name.length > 20) {
    // error 400:
    throw HttpError(400, 'channelId is invalid');
  }

  const Id = data.channels.length;

  // add a new channel to the data store:
  data.channels.push({
    channelId: Id,
    name: name,
    isPublic: isPublic,
    ownerMembers: [authUserId],
    allMembers: [authUserId],
    messages: [],
    standupActive: false,
  });
  setData(data);

  return { channelId: Id };
}

// Listing the given channels:
export function channelsListV1(token: string) {
  const data = getData();
  const authUserId = tokenVerify(token);

  // check if authUserId is valid:
  const authUser = data.users.find(i => i.authUserId === authUserId);
  if (!authUser) {
    throw HttpError(400, 'authUserId is invalid');
  }

  const channel = [];
  for (let i = 0; i < data.channels.length; i++) {
    for (let j = 0; j < data.channels[i].allMembers.length; j++) {
      if (data.channels[i].allMembers[j] === authUserId) {
        channel.push({ channelId: data.channels[i].channelId, name: data.channels[i].name });
      }
    }
  }

  console.log({ channels: channel });

  return { channels: channel };
}
