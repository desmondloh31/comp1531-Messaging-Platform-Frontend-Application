import request, { HttpVerb } from 'sync-request';
import { port, url } from '../config.json';
const SERVER_URL = `${url}:${port}`;

export function requestChannelInvite(token: string, channelId: number, uId: number) {
  return requestHelper('POST', '/channel/invite/v2', { token, channelId, uId });
}

export function requestClear() {
  return requestHelper('DELETE', '/clear/v1', {});
}

export function requestDeleteMessage(token: string, messageId: number) {
  return requestHelper('DELETE', '/message/remove/v1', { token, messageId });
}

export function requestChannelMessages(token: string, channelId: number, start: number) {
  return requestHelper('GET', '/channel/messages/v2', { token, channelId, start });
}

export function requestDmMessages(token: string, dmId: number, start: number) {
  return requestHelper('GET', '/channel/messages/v2', { token, dmId, start });
}

export function requestEditMessage(token: string, messageId: number, message: string) {
  return requestHelper('PUT', '/message/edit/v1', { token, messageId, message });
}

export function requestSendMessages(token: string, channelId: number, message: string) {
  return requestHelper('POST', '/message/send/v1', { token, channelId, message });
}

export function requestSendDm(token: string, channelId: number, message: string) {
  return requestHelper('POST', '/message/send/v1', { token, channelId, message });
}

export function requestDmCreate(token: string, name: string, isPublic: boolean) {
  return requestHelper('POST', '/channels/create/v2', { token, name, isPublic });
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

describe('Error Checking in Send Message v1', () => {
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
      const result = requestSendMessages('-1', channelid, 'Test Message');
      expect(result).toStrictEqual(ERROR);
    });

    test('invalid channel id', () => {
      const channelid = -1;
      const result = requestSendMessages(user.token, channelid, 'Test Message');
      expect(result).toStrictEqual(ERROR);
    });

    test('invalid Message - toolong', () => {
      const result = requestSendMessages(user.token, channelid, 'temp'.repeat(1000));
      expect(result).toStrictEqual(ERROR);
    });

    test('invalid Message - tooshort', () => {
      const result = requestSendMessages(user.token, channelid, '');
      expect(result).toStrictEqual(ERROR);
    });

    test('Authuser not part of channel', () => {
      const result = requestSendMessages(user1.token, channelid, 'Test Message');
      expect(result).toStrictEqual(ERROR);
    });

    test('Valid Test', () => {
      const result = requestSendMessages(user.token, channelid, 'Test Message');
      expect(result).toStrictEqual({ messageId: expect.any(Number) });
    });
});

describe('Error Checking in Edit Message v1', () => {
    interface usr {
        authUserId: number;
        token: string;
    }
    let user: usr;
    let user1: usr;
    let channelid: number;
    let msgId: number;
    beforeEach(() => {
      requestClear();
      user = requestAuthRegister('test@gmail.com', 'test1234', 'test', 'test');
      user1 = requestAuthRegister('user2@gmail.com', 'test1234', 'Hritwik', 'Nauriyal');
      channelid = requestChannelCreate(user.token, 'test', true).channelId;
      msgId = requestSendMessages(user.token, channelid, 'Test').messageId;
    });

    test('invalid authuser id', () => {
      const result = requestEditMessage('-1', msgId, 'Test Message');
      expect(result).toStrictEqual(ERROR);
    });

    test('invalid msg id', () => {
      const result = requestEditMessage(user.token, -1, 'Test Message');
      expect(result).toStrictEqual(ERROR);
    });

    test('invalid Message - toolong', () => {
      const result = requestEditMessage(user.token, msgId, 'temp'.repeat(1000));
      expect(result).toStrictEqual(ERROR);
    });

    test('authUserId is not the sender of the message with ID messageId', () => {
      const result = requestEditMessage(user1.token, msgId, 'Test Message');
      expect(result).toStrictEqual(ERROR);
    });

    test('Valid Test', () => {
      const result = requestEditMessage(user.token, msgId, 'Test Message');
      expect(result).toStrictEqual({});
    });
});

describe('Error Checking in delete Message v1', () => {
    interface usr {
        authUserId: number;
        token: string;
    }
    let user: usr;
    let user1: usr;
    let channelid: number;
    let msgId: number;
    beforeEach(() => {
      requestClear();
      user = requestAuthRegister('test@gmail.com', 'test1234', 'test', 'test');
      user1 = requestAuthRegister('user2@gmail.com', 'test1234', 'Hritwik', 'Nauriyal');
      channelid = requestChannelCreate(user.token, 'test', true).channelId;
      msgId = requestSendMessages(user.token, channelid, 'Test').messageId;
    });

    test('invalid authuser id', () => {
      const result = requestDeleteMessage('-1', msgId);
      expect(result).toStrictEqual(ERROR);
    });

    test('invalid msg id', () => {
      const result = requestDeleteMessage(user.token, -1);
      expect(result).toStrictEqual(ERROR);
    });

    test('authUserId is not the sender of the message with ID messageId', () => {
      const result = requestDeleteMessage(user1.token, msgId);
      expect(result).toStrictEqual(ERROR);
    });

    test('Valid Test', () => {
      const result = requestDeleteMessage(user.token, msgId);
      expect(result).toStrictEqual({});
    });
});

// describe('Error Checking in dm messages v1', () => {
//     interface user {
//         authUserId: number;
//         token: string;
//     }
//     let user: user;
//     let user1: user;
//     let dmid: number;
//     beforeEach (() => {
//         requestClear();
//         user = requestAuthRegister("test@gmail.com", "test1234", "test", "test");
//         user1 = requestAuthRegister("user2@gmail.com", "test1234", "Hritwik", "Nauriyal");
//         dmid = requestDmCreate(user.token, "test", true).dmId;
//     });

//     test('invalid authuser id', () => {
//         const result = requestDmMessages("-1", dmid, 0);
//         expect(result).toStrictEqual(ERROR);
//     });

//     test('invalid dm id', () => {
//         let dmid = -1;
//         const result = requestDmMessages(user.token, dmid, 0);
//         expect(result).toStrictEqual(ERROR);
//     });

//     test('invalid start', () => {
//         const result = requestDmMessages(user.token, dmid, 1);
//         expect(result).toStrictEqual(ERROR);
//     });

//     test('Authuser not part of channel', () => {

//         const result = requestDmMessages(user1.token, dmid, 0);
//         expect(result).toStrictEqual(ERROR);
//     });

//     test('Valid Test', () => {
//         const result = requestDmMessages(user.token, dmid, 0);
//         expect(result).toStrictEqual({messages: [],start: 0, end: -1});
//     });

// });

// describe('Error Checking in Senddm v1', () => {
//     interface user {
//         authUserId: number;
//         token: string;
//     }
//     let user: user;
//     let user1: user;
//     let dmid: number;
//     beforeEach (() => {
//         requestClear();
//         user = requestAuthRegister("test@gmail.com", "test1234", "test", "test");
//         user1 = requestAuthRegister("user2@gmail.com", "test1234", "Hritwik", "Nauriyal");
//         dmid = requestDmCreate(user.token, "test", true).channelId;
//     });

//     test('invalid authuser id', () => {
//         const result = requestSendDm("-1", dmid, "Test Message");
//         expect(result).toStrictEqual(ERROR);
//     });

//     test('invalid channel id', () => {
//         let channelid = -1;
//         const result = requestSendDm(user.token, dmid, "Test Message");
//         expect(result).toStrictEqual(ERROR);
//     });

//     test('invalid Message - toolong', () => {
//         const result = requestSendDm(user.token, dmid, "temp".repeat(1000));
//         expect(result).toStrictEqual(ERROR);
//     });

//     test('invalid Message - tooshort', () => {
//         const result = requestSendDm(user.token, dmid, "");
//         expect(result).toStrictEqual(ERROR);
//     });

//     test('Authuser not part of channel', () => {

//         const result = requestSendDm(user1.token, dmid, "Test Message");
//         expect(result).toStrictEqual(ERROR);
//     });

//     test('Valid Test', () => {
//         const result = requestSendDm(user.token, dmid, "Test Message");
//         expect(result).toStrictEqual({messageId: expect.any(Number)});
//     });

// });
