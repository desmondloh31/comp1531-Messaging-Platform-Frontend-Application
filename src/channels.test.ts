import { authRegisterV1 } from './auth';
import {channelsCreateV1, channelsListV1, channelsListAllV1} from './channels';
import { clearV1 } from './other';
import {getData,setData } from './dataStore';

// New Ts stuff
import request, {HttpVerb} from 'sync-request';
import {port,url} from './config.json';



const SERVER_URL = `${url}:${port}`;
function requestchannelsCreateV1(authUser: number, name: string, isPublic: boolean){
    return requestHelper('POST','/channels/create/v2',{authUser,name,isPublic});
}
function requestClear(){
    return requestHelper('DELETE','/clear/v1',{})
}
function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string){
    return requestHelper('POST','/channels/create/v2',{email,password,nameFirst,nameLast});
}

beforeEach (() => {
    requestClear();
    requestAuthRegister('user123@gmail.com', 'user123456', 'user', 'pass');       
});


describe('/channels/create', () => {
    test('Title is an empty string', () => {
        expect(requestchannelsCreateV1(0,"name",true)).toStrictEqual({ error: 'authUserId is invalid'})
    });
    test('returns error when name is too short', () => {
        expect(requestchannelsCreateV1(0,'',true)).toStrictEqual({ error: 'length of name is less than 1 or more than 20 characters'})
    });

});


function requestHelper(method: HttpVerb, path: string, payload: object) {
    let qs = {};
    let json = {};
    if (['GET', 'DELETE'].includes(method)) {
        qs = payload;
    } else {
        //PUT/POST
        json = payload;
    }
    const res = request(method, SERVER_URL + path, {qs,json,timeout: 20000});
    return JSON.parse(res.getBody('utf-8'));
}


//testing channelsCreateV1:
describe ('/channels/create/v2', () => {
    beforeEach (() => {
        clearV1();
        authRegisterV1 ('user123@gmail.com', 'user123456', 'user', 'pass');       
    });
    
    //test with valid parameters:
    test ('creates a new channel with valid parameters', () => {
        //const authUserId = authRegisterV1('desmond123@gmail.com', 'abcdefgl', 'desmond', 'loh');
        const authUserId = 0
        const name = 'newChannel';
        const isPublic = true;
        const result = channelsCreateV1( 24, name, isPublic);
        const data = getData();


        expect(result).toEqual({
            channelId: 0,
            name,
            isPublic,
            ownerMembers: [authUserId],
            allMembers: [authUserId],
            messages: [],
        });

        expect(data.channels).toEqual ([{
            
                channelId: result.channelId,
                name,
                isPublic,
                ownerMembers: [authUserId],
                allMembers: [authUserId],
                messages: [],
                
        },]
            );
    });

    //user Id is invalid:
    test ('returns error when authUserId is invalid', () => {
        const authUserId = 0
        const name = 'newChannel';
        const isPublic = true;
        const result = channelsCreateV1(24, name, isPublic);
        expect(result).toEqual({ error: 'authUserId is invalid'});
    });

    //name is too short:
    test ('returns error when name is too short', () => {
        const authUserId = 0
        const name = 'newChannel';
        const isPublic = true;
        const result = channelsCreateV1(24, '', isPublic);
        expect(result).toEqual({ error: 'length of name is less than 1 or more than 20 characters'});
    })

    //name is too long:
    test ('returns error when name is too long', () => {
        const authUserId = 0
        const name = 'newChannel';
        const isPublic = true;
        const longName = 'abcdefghijklmnopqrstuvwxyz';
        const result = channelsCreateV1(24, longName, isPublic);
        expect(result).toEqual({ error: 'length of name is less than 1 or more than 20 characters'});
    });

});




//testing channelsListV1:
describe ("Testing channelsListV1", () => {

    beforeEach(() => {
        clearV1();
    })
    
    test('returns array of channels when authUserId is valid', () => {
        clearV1();
        const authUserId1 = authRegisterV1('user123@gmail.com', 'user123456', 'user', 'pass');
        const authUserId2 = authRegisterV1('user123456@gmail.com', 'user123', 'pass', 'user' );
        const channel1 = channelsCreateV1(83, 'user', false);
        const channel2 = channelsCreateV1(24, 'pass', true);
        const result = channelsListV1(24);
        expect(result).toEqual( [channel1] );
    });

    //authUserId is invalid:
    test ('returns error when authUserId is invalid', () => {
        const result = channelsListV1(56);
        expect(result).toEqual({ error: 'authUserId is invalid'});
    });

});

//testing channelsListAllV1:
describe ("Testing channelsListAllV1", () => {   
    test ('testing if authUserId is not valid', () => {
        const result = channelsListAllV1(2);
        expect(result).toEqual({error: "authUserId is invalid"});
    });
    test('returns array of channels when authUserId is valid', () => {
        clearV1();
        const data = getData();
        const authUserId1 = authRegisterV1('user123@gmail.com', 'user123456', 'user', 'pass');
        const authUserId2 = authRegisterV1('user123456@gmail.com', 'user123', 'pass', 'user' );
        const channel1 = channelsCreateV1(23, 'user', false);
        const channel2 = channelsCreateV1(12, 'pass', true);
        const result = channelsListAllV1(12);
        expect(result).toEqual(data.channels);
    });
});