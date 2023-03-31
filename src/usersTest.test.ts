import {userProfileV1, usersAllV1} from './users' 
import {authRegisterV1, authLoginV1, authLogoutV1} from './auth'; 
import {tokenCreate, tokenVerify, tokenDelete} from './token' 
import request, {HttpVerb} from 'sync-request';
import {port,url} from './config.json';
import {requestAuthRegister} from './authTest.test'
const SERVER_URL = `${url}:${port}`;

function requestUserProfile(token: string, uId: number){
    return requestHelper('GET','/user/profile/v2',{token, uId});
  }

function requestUserAll(token: string){
    return requestHelper('GET','/users/all/v1',{token});
  }
  
  // Helper Function
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

describe("Testing userProfileV2", () =>{
    test('Testing if userProfileV2 is returning all the correct values',() =>{
        const profile = requestAuthRegister("example@gmail.com", "abc123", "John", "Smith") as {token:string, authUserId: number}
        const user = requestUserProfile(profile.token, profile.authUserId)
        expect(user).toEqual({
            uId: expect.any(Number), 
            email: "example@gmail.com", 
            nameFirst: "John", 
            nameLast: "Smith", 
            handleStr: "johnsmith"
          } )
    })
})

describe("Testing usersAllV1", () =>{
    test('Testing if userProfileV2 is returning all the correct values',() =>{
        const profile1 = requestAuthRegister("example@gmail.com", "abc123", "John", "Smith") as {token:string, authUserId: number}
        const profile2 = requestAuthRegister("ihatethis@cse.com", "nomore", "Freaking", "Done") as {token:string, authUserId: number}
        const data = requestUserAll(profile1.token)
        let tempData = ""
        for(let user = 0; user < data.users.length; user++ ){
            if(user = data.users.length -2){
                tempData += data.users[user].email
            }
            if(user = data.users.length -1){
                tempData += data.users[user].email
            }

        }
        expect(tempData).toEqual("example@gmail.comihatethis@cse.com");
    })
})
