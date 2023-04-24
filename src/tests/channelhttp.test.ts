import request, { HttpVerb } from 'sync-request';
import { port, url } from '../config.json';
const SERVER_URL = `${url}:${port}`;

export function requestChannelInvite(token: string, channelId: number, uId: number) {
  return requestHelper('POST', '/channel/invite/v3', { channelId, uId }, token);
}

export function requestClear() {
  return requestHelper('DELETE', '/clear/v1', {}, '-1');
}

export function requestChannelMessages(token: string, channelId: number, start: number) {
  return requestHelper('GET', '/channel/messages/v3', { channelId, start }, token);
}

export function requestChannelCreate(token: string, name: string, isPublic: boolean) {
  return requestHelper('POST', '/channels/create/v3', { name, isPublic }, token);
}

export function requestChannelJoin(token: string, channelId: number) {
  return requestHelper('POST', '/channel/join/v3', { channelId }, token);
}

export function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  return requestHelper('POST', '/auth/register/v3', { email, password, nameFirst, nameLast }, '-1');
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
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody('utf-8'));
}

// const ERROR = { error: expect.any(String) };

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
      expect(result).toStrictEqual(400);
    });

    test('uid already member of channel', () => {
      const result = requestChannelInvite(user.token, channelid, user1.authUserId);
      expect(result).toStrictEqual(400);
    });

    test('invalid uid', () => {
      const result = requestChannelInvite(user.token, channelid, -1);
      expect(result).toStrictEqual(400);
    });

    test('Authuser not part of channel', () => {
      const result = requestChannelInvite(user2.token, channelid, user3.authUserId);
      expect(result).toStrictEqual(403);
    });

    test('authuser is invalid', () => {
      const result = requestChannelInvite('-1', channelid, user3.authUserId);
      expect(result).toStrictEqual(403);
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
      expect(result).toStrictEqual(403);
    });

    test('invalid channel id', () => {
      const channelid = -1;
      const result = requestChannelMessages(user.token, channelid, 0);
      expect(result).toStrictEqual(400);
    });

    test('invalid start', () => {
      const result = requestChannelMessages(user.token, channelid, 1);
      expect(result).toStrictEqual(400);
    });

    test('Authuser not part of channel', () => {
      const result = requestChannelMessages(user1.token, channelid, 0);
      expect(result).toStrictEqual(403);
    });

    test('Valid Test', () => {
      const result = requestChannelMessages(user.token, channelid, 0);
      expect(result).toStrictEqual({ messages: [], start: 0, end: -1 });
    });
});
