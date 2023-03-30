import { channelDetailsV1, channelMessagesV1, channelInviteV1,channelJoinV1 } from './channel';
import { getData, setData } from './dataStore';
import { clearV1 } from "./other.js";
import { authRegisterV1 } from './auth';
import { channelsCreateV1 } from './channels';
import {channelLeaveV1, channelAddOwnerV1, channelRemoveOwnerV1 } from './channel';
import { tokenCreate, tokenDelete, tokenVerify } from './token';
import { token } from 'morgan';
import { channel } from 'diagnostics_channel';


//IT2 testing /channel/leave/v1:
describe ('Testing channelLeaveV1', () => {
    beforeEach(() => {
        setData({
          users: [
            {
              authUserId: 1,
              nameFirst: 'Hritwik',
              nameLast: 'Nauriyal',
              email: 'HritwikNauriyal@gmail.com',
              formattedHandle: 'HritwikNauriyal',
              password: 'badpassword123',
              token: ['hello'],
            },
            {
              authUserId: 2,
              nameFirst: 'Allen',
              nameLast: 'Sheng',
              email: 'AllenSheng@gmail.com',
              formattedHandle: 'AllenSheng',
              password: 'badpassword123',
              token: [],
            },
          ],
          channels: [
            {
              channelId: 1,
              name: 'Public channel',
              isPublic: true,
              allMembers: [1, 2],
              ownerMembers: [1],
              messages: [],
            },
            {
              channelId: 2,
              name: 'Private channel',
              isPublic: false,
              allMembers: [1],
              ownerMembers: [1],
              messages: [],
            },
          ],
        });
      });

      test ('allowing a member of a channel to leave the channel', () => {
        const data = getData();
        const channelId = data.channels[0].channelId;
        const token = tokenCreate('leavingchannel@gmail.com')
        const result = channelLeaveV1(token, channelId);
        expect(result).toEqual({});
        expect(getData().users[0].token).toEqual([]);
        expect(getData().channels[0].allMembers).toEqual([2]);

      });

      test ('token generated is invalid', () => {
        const data = getData();
        const channelId = data.channels[0].channelId;
        const token = 'not a string'
        const result = channelLeaveV1(token, channelId);
        expect(result).toEqual({ error: 'token is invalid'});

      });

      test ('channelId does not refer to a valid channel', () => {
        const data = getData();
        const channelId = 3;
        const token = tokenCreate('desmondloh@gmail.com')
        const result = channelLeaveV1(token, 3);
        expect(result).toEqual({ error: 'channelId is not part of a valid channel'});
        expect(getData().users[0].token).toEqual([token]);
        expect(getData().channels[0].allMembers).toEqual([1, 2]);

      });

      test ('user is not a member of the channel', () => {
        const data = getData();
        const channelId = data.channels[0].channelId;
        const token = tokenCreate('desmondloh@gmail.com');
        const result = channelLeaveV1(token, channelId);
        expect(result).toEqual({ error: 'channelId is valid, but the user is not a member of the channel'});
        expect(getData().users[1].token).toEqual([token]);
        expect(getData().channels[0].allMembers).toEqual([1, 2]);

      });

});

//IT2 testing /channel/addowner/v1:
describe ("Testing the addowner function", () => {
    beforeEach(() => {
        setData({
          users: [
            {
              authUserId: 1,
              nameFirst: 'Hritwik',
              nameLast: 'Nauriyal',
              email: 'HritwikNauriyal@gmail.com',
              formattedHandle: 'HritwikNauriyal',
              password: 'badpassword123',
              token: ['hello'],
            },
            {
              authUserId: 2,
              nameFirst: 'Allen',
              nameLast: 'Sheng',
              email: 'AllenSheng@gmail.com',
              formattedHandle: 'AllenSheng',
              password: 'badpassword123',
              token: [],
            },
            {
              authUserId: 3,
              nameFirst: 'Desmond',
              nameLast: 'Loh',
              email: 'DesmondLoh@gmail.com',
              formattedHandle: 'DesmondLoh',
              password: 'badpassword123',
              token: [],

            }
          ],
          channels: [
            {
              channelId: 1,
              name: 'Public channel',
              isPublic: true,
              allMembers: [1, 2],
              ownerMembers: [1],
              messages: [],
            },
            {
              channelId: 2,
              name: 'Private channel',
              isPublic: false,
              allMembers: [1],
              ownerMembers: [1],
              messages: [],
            },
          ],
        });
      });

      test ('Adding a user as an owner to the channel', () => {
        const data = getData();
        const userId = data.users[2].authUserId;
        const channelId = data.channels[1].channelId;
        const token = tokenCreate('AddingOwner@gmail.com')

        const result = channelAddOwnerV1(token, channelId, userId);

        const expected = {
            channelId: channelId,
            name: 'channel 2',
            isPublic: false,
            allMembers: [getData().users[1].authUserId, userId],
            ownerMembers: [getData().users[1].authUserId, userId],
            messages: ['hello world'],
        };

        expect(result).toEqual({});
        expect(data.channels.find((channel) => channel.channelId === channelId)).toEqual(expected);
        
      });

      test('should return error with invalid token', () => {
        const data = getData();
        const userId = data.users[2].authUserId;
        const channelId = data.channels[0].channelId;
        const token = 'not a string'
        const result = channelAddOwnerV1(token, channelId, userId);
        expect(result).toEqual({ error: 'token is invalid' });
      });
    
      test('should return error with invalid channelId', () => {
        const data = getData();
        const userId = data.users[2].authUserId;
        const channelId = 999;
        const token = tokenCreate('horriblecoder@gmail.com');
        const result = channelRemoveOwnerV1(token, channelId, userId);
        expect(result).toEqual({ error: 'channelId is not part of a valid channel' });
      });
    
      test('should return error with invalid uId', () => {
        const data = getData();
        const userId = 999;
        const channelId = data.channels[0].channelId;
        const token = tokenCreate('horriblecoder@gmail.com');
        const result = channelRemoveOwnerV1(token, channelId, userId);
        expect(result).toEqual({ error: 'user is not valid' });
      });
    
      test('should return error with uId not in channel', () => {
        const data = getData();
        const userId = data.users[2].authUserId;
        const channelId = data.channels[0].channelId;
        const token = tokenCreate('desmondloh@gmail.com');
        const result = channelRemoveOwnerV1(token, channelId, userId);
        expect(result).toEqual({ error: 'user is not a member of the channel' });
      });
    
      test('should return error with uId already an owner', () => {
        const data = getData();
        const userId = data.users[0].authUserId;
        const channelId = data.channels[0].channelId;
        const token = tokenCreate('johnsmith@gmail.com');
        const result = channelAddOwnerV1(token, channelId, userId);
        expect(result).toEqual({ error: 'user is already an owner of the channel'});
      });
    
      test('should return error with user without owner permissions', () => {
        const data = getData();
        const userId = data.users[1].authUserId;
        const channelId = data.channels[1].channelId;
        const token = tokenCreate('letmecode@gmail.com');
        const result = channelRemoveOwnerV1(token, channelId, userId);
        expect(result).toEqual({ error: 'channelId is valid, but user is not an owner of the channel' });
      });
  
});

//IT2 testing /channel/removeowner/v1:
describe ("Testing the removeowner function", () => {
    beforeEach(() => {
        setData({
          users: [
            {
              authUserId: 1,
              nameFirst: 'Hritwik',
              nameLast: 'Nauriyal',
              email: 'HritwikNauriyal@gmail.com',
              formattedHandle: 'HritwikNauriyal',
              password: 'badpassword123',
              token: [],
            },
            {
              authUserId: 2,
              nameFirst: 'Allen',
              nameLast: 'Sheng',
              email: 'AllenSheng@gmail.com',
              formattedHandle: 'AllenSheng',
              password: 'badpassword123',
              token: [],
            },
            {
              authUserId: 3,
              nameFirst: 'Desmond',
              nameLast: 'Loh',
              email: 'DesmondLoh@gmail.com',
              formattedHandle: 'DesmondLoh',
              password: 'badpassword123',
              token: [],

            }
          ],
          channels: [
            {
              channelId: 1,
              name: 'Public channel',
              isPublic: true,
              allMembers: [1, 2],
              ownerMembers: [1],
              messages: [],
            },
            {
              channelId: 2,
              name: 'Private channel',
              isPublic: false,
              allMembers: [1],
              ownerMembers: [1],
              messages: [],
            },
          ],
        });
      });

      test ('removing an owner from the channel', () => {
        const data = getData();
        const userId = data.users[1].authUserId 
        const channelId = data.channels[1].channelId;
        const token = tokenCreate('desmondjw@gmail.com');

        const result = channelRemoveOwnerV1(token, channelId, userId);

        const expected = {
            channelId: channelId,
            name: 'channel 2',
            allMembers: [getData().users[1].authUserId, getData().users[2].authUserId],
            ownerMembers: [getData().users[2].authUserId],
            messages: ['hello world'],
        };

        expect(result).toEqual({});
        expect(data.channels.find((channel) => channel.channelId === channelId)).toEqual(expected);
        tokenDelete(token);
        
      });

      test('should return error with invalid token', () => {
        const data = getData();
        const userId = data.users[2].authUserId;
        const channelId = data.channels[0].channelId;
        const token = 'not a string'
        const result = channelRemoveOwnerV1(token, channelId, userId);
        expect(result).toEqual({ error: 'token is invalid' });
      });
    
      test('should return error with invalid channelId', () => {
        const data = getData();
        const userId = data.users[2].authUserId;
        const channelId = 999;
        const token = tokenCreate('horriblecoder@gmail.com');
        const result = channelRemoveOwnerV1(token, channelId, userId);
        expect(result).toEqual({ error: 'channelId is not part of a valid channel' });
      });
    
      test('should return error with invalid uId', () => {
        const data = getData();
        const userId = 999;
        const channelId = data.channels[0].channelId;
        const token = tokenCreate('horriblecoder@gmail.com');
        const result = channelRemoveOwnerV1(token, channelId, userId);
        expect(result).toEqual({ error: 'user is not valid' });
      });
    
      test('should return error with uId not in channel', () => {
        const data = getData();
        const userId = data.users[2].authUserId;
        const channelId = data.channels[0].channelId;
        const token = tokenCreate('desmondloh@gmail.com');
        const result = channelRemoveOwnerV1(token, channelId, userId);
        expect(result).toEqual({ error: 'user is not a member of the channel' });
      });
    
      test('should return error with uId where user is not an owner of the channel', () => {
        const data = getData();
        const channelId = data.channels[1].channelId;
        const userId = data.users[0].authUserId;
        const token = tokenCreate('letmedcode@gmail.com');
        const result = channelRemoveOwnerV1(token, channelId, userId);
        expect(result).toEqual({ error: 'user is not an owner of channel'});
        tokenDelete(token);
        
      });
    
      test('should return error with user without owner permissions', () => {
        const data = getData();
        const userId = data.users[1].authUserId;
        const channelId = data.channels[1].channelId;
        const token = tokenCreate('letmecode@gmail.com');
        const result = channelRemoveOwnerV1(token, channelId, userId);
        expect(result).toEqual({ error: 'channelId is valid, but user is not an owner of the channel' });
      });


    
       
});

/*
//testing channelDetails:
describe ("Testing channelDetails Final Test batch", () => {
    test ('testing if authUserId is not valid', () => {
        const result = channelDetailsV1('asdas','channel1');
        expect(result).toEqual({error: "authUserId is invalid"});
    });
    test ('testing if authUserId and channelId are valid', () => {
        clearV1();
        let data = getData();
        const userID = authRegisterV1("example@gmail.com", "abc123", "John", "Smith");
        const channel1 = channelsCreateV1(userID,'channel1', false);
        const channel2 = channelsCreateV1(userID,'channel2', false);
        const result = channelDetailsV1(userID,data.channels[1].channelId);
        expect(result).toEqual(channel2);
    });
    test ('testing if channelId is not valid', () => {
        clearV1();
        let data = getData();
        const userID = authRegisterV1("example@gmail.com", "abc123", "John", "Smith");
        const channel1 = channelsCreateV1(userID,'channel1', false);
        const result = channelDetailsV1(userID,'invalidChannelName');
        expect(result).toEqual({error: 'User is not a part of the channel or invalid channelId'});
    });
    test ('testing if channelId is valid but authuser is not a part of the channel', () => {
        clearV1();
        let data = getData();
        const userID = authRegisterV1("example@gmail.com", "abc123", "John", "Smith");
        const userID1a = authRegisterV1("kavish@gmail.com", "abc12asd3", "Kavish", "Smith");
        const channel1 = channelsCreateV1(userID,'channel1', false);
        const result = channelDetailsV1(userID1a, data.channels[0].channelId);
        expect(result).toEqual({error: 'User is not a part of the channel or invalid channelId'});
    });
});*/

//testing channelMessages:
/*
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
        authRegisterV1("test@gmail.com", "test12345", "test", "test");
        authRegisterV1("test1@gmail.com", "test12344", "test1", "test1");
        authRegisterV1("test2@gmail.com", "test22345", "test2", "test2");
        authRegisterV1("test3@gmail.com", "test31234", "test3", "test3");
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

//testing channelJoinV1

describe ("Testing channelJoinV1", () => {
    beforeEach (() => {
        clearV1();
        const authId1 = authRegisterV1("lebron@gmail.com", "123456789", "Lebron", "James");
        channelsCreateV1(authId1, "channel1", true);
        channelsCreateV1(authId1, "channel2", false);
    });

    //test that a channel Id does not refer to a valid channel
    test ('channelId is invalid', () => {
        let authId2 = authRegisterV1("john@gmail.com", "123456789", "John", "Smith");
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
      let authId2 = authRegisterV1("Kanye@gmail.com", "123456789", "Kanye", "West");
      let channelId1 = 0;
      const result = channelJoinV1(authId2, channelId1);
      expect(result).toStrictEqual({});
    }) 
})

*/
