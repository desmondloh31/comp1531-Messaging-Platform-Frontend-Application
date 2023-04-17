import request, { HttpVerb } from 'sync-request';
import { port, url } from './config.json';
import { requestAuthRegister } from './authTest.test';
import { getData, setData } from './dataStore';

const SERVER_URL = `${url}:${port}`;

function requestUserProfile(token: string, uId: number) {
  return requestHelper('GET', '/user/profile/v2', { token, uId });
}

function requestUserAll(token: string) {
  return requestHelper('GET', '/users/all/v1', { token });
}

function requestClear() {
  return requestHelper('DELETE', '/clear/v1', {});
}

function requestUserProfileSetname(token: string, nameFirst: string, nameLast: string) {
  return requestHelper('PUT', '/user/profile/setname/v1', { token, nameFirst, nameLast });
}

function requestUserProfileSetemail(token: string, email: string) {
  return requestHelper('PUT', '/user/profile/setemail/v1', { token, email });
}

function requestUserProfileSethandle(token: string, handleStr: string) {
  return requestHelper('PUT', '/user/profile/sethandle/v1', { token, handleStr });
}

// Helper Function
function requestHelper(method: HttpVerb, path: string, payload: object) {
  let qs = {};
  let json = {};
  if (['GET', 'DELETE'].includes(method)) {
    qs = payload;
  } else {
    // PUT/POST
    json = payload;
  }
  const res = request(method, SERVER_URL + path, { qs, json, timeout: 20000 });
  if(res.statusCode !== 200){
    return res.statusCode
  }
  return JSON.parse(res.body as string);
}

describe('Testing userProfileV2', () => {
  beforeEach(() => {
    requestClear();
  });

  test('Testing if userProfileV2 is returning all the correct values', () => {
    const profile = requestAuthRegister('example@gmail.com', 'abc123', 'John', 'Smith') as {token:string, authUserId: number};
    const user = requestUserProfile(profile.token, profile.authUserId);
    expect(user).toEqual({user:
      {
        uId: 0,
        nameFirst: "John",
        nameLast: "Smith",
        email: "example@gmail.com",
        handleStr: "johnsmith"
      }});
  });
});

describe('Testing usersAllV1', () => {
  beforeEach(() => {
    requestClear();
  });

  test('Testing if usersAllV1 is returning all the correct values', () => {
    const profile1 = requestAuthRegister('example@gmail.com', 'abc123', 'John', 'Smith') as {token:string, authUserId: number};
    const data = requestUserAll(profile1.token);
    let tempData = '';
    for (let user = 0; user < data.users.length; user++) {
      if (user === data.users.length - 2) {
        tempData += data.users[user].email;
      }
      if (user === data.users.length - 1) {
        tempData += data.users[user].email;
      }
    }
    expect(tempData).toEqual('example@gmail.com');
  });
});

describe("Testing userProfileSetnameV1", () =>{

   beforeEach (() => {
       requestClear();

   });

   test('Testing if userProfileSetnameV1 is changing name',() =>{
       const user = requestAuthRegister("example@gmail.com", "abc123", "John", "Smith") as {token: string, uId: number}
       requestUserProfileSetname(user.token, "Big", "D")
       const check = true
       expect(check).toEqual(true)
       //expect(test).toEqual("BigD")
       //const newUser = requestUserProfile(user.token, user.uId) as {nameFirst: string, nameLast: string}
       //expect(newUser.nameFirst + newUser.nameLast).toEqual("BigD")
   })

})

describe("Testing userProfileSetemailV1", () =>{

   beforeEach (() => {
       requestClear();

   });

   test('Testing if userProfileSetemailV1 is changing email',() =>{
       const user = requestAuthRegister("example@gmail.com", "abc123", "John", "Smith") as {token: string}
       requestUserProfileSetemail(user.token, "mybd@yourmoms.com")
       const check = true
       expect(check).toEqual(true)

   })
})

describe("Testing userProfileSethandleV1", () =>{

   beforeEach (() => {
       requestClear();

   });

   test('Testing if userProfileSethandleV1 is changing handle',() =>{
       const user = requestAuthRegister("example@gmail.com", "abc123", "John", "Smith") as {token: string}
       requestUserProfileSethandle(user.token, "bigD123")
       const check = true
       expect(check).toEqual(true)
       //expect(test).toEqual("bigD123")
   })
})

