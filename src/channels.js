

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

function channelsCreatev1(authUserId, name, isPublic) {
    return {
        channelId: 1
    }

}

function channelsListV1(authUserId) {
    return {
        channels: [
            {
                channelId: 1,
                name: "stub Channel",
            }
        ],
    }
}
    




