
import {authRegisterV1, authLoginV1} from './auth'
import {getData, setData} from './dataStore';
import { fromString} from 'uuidv4';

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
export function channelsListAllV1(authUserId) {
  const data = getData();
  const user = data.users[authUserId];
  if (!user) {
    return { error: "authUserId is invalid"}; 
  }
  else{
    //setData(data.channels)

    return data.channels
  }

}

//creating the channel from the uuid and authUserId
export function channelsCreateV1(authUserId, name, isPublic) {

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
    channelId: fromString(authUserId + name),
    name: name,
    isPublic: isPublic,
    ownerMembers: [authUserId],
    allMembers: [authUserId],
  };

  //add a new channel to the data store:
  data.channels[newChannel.channelId] = newChannel;
  setData(data);

  return {
    /*channelId: newChannel.channelId,
    name: newChannel.name,
    isPublic: newChannel.isPublic,
    ownerMembers: newChannel.ownerMembers,    
    allMembers: newChannel.allMembers,*/
    newChannel,
  };



}

//Listing the given channels:
export function channelsListV1(authUserId) {

  const data = getData();

  //check if authUserId is valid:
  const user = data.users[authUserId];
  if (!user) {
    return { error: "authUserId is invalid "};
  }

  //get array of channels that the user is a member of:
  const channels = [];
  for (const channelId in data.channels) {
    const channel = data.channels[channelId];
    if (channel.allMembers.includes(authUserId) || channel.ownerMembers.includes(authUserId)) {
      channels.push(channel);
    }
  }
  
  return { channels: channels};
      
}
    





