
import {getData, setData} from './dataStore.js';

export function channelDetailsV1(authUserId, channelId){
  
  //Determining whether authUserId is valid
  const data = getData();
  const user = data.users[authUserId];
  if (!user) {
    return { error: "authUserId is invalid"}; 
  }

  

 
  //Determine whether the channelId is valid & user is a part of the channel
  for (const currentChannelId in data.channels) {
    const channel = data.channels[currentChannelId];
    if(currentChannelId == channelId && (channel.ownerMembers.includes(authUserId)||channel.allMembers.includes(authUserId))){
      return  channel; 
    }
  }
  return{error: 'User is not a part of the channel or Invalid channel Name'}
 
}

function channelMessagesV1( authUserId, channelId, start ) {
    return {
        messages: [
            {
              messageId: 1,
              uId: 1,
              message: 'Hello world',
              timeSent: 1582426789,
            }
          ],
          start: 0,
          end: 50,
    };
}


function channelInviteV1( authUserId, channelId, uId ) {
    return {};
}


function channelJoinV1(authUserId, channelId){
    return{};
}
