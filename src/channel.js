import {getData, setData} from './dataStore';
import { channelsCreateV1 } from './channels.js';

export function channelDetailsV1(authUserId, channelId){
  
  //Determining whether authUserId is valid
  const data = getData();
  const user = data.users[authUserId];
  if (!user) {
    return { error: "authUserId is invalid"}; 
  }


  //Determine whether the channelId is valid & user is a part of the channel
  for (const currentChannel in data.channels) {
    const channel = data.channels[currentChannel];
    if(channel.channelId == channelId && (channel.ownerMembers.includes(authUserId)||channel.allMembers.includes(authUserId))){
      return  channel; 
    }
  }
    return{error: 'User is not a part of the channel or invalid channelId'}

}

export function channelMessagesV1( authUserId, channelId, start ) {
  const data = getData();
  const user = data.users.find(i => i.authUserId == authUserId);
  const channel = data.channels.find(i => i.channelId == channelId);


  if (!user) {
    return { error: "authUserId is invalid"};
  }else if (!channel) {
    return { error: "channelId is invalid"};
  }else if (channel.messages.length < start ) { 
    return { error: "start is greater than the total number of messages in the channel"};
  }else if (channel.allMembers.find(i => i == authUserId) == undefined) {
    return { error: "authUserId is not a member of the channel with ID channelId"};
  }



  let result = {
    messages: [],
    start: start,
    end: start+50<channel.messages.length?start+50:-1,
  }
  for (let i = 0; i < channel.messages.length; i++) {
    if (i < 50) {
      result.messages.push(channel.messages[i]);
    }
  }

  return result;
}


export function channelInviteV1( authUserId, channelId, uId ) {
  ///Determining whether authUserId is valid
  const data = getData();
  const user = data.users.find(i => i.authUserId == authUserId);
  const channel = data.channels.find(i => i.channelId == channelId);
  const guest = data.users.find(i => i.authUserId == uId);


  if (!user) {
    return { error: "authUserId is invalid"}; 
  }else if(!channel){
    return { error: "channelId is invalid"};
  }else if(!guest) {
    return { error: "uId is invalid"};
  }

  let check = false;
  for (let i = 0; i < data.channels.length; i++) {
    for (let j = 0; j < data.channels[i].allMembers.length; j++) {
      if (data.channels[i].channelId == channelId) {
        if (data.channels[i].allMembers[j] == uId) {
          check = true;
        }
      }
    }
  }

  if (check == true) {
    return { error: "User is already a member of channel"}
  };

  check = false;
  for (let i = 0; i < data.channels.length; i++) {
    for (let j = 0; j < data.channels[i].allMembers.length; j++) {
      if (data.channels[i].channelId == channelId) {
        if (data.channels[i].allMembers[j] == authUserId) {
          check = true;
        }
      }
    }
  }

  if (check == false) {
    return { error: "authUser is NOT a member of channel"}
  };

  for (let i = 0; i < data.channels.length; i++) {
    if (data.channels[i].channelId == channelId) {
      data.channels[i].allMembers.push(uId);
    }
  }
  return {};
}


export function channelJoinV1(authUserId, channelId){
  const data = getData();
  //check if authUserId is valid
  
  const user = data.users.find(i => i.authUserId == authUserId);
  if (!user) {
    return { error: "authUserId is invalid"}; 
  }

  //check if channelId refers to a valid channel
  const channel = data.channels.find(i => i.channelId == channelId); 
  if(!channel){
    return { error: "channelId is invalid"};
  }

  //check if user is already a member of a channel
  let check = false;
  for (let i = 0; i < data.channels.length; i++) {
    for (let j = 0; j < data.channels[i].allMembers.length; j++) {
      if (data.channels[i].channelId == channelId) {
        if (data.channels[i].allMembers[j] == authUserId) {
          check = true;
        }
      }
    }
  }

  if (check == true) {
    return { error: "User is already a member of channel"}
  };

  //check if channel is private
  if (channel.isPublic != true) {
    return { error: "Channel is private" }
  };


  channel.allMembers.push(authUserId);
  return {};
}

