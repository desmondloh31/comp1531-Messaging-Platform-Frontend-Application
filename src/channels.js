
import {authRegisterV1, authLoginV1} from './auth'
import {getData, setData} from './dataStore';
//import { uuid } from 'uuidv4';

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

  //check if authUserId is valid:
  const user = data.users[authUserId];
  if (!user) {
    return { error: "authUserId is invalid"};
  }

  //check if name is valid:
  if (name.length < 1 || name.length > 20) {
    return { error: "length of name is less than 1 or more than 20 characters"};
  }

  //create a new channel object:
  const newChannel = {
    channelId: uuid(),
    name: name,
    isPublic: isPublic,
    members: [authUserId],
  };

  //add a new channel to the data store:
  data.channels[newChannel.channelId] = newChannel;
  setData(data);

  return {
    channelId: newChannel.channelId,
    name: newChannel.name,
    isPublic: newChannel.isPublic,
    members: newChannel.members,
  };


}

//Listing the given channels:
function channelsListV1(authUserId) {

  const data = getData();

  //check if authUserId is valid:
  const user = data.users[authUserId];
  if (!user) {
    return { error: "authUserId is invalid"};
  }

  //get array of channels that the user is a member of:
  const channels = [];
  for (const channelId in data.channels) {
    const channel = data.channels[channelId];
    if (channel.members.includes(authUserId)) {
      channels.push(channel);
    }
  }
  
  return { channels: channels};
      
}
    





