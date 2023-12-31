import request, { HttpVerb } from 'sync-request';
import { port, url } from './config.json';
// import { tokenCreate } from './token';
const SERVER_URL = `${url}:${port}`;

// Test Wrappers
function requestdmCreate(token: string, uIds: number[]) {
  return requestHelper('POST', '/dm/create/v1', { uIds }, token);
}
// function requestdmList(token: string) {
//   return requestHelper('GET', '/dm/list/v1', { token });
// }

function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  return requestHelper('POST', '/auth/register/v3', { email, password, nameFirst, nameLast }, '-1');
}
function requestClear() {
  return requestHelper('DELETE', '/clear/v1', {}, '-1');
}

// Helper Function
function requestHelper(method: HttpVerb, path: string, payload: object, tkn: string) {
  let qs = {};
  let json = {};
  let headers = {};
  if (['GET', 'DELETE'].includes(method)) {
    headers = { token: tkn };
    qs = payload;
  } else {
    // PUT/POST
    headers = { token: tkn };
    json = payload;
  }
  const res = request(method, SERVER_URL + path, { qs, headers, json, timeout: 20000 });
  return JSON.parse(res.getBody('utf-8'));
}

// Tests
describe('/dm/create/v1', () => {
  beforeEach(() => {
    requestClear();
  });
  test('Current test', () => {
    const user1 = requestAuthRegister('kavish.reddy@live.com.au', 'password123$%', 'Kavish', 'Reddy');
    const user2 = requestAuthRegister('john.smith@live.com.au', 'passer123$%', 'John', 'Smith');
    const user3 = requestAuthRegister('lames.sdcth@live.com.au', 'passeasd23$%', 'Lames', 'Smoth');
    const user4 = requestAuthRegister('singsong.sdcth@live.com.au', 'passeasd23$%', 'ding', 'Dong');
    console.log(user1, user2, user3, user4);
    // const user4tok = requestAuthRegister('singsong.sdcth@live.com.au', 'passeasd23$%', 'ding', 'Dong').token
    const result = requestdmCreate(user4.token, [user1.authUserId, user2.authUserId, user3.authUserId]);
    console.log(requestdmCreate);
    expect(result).toStrictEqual({ dmId: expect.any(Number) });
  });

  test('Invalid Token', () => {
    expect(requestdmCreate('Invalid Token', [-1, -2])).toStrictEqual({ error: 'Invalid Token' });
  });
  test('Duplicate User Ids', () => {
    const user1a = requestAuthRegister('kaviasdh.reddsdy@live.com.au', 'passwsdd123$%', 'Kavasdh', 'Resdy');
    const user2a = requestAuthRegister('kavasda.rsddy@live.com.au', 'pasasd3$%', 'Kavisdh', 'Resddy');
    const user3a = requestAuthRegister('kavasdh.reasddy@live.com.au', 'paasdord123$%', 'Kavfsdssh', 'Reasddy');

    // const user2 = requestAuthRegister('john.smith@live.com.au', 'passer123$%', 'John', 'Smith');
    expect(requestdmCreate(user3a.token, [user1a.authUserId, user1a.authUserId, user2a.authUserId])).toStrictEqual({ error: 'Duplicate User Ids' });
  });
});

// describe('/dm/list/v1', () => {
//   beforeEach(() => {
//     requestClear();
//   });
//   test('Current test', () => {
//     const user1 = requestAuthRegister('kavish.reddy@live.com.au', 'password123$%', 'Kavish', 'Reddy');
//     const user2 = requestAuthRegister('john.smith@live.com.au', 'passer123$%', 'John', 'Smith');
//     const user3 = requestAuthRegister('lames.sdcth@live.com.au', 'passeasd23$%', 'Lames', 'Smoth');
//     const user4 = requestAuthRegister('singsong.sdcth@live.com.au', 'passeasd23$%', 'ding', 'Dong');
//     requestdmCreate(user4.token, [user1.authUserId, user2.authUserId, user3.authUserId]);
//     expect(requestdmList(user1.token)).toStrictEqual([]);
//   });
// });
