
import {authRegisterV1, authLoginV1} from './auth.js'
import {getData, setData} from './dataStore';
import { uuid } from 'uuidv4';

/**
 * @module channels
 */

/**
 * 
 * @param {integer} authUserId - user id explantation
 * 
 * @returns {object} channels - channels explanation 
 */

//parameters and returrn
function channelsListAllV1(authUserId) {
    return {
         channels: [
          {
            channelId: 1,
            name: 'My Channel',
          }
        ],
      }
}

//creating the channel from the uuid and authUserId
function channelsCreateV1(authUserId, name, isPublic) {

  const data = getData();
  if (name.length < 1 || name.length > 20) {
    return {error: "error"};
  }

  if (!data.users[authUserId]) {
    return {error: "error"};
  }

  const channelId = uuid();
  data.channels[channelId] = {
    name,
    isPublic,
    userIds: [authUserId]
  }

  setData(data);

  return {
    channelId
  }

}

//Listing the given channels:
function channelsListV1(authUserId) {

  const data = getData();
  if (!data.users[authUserId]) {
    return {error: "error"};
  }

  const channels = [];
  for (const channel of Object.values(data.channels)) {
    if (channel.userIds.includes(authUserId)) {
      channels.push ({
        channelId: channel.channelId,
        name: channel.name
      })
    }
  }

  return {
    channels
  }
      
}
    





