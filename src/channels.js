
/**
 * @module channels
 */

/**
 * 
 * @param {integer} authUserId - user id explantation
 * 
 * @returns {object} channels - 
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
function channelInviteV1( authUserId, channelId, uId ) {
    return {};
}
function channelsCreatev1(authUserId, name, isPublic) {
    return {
        channelId: 1
    }

}