import {channelDetailsV1, channelMessagesV1, channelInviteV1,channelJoinV1} from './channel.js';
import {getData, setData } from './dataStore.js';
import { clearV1 } from './clearV1.js';
import { authRegisterV1 } from './auth.js';
import { channelsCreateV1 } from './channels.js';




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
});