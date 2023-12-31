import request, { HttpVerb } from 'sync-request';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;

function requestChannelscreate(token: string, name: string, isPublic: boolean) {
  return requestHelper('POST', '/channels/create/v3', { name, isPublic }, token);
}

function requestChannelslist(token: string) {
  return requestHelper('GET', '/channels/list/v3', { }, token);
}

function requestChannelsListAll(token: string) {
  return requestHelper('GET', '/channels/listall/v3', { }, token);
}

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
  const headers = {};
  if (['GET', 'DELETE'].includes(method)) {
    qs = payload;
  } else {
  // PUT/POST
    json = payload;
  }
  const res = request(method, SERVER_URL + path, { qs, headers, json, timeout: 20000 });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.body as string);
}
// testing channelsCreateV1:
describe('Testing channelsCreateV1', () => {
  beforeEach(() => {
    requestClear();
  });

  // test with valid parameters:
  test('creates a new channel with valid parameters', () => {
    const user1 = requestAuthRegister('fakemail@gmail.com', 'badpassword@123', 'fake', 'email');
    const name = 'newChannel';
    const isPublic = true;
    const result = requestChannelscreate(user1.token, name, isPublic);

    expect((result)).toEqual({
      channelId: expect.any(Number)
    });
  });

  // user Id is invalid:
  test('returns error when authUserId is invalid', () => {
    const authUserId = '';
    const name = 'newChannel';
    const isPublic = true;
    const result = requestChannelscreate(authUserId, name, isPublic);
    expect((result)).toEqual({ error: 'authUserId is invalid' });
  });

  // name is too short:
  test('returns error when name is too short', () => {
    const user1 = requestAuthRegister('fakemail@gmail.com', 'badpassword@123', 'fake', 'email');

    const name = '';
    const isPublic = true;
    const result = requestChannelscreate(user1.token, name, isPublic);
    expect((result)).toEqual(400);
  });

  // name is too long:
  test('returns error when name is too long', () => {
    const user1 = requestAuthRegister('fakemail@gmail.com', 'badpassword@123', 'fake', 'email');

    const isPublic = true;
    const longName = 'abcdefghijklmnopqrstuvwxyz';
    const result = requestChannelscreate(user1.token, longName, isPublic);
    expect((result)).toEqual(400);
  });
});

// testing channelsListV1:
describe('Testing channelsListV1', () => {
  beforeEach(() => {
    requestClear();
  });

  test('returns array of channels when authUserId is valid', () => {
    const user1 = requestAuthRegister('fakemail@gmail.com', 'badpassword@123', 'fake', 'email');
    const channel1 = requestChannelscreate(user1.token, 'test', true).channelId;
    const result = requestChannelslist(user1.token);
    expect((result)).toEqual({ channels: [{ channelId: channel1, name: 'test' }] });
  });

  // authUserId is invalid:
  test('returns error when authUserId is invalid', () => {
    const result = requestChannelslist('-1');
    expect((result)).toEqual({ error: 'authUserId is invalid' });
  });
});

// testing channelsListAllV1:
describe('Testing channelsListAllV1', () => {
  beforeEach(() => {
    requestClear();
  });
  test('testing if authUserId is not valid', () => {
    const result = requestChannelsListAll('-1');
    expect(result).toEqual({ error: 'authUserId is invalid' });
  });
  test('returns array of channels when authUserId is valid', () => {
    const authUserId1 = requestAuthRegister('fakemail@gmail.com', 'badpassword@123', 'fake', 'email');
    const authUserId2 = requestAuthRegister('desmondloh@gmail.com', 'notapassword@123', 'desmond', 'loh');
    const channel2 = requestChannelscreate(authUserId2.token, 'pass', true);
    const result = requestChannelsListAll(authUserId1.token);
    expect((result)).toEqual({ channels: [{ channelId: channel2.channelId, name: 'pass' }] });
  });
});
