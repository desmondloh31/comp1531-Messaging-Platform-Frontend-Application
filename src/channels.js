
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
export function channelsCreateV1(authUser, name, isPublic) {

  const data = getData();
  //check if authUserId is valid:
  let check = false;
  for (let i = 0; i < data.users.length; i++) {
    if (data.users[i].authUserId == authUser) {
      check = true;
  
    }
  }

  if (check == false) {
    return { error: "authUserId is invalid"};
  }

  //check if name is valid:
  if (name.length < 1 || name.length > 20) {
    return { error: "length of name is less than 1 or more than 20 characters"};
  }

  let Id = data.channels.length;
 
  //add a new channel to the data store:
  data.channels.push({
    channelId: Id,
    name: name,
    isPublic: isPublic,
    ownerMembers: [authUser],
    allMembers: [authUser],
    messages: [],
  });
  setData(data);

  return{

      channelId: Id,
      name: name,
      isPublic: isPublic,
      ownerMembers: [authUser],
      allMembers: [authUser],
      messages: [],
    
  };


}

//Listing the given channels:
export function channelsListV1(authUser) {

  const data = getData();
  let check = false;


  //check if authUserId is valid:
  for (let i = 0; i < data.users.length; i++) {
    if (data.users[i].authUserId == authUser) {
      check = true;
  
    }
  }

  if (check == false) {
    return { error: "authUserId is invalid"};
  }

  check = false;
  const channels = [];
  for (let i = 0; i < data.channels.length; i++) {
    for (let j = 0; j < data.channels[i].allMembers.length; j++) {
      if (data.channels[i].allMembers[j] == authUser) {
        check = true;
        channels.push(data.channels[i]);
      }
    }
  }

  return channels;
}

    





