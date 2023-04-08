import request, { HttpVerb } from 'sync-request';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;

// Test Wrappers
function requestdmCreate(token: string, uIds: number[]) {
  return requestHelper('POST', '/dm/create/v1', { token, uIds });
}
function requestdmList(token: string) {
  return requestHelper('GET', '/dm/list/v1', { token });
}

function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  return requestHelper('POST', '/auth/register/v2', { email, password, nameFirst, nameLast });
}
function requestClear() {
  return requestHelper('DELETE', '/clear/v1', {});
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
    // const user4tok = requestAuthRegister('singsong.sdcth@live.com.au', 'passeasd23$%', 'ding', 'Dong').token

    expect(requestdmCreate(user4.token, [user1.authUserId, user2.authUserId, user3.authUserId])).toStrictEqual({ dmId: expect.any(Number) });
  });

  test('Invalid Token', () => {
    expect(requestdmCreate('Invalid Token', [8, 4])).toStrictEqual({ error: 'Invalid Token or duplicate user Ids' });
  });
  test('Duplicate User Ids', () => {
    const user3a = requestAuthRegister('kavasdh.reasddy@live.com.au', 'paasdord123$%', 'Kavfsdssh', 'Reasddy');

    // const user2 = requestAuthRegister('john.smith@live.com.au', 'passer123$%', 'John', 'Smith');
    expect(requestdmCreate(user3a.token, [8123, 832])).toStrictEqual({ error: 'authUserId is invalid' });
  });
});

describe('/dm/list/v1', () => {
  beforeEach(() => {
    requestClear();
  });
  test('Current test', () => {
    const user1 = requestAuthRegister('kavish.reddy@live.com.au', 'password123$%', 'Kavish', 'Reddy');
    const user2 = requestAuthRegister('john.smith@live.com.au', 'passer123$%', 'John', 'Smith');
    const user3 = requestAuthRegister('lames.sdcth@live.com.au', 'passeasd23$%', 'Lames', 'Smoth');
    const user4 = requestAuthRegister('singsong.sdcth@live.com.au', 'passeasd23$%', 'ding', 'Dong');
    requestdmCreate(user4.token, [user1.authUserId, user2.authUserId, user3.authUserId]);
    expect(requestdmList(user1.token)).toStrictEqual([]);
  });
});
