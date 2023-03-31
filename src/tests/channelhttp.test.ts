import request, { HttpVerb } from 'sync-request';
import { port, url } from '../config.json';
const SERVER_URL = `${url}:${port}`;

export function requestChannelInvite(token: string, channelId: number, uId: number) {
  return requestHelper('POST', '/channel/invite/v2', { token, channelId, uId });
}

export function requestClear() {
  return requestHelper('DELETE', '/clear/v1', {});
}

export function requestChannelMessages(token: string, channelId: number, start: number) {
  return requestHelper('GET', '/channel/messages/v2', { token, channelId, start });
}

export function requestChannelCreate(token: string, name: string, isPublic: boolean) {
  return requestHelper('POST', '/channels/create/v2', { token, name, isPublic });
}

export function requestChannelJoin(token: string, channelId: number) {
  return requestHelper('POST', '/channel/join/v2', { token, channelId });
}

export function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  return requestHelper('POST', '/auth/register/v2', { email, password, nameFirst, nameLast });
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

const ERROR = { error: expect.any(String) };

describe('Error Checking in channel invite v1', () => {
    interface usr {
        authUserId: number;
        token: string;
    }
    let user: usr;
    let user1: usr;
    let user2: usr;
    let user3: usr;
    let channelid: number;
    beforeEach(() => {
      requestClear();

      user = requestAuthRegister('test@gmail.com', 'test12345', 'test', 'test');
      user1 = requestAuthRegister('test1@gmail.com', 'test12344', 'test1', 'test1');
      user2 = requestAuthRegister('test2@gmail.com', 'test22345', 'test2', 'test2');
      user3 = requestAuthRegister('test3@gmail.com', 'test31234', 'test3', 'test3');
      channelid = requestChannelCreate(user.token, 'test', true).channelId;
      requestChannelJoin(user1.token, channelid);
    });

    test('invalid channel id', () => {
      const result = requestChannelInvite(user.token, -1, user2.authUserId);
      expect(result).toStrictEqual(ERROR);
    });

    test('uid already member of channel', () => {
      const result = requestChannelInvite(user.token, channelid, user1.authUserId);
      expect(result).toStrictEqual(ERROR);
    });

    test('invalid uid', () => {
      const result = requestChannelInvite(user.token, channelid, -1);
      expect(result).toStrictEqual(ERROR);
    });

    test('Authuser not part of channel', () => {
      const result = requestChannelInvite(user2.token, channelid, user3.authUserId);
      expect(result).toStrictEqual(ERROR);
    });

    test('authuser is invalid', () => {
      const result = requestChannelInvite(user.token, channelid, -1);
      expect(result).toStrictEqual(ERROR);
    });

    test('valid test', () => {
      const result = requestChannelInvite(user.token, channelid, user3.authUserId);
      expect(result).toStrictEqual({});
    });
});

describe('Error Checking in channel messages v1', () => {
    interface usr {
        authUserId: number;
        token: string;
    }
    let user: usr;
    let user1: usr;
    let channelid: number;
    beforeEach(() => {
      requestClear();
      user = requestAuthRegister('test@gmail.com', 'test1234', 'test', 'test');
      user1 = requestAuthRegister('user2@gmail.com', 'test1234', 'Hritwik', 'Nauriyal');
      channelid = requestChannelCreate(user.token, 'test', true).channelId;
    });

    test('invalid authuser id', () => {
      const result = requestChannelMessages('-1', channelid, 0);
      expect(result).toStrictEqual(ERROR);
    });

    test('invalid channel id', () => {
      const channelid = -1;
      const result = requestChannelMessages(user.token, channelid, 0);
      expect(result).toStrictEqual(ERROR);
    });

    test('invalid start', () => {
      const result = requestChannelMessages(user.token, channelid, 1);
      expect(result).toStrictEqual(ERROR);
    });

    test('Authuser not part of channel', () => {
      const result = requestChannelMessages(user1.token, channelid, 0);
      expect(result).toStrictEqual(ERROR);
    });

    test('Valid Test', () => {
      const result = requestChannelMessages(user.token, channelid, 0);
      expect(result).toStrictEqual({ messages: [], start: 0, end: -1 });
    });
});
