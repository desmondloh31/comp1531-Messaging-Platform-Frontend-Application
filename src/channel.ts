import {getData, setData} from './dataStore';
import { channelsCreateV1 } from './channels.js';
import { tokenCreate, tokenVerify, tokenDelete } from './token';

export function channelDetailsV1(authUserId: number, channelId: number){
  
  //Determining whether authUserId is valid
  const data = getData();
  const user = data.users.find(i => i.authUserId === authUserId);
  if (!user) {
    return { error: "authUserId is invalid"}; 
  }


  //Determine whether the channelId is valid & user is a part of the channel
  for (const currentChannel in data.channels) {
    const channel = data.channels[currentChannel];
    if(channel.channelId === channelId && (channel.ownerMembers.includes(authUserId)||channel.allMembers.includes(authUserId))){
      return  {name: channel.name, isPublic: channel.isPublic, ownerMembers: channel.ownerMembers, allMembers: channel.allMembers};
    }
  }
    return{error: 'User is not a part of the channel or invalid channelId'}

}

export function channelMessagesV1(authUserId: number, channelId: number, start: number ) {
  const data = getData();
  const user = data.users.find(i => i.authUserId === authUserId);
  const channel = data.channels.find(i => i.channelId === channelId);


  if (!user) {
    return { error: "authUserId is invalid"};
  }else if (!channel) {
    return { error: "channelId is invalid"};
  }else if (channel.messages.length < start ) { 
    return { error: "start is greater than the total number of messages in the channel"};
  }else if (channel.allMembers.find((i: number) => i === authUserId) === undefined) {
    return { error: "authUserId is not a member of the channel with ID channelId"};
  }


  let result = {
    messages: [] as object[],
    start: start,
    end: start+50<channel.messages.length?start+50:-1,
  }
  for (let i = 0; i < channel.messages.length; i++) {
    if (i < 50) {
      result.messages.push({messageId: channel.messages[i].messageId, uId:channel.messages[i].senderId, message: channel.messages[i].message, timeSent: channel.messages[i].timeSent});
    }
  }

  return result;
}


export function channelInviteV1(authUserId: number, channelId: number, uId: number) {
  ///Determining whether authUserId is valid
  const data = getData();
  const user = data.users.find(i => i.authUserId === authUserId);
  const channel = data.channels.find(i => i.channelId === channelId);
  const guest = data.users.find(i => i.authUserId === uId);


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
      if (data.channels[i].channelId === channelId) {
        if (data.channels[i].allMembers[j] === uId) {
          check = true;
        }
      }
    }
  }

  if (check === true) {
    return { error: "User is already a member of channel"}
  };

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
    return { error: "authUser is NOT a member of channel"}
  };

  for (let i = 0; i < data.channels.length; i++) {
    if (data.channels[i].channelId === channelId) {
      data.channels[i].allMembers.push(uId);
    }
  }
  return {};
}


export function channelJoinV1(authUserId: number, channelId: number){
  const data = getData();
  //check if authUserId is valid
  
  const user = data.users.find(i => i.authUserId === authUserId);
  if (!user) {
    return { error: "authUserId is invalid"}; 
  }

  //check if channelId refers to a valid channel
  const channel = data.channels.find(i => i.channelId === channelId); 
  if(!channel){
    return { error: "channelId is invalid"};
  }

  //check if user is already a member of a channel
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
    return { error: "User is already a member of channel"}
  };

  //check if channel is private
  if (channel.isPublic != true) {
    return { error: "Channel is private" }
  };


  channel.allMembers.push(authUserId);
  return {};
}



//IT2 channel leave implementation:
export function channelLeaveV1(token: number, channelId: number) {

  const data = getData();
  const authUserId = tokenVerify(token);

  const findChannelId = data.channels.find((i) => i.channelId === channelId);
  const isChannelMember = findChannelId.allMembers.includes(authUserId);

  if (!findChannelId) {
    return { error: "channelId is not part of a valid channel"}
  }

  if (!isChannelMember) {
    return { error: "channelId is valid, but the user is not a member of the channel"}
  }

  if (!authUserId) {
    return { error: "token is invalid"};
  }

  const findUser = data.users.find((i) => i.authUserId === authUserId);
  const findUserIndex = findUser.token.indexOf(token);

  //leave the channel and by removing the token from channel:
  findUser.token.splice(findUserIndex, 1);
  findChannelId.allMembers.splice(findChannelId.allMembers.indexOf(authUserId));

  setData(data);
  return {};
  
}

export function channelAddOwnerV1(token: number, channelId: number, uId: number) {

  const data = getData();
  const authUserId = tokenVerify(token);
  const findChannelId = data.channels.find((i) => i.channelId === channelId);
  const findUser = data.users.find((i) => i.authUserId === uId);

  const allMembersId = findChannelId.allMembers.includes(uId);

  if (typeof authUserId === 'object') {
    return {error: authUserId.error}
  }

  if (!findUser) {
    return { error: "user is not valid"}
  }

  if (!authUserId) {
    return { error: "token is invalid"};
  }

  if (!findChannelId) {
    return { error: "channelId is not part of a valid channel"}
  }

  if (!allMembersId) {
    return { error: "user is not a member of the channel"}
  }

  if (findChannelId.ownerMembers.includes(uId)) {
    return { error: "user is already an owner of the channel"}
  }

  if (!findChannelId.ownerMembers.includes(authUserId)) {
    return { error: "channelId is valid, but user is not an owner of the channel"}
  }


  findChannelId.ownerMembers.push(uId);
  setData(data);

  return {};

}

export function channelRemoveOwner(token: number, channelId: number, uId: number) {

  const data = getData();
  const authUserId = tokenVerify(token);
  const findChannelId = data.channels.find((i) => i.channelId === channelId);
  const findUser = data.users.find((i) => i.authUserId === uId);

  const allMembersId = findChannelId.allMembers.includes(uId);

  if (typeof authUserId === 'object') {
    return {error: authUserId.error}
  }

  if (!findUser) {
    return { error: "user is not valid"}
  }

  if (!authUserId) {
    return { error: "token is invalid"};
  }

  if (!findChannelId) {
    return { error: "channelId is not part of a valid channel"}
  }

  if (!allMembersId) {
    return { error: "user is not a member of the channel"}
  }

  if (!findChannelId.ownerMembers.includes(uId)) {
    return { error: "user is not an owner of channel"}
  }

  if (!findChannelId.ownerMembers.includes(authUserId)) {
    return { error: "channelId is valid, but user is not an owner of the channel"}
  }

  

  const userIndexId = findChannelId.ownerMembers.indexOf(uId);
  findChannelId.ownerMembers.splice(userIndexId, 1);
  setData(data);

  return {};
  
}