import {channelDetailsV1, channelMessagesV1, channelInviteV1,channelJoinV1} from './channel.js';
import {getData, setData } from './dataStore.js';
import { clearV1 } from "./clearV1";
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

//testing channelMessages:



const ERROR = { error: expect.any(String) };

describe('Error Checking in channel messages v1', () => {
    beforeEach (() => {
        clearV1();
        authRegisterV1("test@gmail.com", "test1234", "test", "test");
        channelsCreateV1(0, "test", true);
    });

    test('invalid authuser id', () => {
        let userid = -1;
        let channelid = 0;
        const result = channelMessagesV1(userid, channelid, 0);
        expect(result).toStrictEqual(ERROR);
    });

    test('invalid channel id', () => {
        let userid = 0;
        let channelid = -1;
        const result = channelMessagesV1(userid, channelid, 0);
        expect(result).toStrictEqual(ERROR);
    });

    test('invalid start', () => {
        let userid = 0;
        let channelid = 0;
        const result = channelMessagesV1(userid, channelid, 1);
        expect(result).toStrictEqual(ERROR);    
    });

    test('Authuser not part of channel', () => {
        let userid = 1;
        let channelid = 0;
        const result = channelMessagesV1(userid, channelid, 0);
        expect(result).toStrictEqual(ERROR);
    });

    test('Valid Test', () => {
        let userid = 0;
        let channelid = 0;
        const result = channelMessagesV1(userid, channelid, 0);
        expect(result).toStrictEqual({messages: [],start: 0, end: -1});
    });

});




describe('Error Checking in channel invite v1', () => {
    beforeEach (() => {
        clearV1();
        authRegister("test@gmail.com", "test", "test", "test");
        authRegister("test1@gmail.com", "test1", "test1", "test1");
        authRegister("test2@gmail.com", "test2", "test2", "test2");
        authRegister("test3@gmail.com", "test3", "test3", "test3");
        channelsCreateV1(0, "test", true);
        channelJoinV1(1, 0);
    });

    test('invalid channel id', () => {
        let userid = 0;
        let channelid = -1;
        let uid = 2;
        const result = channelInviteV1(userid, channelid, uid);
        expect(result).toStrictEqual(ERROR);
    });

    test('uid already member of channel', () => {
        let userid = 0;
        let channelid = 0;
        let uid = 1;
        const result = channelInviteV1(userid, channelid, uid);
        expect(result).toStrictEqual(ERROR);
    });

    test('invalid uid', () => {
        let userid = 0;
        let channelid = 0;
        let uid = -1;
        const result = channelInviteV1(userid, channelid, uid);
        expect(result).toStrictEqual(ERROR); 
    });

    test('Authuser not part of channel', () => {
        let userid = 2;
        let channelid = 0;
        let uid = 3;
        const result = channelInviteV1(userid, channelid, uid);
        expect(result).toStrictEqual(ERROR);
    });

    test('authuser is invalid', () => {
        let userid = 0;
        let channelid = 0;
        let uid = -1;
        const result = channelInviteV1(userid, channelid, uid);
        expect(result).toStrictEqual(ERROR);
    });

    test('valid test', () => {
        let userid = 0;
        let channelid = 0;
        let uid = 2;
        const result = channelInviteV1(userid, channelid, uid);
        expect(result).toStrictEqual({});
    });

});