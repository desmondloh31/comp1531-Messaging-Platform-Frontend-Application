import {getData, setData} from './dataStore';
import {authRegisterV1, authLoginV1} from './auth.js'

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
export function channelsListAllV1(authUserId: number) {
  const data = getData();
  const user = data.users.find(i => i.authUserId == authUserId);
  if (!user) {
    return { error: "authUserId is invalid"}; 
  }
  else{
    
    const channels = [];
    for (let i = 0; i < data.channels.length; i++) {
      for (let j = 0; j < data.channels[i].allMembers.length; j++) {
          
        channels.push({channelId: data.channels[i].channelId, name: data.channels[i].name});
      }
    }
    return channels;
  }

}

//creating the channel from the uuid and authUserId
export function channelsCreateV1(authUser: number, name: string, isPublic: boolean) {

  const data = getData();
  //check if authUserId is valid:
  let check = false;
  for (let i = 0; i < data.users.length; i++) {
    if (data.users[i].authUserId === authUser) {
      check = true;
  
    }
  }

  if (check === false) {
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

  return {channelId: Id};


}

//Listing the given channels:
export function channelsListV1(authUser: number) {

  const data = getData();
  let check = false;


  //check if authUserId is valid:
  for (let i = 0; i < data.users.length; i++) {
    if (data.users[i].authUserId === authUser) {
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
      if (data.channels[i].allMembers[j] === authUser) {
        check = true;
        channels.push({channelId: data.channels[i].channelId, name: data.channels[i].name});
        
      }
    }
  }

  return {channels};
    
}

    





