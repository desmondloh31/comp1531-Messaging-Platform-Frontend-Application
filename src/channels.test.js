import {channelsCreateV1, channelsListV1, channelsListAllV1} from './channels';

//testing channelsCreateV1:
describe ("Testing channelsCreateV1", () => {
    test ('testing if authUserId is valid', () => {
        
    });

    test ('testing for Invalid authUserId', () => {
        const userId = channelsCreateV1("abcdefg@unsw.edu.aiu", "john doe", true);
        expect(userId).toEqual({error: "error"});
    });

    test ('testing for name length that is less than 1 character', () => {
        const userId = channelsCreateV1("happyhacker123", "", true);
        expect(userId).toEqual({error: "error"});
    });

    test ('testing for namelength that is greater than 20 characters', () => {
        const userId = channelsCreateV1("johndoe12345", "lemon tangebugorgahdhghyfgs", true);
        expect(userId).toEqual({error: "error"});
    });
});


//testing channelsListV1:
describe ("Testing channelsListV1", () => {

});

//testing channelsListAllV1:
describe ("Testing channelsListAllV1", () => {

});