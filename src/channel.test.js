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





