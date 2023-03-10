import {channelDetailsV1, channelMessagesV1, channelInviteV1,channelJoinV1} from './channel.js';
import {getData, setData } from './dataStore.js';
import { clearV1 } from './clearV1.js';
import { authRegisterV1 } from './auth.js';
import { channelsCreateV1 } from './channels.js';

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

describe ("Testing channelDetails Final Test batch", () => {
    beforeEach (() => {
        clearV1();
    });
    test ('testing if authUserId is not valid', () => {
        const result = channelDetailsV1('asdas','channel1');
        expect(result).toEqual({error: "authUserId is invalid"});
    });
    test ('testing if authUserId is valid', () => {
        const userID = authRegisterV1("example@gmail.com", "abc123", "John", "Smith");
        const channel1 = channelsCreateV1(userID,'channel1', false);
        const result = channelDetailsV1(userID,'channel1');
        expect(result).toEqual(channel1);
    });
});