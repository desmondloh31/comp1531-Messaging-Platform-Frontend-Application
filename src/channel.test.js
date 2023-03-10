<<<<<<< HEAD
import {channelJoinV1} from './channel';
import {channelsCreateV1} from ',/channels';
import {authRegisterV1, authLoginV1} from './auth'; 
import {getData, setData} from './dataStore';

describe ("Testing channelJoinV1", () => {
    const authRegisterId1 = authRegisterV1('lebron@gmail.com', '123456789','Lebron','James');
    const authRegisterId2 = authRegisterV1('John@gmail.com', '123456789','John','Smith');
    const channel1 = channelsCreateV1(authRegisterId1, 'firstChannel', true);

    afterEach(() => {
        setData({ users: {}, channels: {} });
    });

    //test with valid parameters if authorised user is added to channel
    test ('checks authorised user can join channel', () => {
        channelJoinV1(authRegisterId2, channel1);
        const data = getData();
        expect(data.channels).toEqual ({
            [channel1.channelId]: {
                channelId: channel1.channelId,
                name:'firstChannel',
                isPublic: true,
                OwnerIds: [authRegisterId1, authRegisterId2],
                MemberIds: [authRegisterId1, authRegisterId2],
                messages,
            }
        }),

    //test if channelId does not refer to a valid channel

    //test if authUserId is invalid

    //test if authorised user is already a member of the channel

    //
    })

});





=======
import {channelDetailsV1, channelMessagesV1, channelInviteV1,channelJoinV1} from './channel.js';
import {getData, setData } from './dataStore.js';

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
>>>>>>> 19e7ea0fdbcf9277a8818a142dd4115d35160f7a
