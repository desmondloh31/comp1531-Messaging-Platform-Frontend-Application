import { authRegisterV1 } from './auth.js';
import {channelsCreateV1, channelsListV1, channelsListAllV1} from './channels.js';
import {getData, setData } from './dataStore.js';
import { fromString } from 'uuidv4';
import {clearV1 } from './clearV1.js';

//testing channelsCreateV1:
describe ("Testing channelsCreateV1", () => {
    beforeEach (() => {
        clearV1();
        authRegisterV1 ('user123@gmail.com', 'user123456', 'user', 'pass');
        
    });
    
    //test with valid parameters:
    test ('creates a new channel with valid parameters', () => {
        //const authUserId = authRegisterV1('desmond123@gmail.com', 'abcdefgl', 'desmond', 'loh');
        const authUserId = fromString('user123@gmail.com'+ 'user' + 'pass');
        const name = 'newChannel';
        const isPublic = true;
        const result = channelsCreateV1(authUserId, name, isPublic);
        const data = getData();


        expect(result).toEqual({
            channelId: expect.any(String),
            name,
            isPublic,
            ownerMembers: [authUserId],
            allMembers: [authUserId],
        });

        expect(data.channels).toEqual ([{
            
                channelId: result.channelId,
                name,
                isPublic,
                ownerMembers: [authUserId],
                allMembers: [authUserId],
                
        },]
            );
    });

    //user Id is invalid:
    test ('returns error when authUserId is invalid', () => {
        const authUserId = fromString('user123@gmail.com'+ 'user' + 'pass');
        const name = 'newChannel';
        const isPublic = true;
        const result = channelsCreateV1('invalidUserId', name, isPublic);
        expect(result).toEqual({ error: 'authUserId is invalid'});
    });

    //name is too short:
    test ('returns error when name is too short', () => {
        const authUserId = fromString('user123@gmail.com'+ 'user' + 'pass');
        const name = 'newChannel';
        const isPublic = true;
        const result = channelsCreateV1(authUserId, '', isPublic);
        expect(result).toEqual({ error: 'length of name is less than 1 or more than 20 characters'});
    })

    //name is too long:
    test ('returns error when name is too long', () => {
        const authUserId = fromString('user123@gmail.com'+ 'user' + 'pass');
        const name = 'newChannel';
        const isPublic = true;
        const longName = 'abcdefghijklmnopqrstuvwxyz';
        const result = channelsCreateV1(authUserId, longName, isPublic);
        expect(result).toEqual({ error: 'length of name is less than 1 or more than 20 characters'});
    });

});



beforeEach (() => {
    setData({users: [],
        channels: []})

});
//testing channelsListV1:
describe ("Testing channelsListV1", () => {

    beforeEach(() => {
        clearV1();
    })
    
    test('returns array of channels when authUserId is valid', () => {
        const authUserId1 = authRegisterV1('user123@gmail.com', 'user123456', 'user', 'pass');
        const authUserId2 = authRegisterV1('user123456@gmail.com', 'user123', 'pass', 'user' );
        const channel1 = channelsCreateV1(authUserId1, 'user', false);
        const channel2 = channelsCreateV1(authUserId2, 'pass', true);
        const result = channelsListV1(authUserId1);
        expect(result).toEqual( [channel1] );
    });

    //authUserId is invalid:
    test ('returns error when authUserId is invalid', () => {
        const result = channelsListV1('invalidUserId');
        expect(result).toEqual({ error: 'authUserId is invalid'});
    });

});

//testing channelsListAllV1:
describe ("Testing channelsListAllV1", () => {
    const authUserId = 'user123';
    const channel1 = {
        channelId: 'channel1',
        name: 'channel1',
        isPublic: true,
        ownerMembers: [authUserId],
        allMembers: [authUserId],
    };

    const channel2 = {
        channelId: 'channel2',
        name: 'channel2',
        isPublic: false,
        ownerMembers: ['otherUser'],
        allMembers: ['otherUser'],
    };

    beforeEach (() => {
        const data = {
            users: { [authUserId]: {} },
            channels: { [channel1.channelId]: channel1, [channel2.channelId]: channel2},
        };
        setData(data);
    });
   
    test ('testing if authUserId is not valid', () => {
        const result = channelsListAllV1('asdas');
        expect(result).toEqual({error: "authUserId is invalid"});
    });
    test ('testing if authUserId is valid', () => {
        const result = channelsListAllV1(authUserId);
        expect(result).toEqual(getData().channels);
        
    });
   
});