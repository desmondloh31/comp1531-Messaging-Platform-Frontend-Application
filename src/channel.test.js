import {channelsCreateV1} from ',/channels';
import {authRegisterV1} from './auth'; 
import {channelDetailsV1, channelMessagesV1, channelInviteV1,channelJoinV1} from './channel';
import {getData, setData} from './dataStore';
import {fromString} from 'uuid4';

describe ("Testing channelJoinV1", () => {
    const authUserId = authRegisterV1('lebron@gmail.com', '123456789','Lebron','James');
    const authUserId2 = authRegisterV1('John@gmail.com', '123456789','John','Smith');
    //const authUserId3 = authRegisterV1('Kanye@hotmail.com', '123456789', 'Kanye', 'West' );
    const channel1 = channelsCreateV1(authUserId, 'firstChannel', true);

    beforeEach (() => {
        const data = {
            users: { [authUserId]: {} },
            channels: { [channel1.channelId]: channel1 },
            
        };
        setData(data);
    })

    //test with valid parameters if authorised user is added to channel
    test ('checks authorised user can join channel', () => {
        channelJoinV1(authUserId2, channel1);
        const data = getData();
        expect(data.channels).toEqual ({
            [channel1.channelId]: {
                channelId: channel1.channelId,
                name:'firstChannel',
                isPublic: true,
                ownerMembers: [authUserId, authUserId2],
                MemberIds: [authUserId, authUserId2],
            }
        }),
    })
    //test if channelId does not refer to a valid channel

    //test if authUserId is invalid
    test ('checks if authUserId is invalid', () => {
        const invalidAuthUser = fromString(wrongInput);
        channelJoinV1(invalidAuthUser, channel1);
        const data = getData();
        expect(data.channels).toEqual ({
            [channel1.channelId]: {
                channelId: channel1.channelId,
                name:'firstChannel',
                isPublic: true,
                ownerMembers: [authUserId],
                MemberIds: [authUserId],
            }
        })
    })

    //test if authorised user is already a member of the channel

})

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//testing channelDetails:
describe ("Testing channelDetails", () => {
    const authUserId = 'user123';
    const ownerMemberId = 'owner123'
    const channel1 = {
        channelId: 'channel1',
        name: 'channel1a',
        isPublic: true,
        allMembers: [authUserId],
        ownerMembers: [ownerMemberId],
    };

    const channel2 = {
        channelId: 'channel2',
        name: 'channel2a',
        isPublic: false,
        allMembers: ['otherUser'],
        ownerMembers: [ownerMemberId],
    };

    beforeEach (() => {
        const data = {
            users: { [authUserId]: {} },
            channels: { [channel1.channelId]: channel1, [channel2.channelId]: channel2},
            
        };
        setData(data);
    });
   
    test ('testing if authUserId is not valid', () => {
        const result = channelDetailsV1('asdas','channel1');
        expect(result).toEqual({error: "authUserId is invalid"});
    });
    test ('testing if authUserId is valid', () => {
        const result = channelDetailsV1(authUserId,'channel1');
        expect(result).toEqual(getData().channels.channel1);
    });
    test ('testing if channelId is valid', () => {
        const result = channelDetailsV1(authUserId,'channel1');
        expect(result).toEqual(getData().channels.channel1);
    });
    test ('testing if channelId is not valid', () => {
        const result = channelDetailsV1(authUserId,'invalidChannelName');
        expect(result).toEqual({error: 'User is not a part of the channel or Invalid channel Name'});
    });
    test ('authUser is not a part of the channel', () => {
        const result = channelDetailsV1(authUserId,'channel2');
        expect(result).toEqual({error: 'User is not a part of the channel or Invalid channel Name'});
    });
    test ('authUser is a part of the channel', () => {
        const result = channelDetailsV1(authUserId,'channel1');
        expect(result).toEqual(getData().channels.channel1);
    });

});
