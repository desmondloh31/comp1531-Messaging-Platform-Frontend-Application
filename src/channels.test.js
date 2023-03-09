import { authRegisterV1 } from './auth.js';
import {channelsCreateV1, channelsListV1, channelsListAllV1} from './channels.js';
import {getData, setData } from './dataStore.js';

//testing channelsCreateV1:
describe ("Testing channelsCreateV1", () => {
    const authUserId = 'user123';
    const name = 'newChannel';
    const isPublic = true;

    /*beforeEach(() => {
        setData({ users: [], channels: [] });
    });*/
    beforeEach (() => {
        const data = {
            users: { [authUserId]: {} },
        };
        setData(data);
    });

    //test with valid parameters:
    test ('creates a new channel with valid parameters', () => {
        //const authUserId = authRegisterV1('desmond123@gmail.com', 'abcdefgl', 'desmond', 'loh');
        const result = channelsCreateV1(authUserId, name, isPublic);
        const data = getData();
        expect(result).toEqual({
            channelId: expect.any(String),
            name,
            isPublic,
            OwnerMembers: [authUserId],
            allMembers: [authUserId],
        });
        expect(data.channels).toEqual ({
            [result.channelId]: {
                channelId: result.channelId,
                name,
                isPublic,
                OwnerMembers: [authUserId],
                allMembers: [authUserId],
                
            },
        });
    });

    //user Id is invalid:
    test ('returns error when authUserId is invalid', () => {
        const result = channelsCreateV1('invalidUserId', name, isPublic);
        expect(result).toEqual({ error: 'authUserId is invalid'});
    });

    //name is too short:
    test ('returns error when name is too short', () => {
        const result = channelsCreateV1(authUserId, '', isPublic);
        expect(result).toEqual({ error: 'length of name is less than 1 or more than 20 characters'});
    })

    //name is too long:
    test ('returns error when name is too long', () => {
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
    
    test('returns array of channels when authUserId is valid', () => {
        const authUserId1 = authRegisterV1('user123@gmail.com', 'user123456', 'user', 'pass');
        const authUserId2 = authRegisterV1('user123456@gmail.com', 'user123', 'pass', 'user' );
        const channel1 = channelsCreateV1(authUserId1, 'user', false);
        const channel2 = channelsCreateV1(authUserId2, 'pass', true);
        const result = channelsListV1(authUserId1);
        expect(result).toEqual({channels: [channel1] });
    });

    /*const authUserId = 'user123';
    const channel1 = {
        channelId: 'channel1',
        name: 'channel1',
        isPublic: true,
        allMembers: [authUserId],
        ownerMembers: [authUserId],
    };

    const channel2 = {
        channelId: 'channel2',
        name: 'channel2',
        isPublic: false,
        allMembers: ['otherUser'],
        ownerMembers: ['otherUser']
    };

    beforeEach (() => {
        const data = {
            users: { [authUserId]: {} },
            channels: { [channel1.channelId]: channel1, [channel2.channelId]: channel2},
        };
        setData(data);
    });

    //authUserId is valid:
    test('returns array of channels when authUserId is valid', () => {
        const result = channelsListV1(authUserId);
        expect(result).toEqual({channels: [channel1] });
    });

    //authuserId is valid but not part of any channels:
    test ('returns empty array when authUserId is valid but not part of any channels', () => {
        const result = channelsListV1('otherUser');
        expect(result).toEqual({ channels: [] });
    });

    //authUserId is invalid:
    test ('returns error when authUserId is invalid', () => {
        const result = channelsListV1('invalidUserId');
        expect(result).toEqual({ error: 'authUserId is invalid '});
    });*/
});

//testing channelsListAllV1:
describe ("Testing channelsListAllV1", () => {
    const authUserId = 'user123';
    const channel1 = {
        channelId: 'channel1',
        name: 'channel1',
        isPublic: true,
        members: [authUserId],
    };

    const channel2 = {
        channelId: 'channel2',
        name: 'channel2',
        isPublic: false,
        members: ['otherUser'],
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