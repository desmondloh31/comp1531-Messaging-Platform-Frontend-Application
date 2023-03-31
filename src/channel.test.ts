import { channelDetailsV1, channelMessagesV1, channelInviteV1,channelJoinV1 } from './channel.js';
import { getData, setData } from './dataStore.js';
import { clearV1 } from "./other.js";
import { authRegisterV1 } from './auth.js';
import { channelsCreateV1 } from './channels.js';

//testing channelDetails:
describe ("Testing channelDetails Final Test batch", () => {
    test ('testing if authUserId is not valid', () => {
        const result = channelDetailsV1(-1,0);
        expect(result).toEqual({error: "authUserId is invalid"});
    });
    test ('testing if authUserId and channelId are valid', () => {
        clearV1();
        let data = getData();
        const userID = authRegisterV1("example@gmail.com", "abc123", "John", "Smith");
        if (typeof userID === 'number') {
            const channel1 = channelsCreateV1(userID,'channel1', false);
            const channel2 = channelsCreateV1(userID,'channel2', false);
            const result = channelDetailsV1(userID,data.channels[1].channelId);
            expect(result).toEqual(channel2);
        }else {
            return {error: 'User is not a part of the channel or invalid channelId'};
        }
        
        
    });
    test ('testing if channelId is not valid', () => {
        clearV1();
        let data = getData();
        const userID = authRegisterV1("example@gmail.com", "abc123", "John", "Smith").authUserId;
        const channel1 = channelsCreateV1(userID,'channel1', false);
        const result = channelDetailsV1(userID, 'invalidChannelName');
        expect(result).toEqual({error: 'User is not a part of the channel or invalid channelId'});
    });
    test ('testing if channelId is valid but authuser is not a part of the channel', () => {
        clearV1();
        let data = getData();
        const userID = authRegisterV1("example@gmail.com", "abc123", "John", "Smith");
        const userID1a = authRegisterV1("kavish@gmail.com", "abc12asd3", "Kavish", "Smith");
        const channel1 = channelsCreateV1(userID,'channel1', false);
        const result = channelDetailsV1(userID1, data.channels[0].channelId);
        expect(result).toEqual({error: 'User is not a part of the channel or invalid channelId'});
    });
});

//testing channelMessages:



const ERROR = { error: expect.any(String) };

describe('Error Checking in channel messages v1', () => {
    const data = getData();
    let userid: number;
    let userid2: number;
    let channelid: number;
    beforeEach (() => {
        clearV1();
        userid = authRegisterV1("test@gmail.com", "test1234", "test", "test").authUserId;
        userid2 = authRegisterV1("user2@gmail.com", "test1234", "Hritwik", "Nauriyal").authUserId;
        channelid = channelsCreateV1(0, "test", true).channelId;
    });

    test('invalid authuser id', () => {
        const result = channelMessagesV1(-1, channelid, 0);
        expect(result).toStrictEqual(ERROR);
    });

    test('invalid channel id', () => {
        let channelid = -1;
        const result = channelMessagesV1(userid, channelid, 0);
        expect(result).toStrictEqual(ERROR);
    });

    test('invalid start', () => {
        const result = channelMessagesV1(userid, channelid, 1);
        expect(result).toStrictEqual(ERROR);    
    });

    test('Authuser not part of channel', () => {

        const result = channelMessagesV1(userid2, channelid, 0);
        expect(result).toStrictEqual(ERROR);
    });

    test('Valid Test', () => {
        const result = channelMessagesV1(userid, channelid, 0);
        expect(result).toStrictEqual({messages: [],start: 0, end: -1});
    });

});




describe('Error Checking in channel invite v1', () => {
    const data = getData();
    let userid: number;
    let userid1: number;
    let userid2: number;
    let userid3: number;
    let channelid: number;
    beforeEach (() => {
        clearV1();
        userid = authRegisterV1("test@gmail.com", "test12345", "test", "test").authUserId;
        userid1 = authRegisterV1("test1@gmail.com", "test12344", "test1", "test1").authUserId;
        userid2 = authRegisterV1("test2@gmail.com", "test22345", "test2", "test2").authUserId;
        userid3 = authRegisterV1("test3@gmail.com", "test31234", "test3", "test3").authUserId;
        channelid = channelsCreateV1(0, "test", true).channelId;
        channelJoinV1(1, 0);
    });

    test('invalid channel id', () => {
        const result = channelInviteV1(userid, -1, userid2);
        expect(result).toStrictEqual(ERROR);
    });

    test('uid already member of channel', () => {
        const result = channelInviteV1(userid, channelid, userid1);
        expect(result).toStrictEqual(ERROR);
    });

    test('invalid uid', () => {
        const result = channelInviteV1(userid, channelid, -1);
        expect(result).toStrictEqual(ERROR); 
    });

    test('Authuser not part of channel', () => {
        const result = channelInviteV1(userid2, channelid, userid3);
        expect(result).toStrictEqual(ERROR);
    });

    test('authuser is invalid', () => {
        const result = channelInviteV1(userid, channelid, -1);
        expect(result).toStrictEqual(ERROR);
    });

    test('valid test', () => {
        const result = channelInviteV1(userid, channelid, userid3);
        expect(result).toStrictEqual({});
    });

});

//testing channelJoinV1

describe ("Testing channelJoinV1", () => {
    beforeEach (() => {
        clearV1();
        const authId1 = authRegisterV1("lebron@gmail.com", "123456789", "Lebron", "James").authUserId;
        channelsCreateV1(authId1, "channel1", true);
        channelsCreateV1(authId1, "channel2", false);
    });

    //test that a channel Id does not refer to a valid channel
    test ('channelId is invalid', () => {
        let authId2 = authRegisterV1("john@gmail.com", "123456789", "John", "Smith").authUserId;
        let channelId2 = -1;
        const result = channelJoinV1(authId2, channelId2);
        expect(result).toStrictEqual(ERROR);

    })

    //test that authorised user is already member of channel
    test ('Authorised user is already a member', () => {
        let channelId1 = 0;
        const result = channelJoinV1(0, channelId1);
        expect(result).toStrictEqual(ERROR);

    })

    //test that new authorised user cannot join private channel when not a member
    test ('Private channel', () => {
      const result = channelJoinV1(0, 1);
      expect(result).toStrictEqual(ERROR);

    })
    //test that an authorised user's Id is invalid
    test ('Authorised user Id is invalid', () => {
        let userId = -1;
        let channelId1 = 0;
        const result = channelJoinV1(userId, channelId1);
        expect(result).toStrictEqual(ERROR);

    })

    //test that valid parameters permits authorised user to join channel
    test ('Authorised user successfully joins channel', () => {
      let authId2 = authRegisterV1("Kanye@gmail.com", "123456789", "Kanye", "West").authUserId;
      let channelId1 = 0;
      const result = channelJoinV1(authId2, channelId1);
      expect(result).toStrictEqual({});
    }) 
})



