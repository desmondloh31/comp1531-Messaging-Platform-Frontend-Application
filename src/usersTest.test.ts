// import request, { HttpVerb } from 'sync-request';
// import { port, url } from './config.json';
// import { requestAuthRegister } from './authTest.test';

// const SERVER_URL = `${url}:${port}`;

// function requestUserProfile(token: string, uId: number) {
//   return requestHelper('GET', '/user/profile/v2', { token, uId });
// }

// function requestUserAll(token: string) {
//   return requestHelper('GET', '/users/all/v1', { token });
// }

// function requestClear() {
//   return requestHelper('DELETE', '/clear/v1', {});
// }

// function requestUserProfileSetname(token: string, nameFirst: string, nameLast: string) {
//   return requestHelper('PUT', '/user/profile/setname/v1', { token, nameFirst, nameLast });
// }

// function requestUserProfileSetemail(token: string, email: string) {
//   return requestHelper('PUT', '/user/profile/setemail/v1', { token, email });
// }

// function requestUserProfileSethandle(token: string, handleStr: string) {
//   return requestHelper('PUT', '/user/profile/sethandle/v1', { token, handleStr });
// }

// Helper Function
// function requestHelper(method: HttpVerb, path: string, payload: object) {
//   let qs = {};
//   let json = {};
//   if (['GET', 'DELETE'].includes(method)) {
//     qs = payload;
//   } else {
//     // PUT/POST
//     json = payload;
//   }
//   const res = request(method, SERVER_URL + path, { qs, json, timeout: 20000 });
//   return JSON.parse(res.getBody('utf-8'));
// }

// describe('Testing userProfileV2', () => {
//   beforeEach(() => {
//     requestClear();
//   });

//   test('Testing if userProfileV2 is returning all the correct values', () => {
//     const profile = requestAuthRegister('example@gmail.com', 'abc123', 'John', 'Smith') as {token:string, authUserId: number};
//     const user = requestUserProfile(profile.token, profile.authUserId);
//     expect(user).toEqual({
//       uId: expect.any(Number),
//       email: 'example@gmail.com',
//       nameFirst: 'John',
//       nameLast: 'Smith',
//       handleStr: 'johnsmith'
//     });
//   });
// });

// describe('Testing usersAllV1', () => {
//   beforeEach(() => {
//     requestClear();
//   });

//   test('Testing if usersAllV1 is returning all the correct values', () => {
//     const profile1 = requestAuthRegister('example@gmail.com', 'abc123', 'John', 'Smith') as {token:string, authUserId: number};
//     const data = requestUserAll(profile1.token);
//     let tempData = '';
//     for (let user = 0; user < data.users.length; user++) {
//       if (user === data.users.length - 2) {
//         tempData += data.users[user].email;
//       }
//       if (user === data.users.length - 1) {
//         tempData += data.users[user].email;
//       }
//     }
//     expect(tempData).toEqual('example@gmail.com');
//   });
// });
/*
describe("Testing userProfileSetnameV1", () =>{

    beforeEach (() => {
        requestClear();

    });

    test('Testing if userProfileSetnameV1 is changing name',() =>{
        const user = requestAuthRegister("example@gmail.com", "abc123", "John", "Smith") as {token: string, uId: number}
        requestUserProfileSetname(user.token, "Big", "D")
        const data = getData()
        expect(data.users[0].nameFirst + data.users[0].nameLast).toEqual("BigD")
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
        const data = getData()
        expect(data.users[0].email).toEqual("mybd@yourmoms.com")

    })
})

describe("Testing userProfileSethandleV1", () =>{

    beforeEach (() => {
        requestClear();

    });

    test('Testing if userProfileSethandleV1 is changing handle',() =>{
        const user = requestAuthRegister("example@gmail.com", "abc123", "John", "Smith") as {token: string}
        requestUserProfileSethandle(user.token, "bigD123")
        const data = getData()
        expect(data.users[0].handleStr).toEqual("bigD123")
        //expect(test).toEqual("bigD123")
    })
})
*/

import request from 'sync-request';
import config from './config.json';

const OK = 200;
const INPUT_ERROR = 400;
const port = config.port;
const url = config.url;

/*
Iteration 2
*/

describe('HTTP tests using Jest', () => {
  test('Test successful echo', () => {
    const res = request(
      'GET',
            `${url}:${port}/echo`,
            {
              qs: {
                echo: 'Hello',
              },
              // adding a timeout will help you spot when your server hangs
              timeout: 100
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toEqual('Hello');
  });
  test('Test invalid echo', () => {
    const res = request(
      'GET',
            `${url}:${port}/echo`,
            {
              qs: {
                echo: 'echo',
              },
              timeout: 100
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual({ message: 'Cannot echo "echo"' });
  });
});
