
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
    