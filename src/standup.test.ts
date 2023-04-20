import request, { HttpVerb } from 'sync-request';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;

function requeststandupActive(token: string, channelId: number) {
  return requestHelper('GET', '/standup/active/v1', { token, channelId }, token);
}

function requeststandupStart(token: string, channelId: number, length: number) {
  return requestHelper('POST', '/standup/start/v1', { token, channelId, length }, token);
}

function requeststandupSend(token: string, channelId: number, message: string) {
  return requestHelper('POST', '/standup/send/v1', { token, channelId, message }, token);
}

function requestNotifications(token: string, oldestNotificationId?: number) {
  return requestHelper('GET', '/notifications/get/v1', { token, oldestNotificationId }, token);
}

function requestSearch(queryStr: string) {
  return requestHelper('GET', '/search/v1', { queryStr }, '-1');
}

function requestMessageSend(token: string, channelId: number, message: string) {
  return requestHelper('POST', '/message/send/v2', { token, channelId, message }, token);
}

function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  return requestHelper('POST', '/auth/register/v3', { email, password, nameFirst, nameLast }, '-1');
}

function requestChannelscreate(token: string, name: string, isPublic: boolean) {
  return requestHelper('POST', '/channels/create/v3', { token, name, isPublic }, token);
}

// function requestChannelDetails(token: string, channelId: number) {
//   return requestHelper('GET', '/channel/details/v2', { token, channelId }, token);
// }

function requestClear() {
  return requestHelper('DELETE', '/clear/v1', {}, '-1');
}
// Helper Functionthe tok
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
    json = payload;
  }
  const res = request(method, SERVER_URL + path, { qs, headers, json, timeout: 20000 });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.body as string);
}


// testing searchV1:
describe('testing SearchV1', () => {
    interface usr {
      authUserId: number;
      token: string;
    }
    let user1: usr;
    let channel1: number;
    beforeEach(() => {
      requestClear();
      user1 = requestAuthRegister('wrongemail@gmail.com', 'badpassword', 'wrong', 'email');
      channel1 = requestChannelscreate(user1.token, 'test', true).channelId;
    });
    test('returns messages containing query substring', () => {
      requestMessageSend(user1.token, channel1, 'hello world');
      requestMessageSend(user1.token, channel1, 'test case');
      const result = requestSearch('test');
      expect(result.messages).toEqual([
        { messageId: 2, senderId: user1.authUserId, message: 'test case', timeSent: expect.any(Number) },
      ]);
    });

    test('returns empty array if no messages contain query substring', () => {
      requestMessageSend(user1.token, channel1, 'hello world');
      requestMessageSend(user1.token, channel1, 'test case');
      const result = requestSearch('foo');
      expect(result.messages).toEqual([]);
    });

    test('throws HttpError if queryStr is less than 1 character', () => {
      const result = requestSearch('');
      expect(result).toBe(400);
    });

    test('throws HttpError if queryStr is over 1000 characters', () => {
      const result = requestSearch('a'.repeat(1001));
      expect(result).toBe(400);
    });
});

// testing getNotificationsV1:
describe('testing getNotificationsV1', () => {
    interface usr {
      authUserId: number;
      token: string;
    }
    let user1: usr;
    let channel1: number;
    beforeEach(() => {
      requestClear();
      user1 = requestAuthRegister('wrongemail@gmail.com', 'badpassword', 'wrong', 'email');
      channel1 = requestChannelscreate(user1.token, 'test', true).channelId;
    });

    test('function return 20 most recent notifications', () => {
      for (let i = 1; i <= 25; i++) {
        requestMessageSend(user1.token, channel1, 'test 1');
        const result = requestNotifications(user1.token);
        expect((result)).toEqual({
          notifications: []
        });
      }
    });
});

// testing standupSendV1:
describe('testing standupSendV1', () => {
    interface usr {
      authUserId: number;
      token: string;
    }
    let user1: usr;
    let user2: usr;
    let channel1: number;
    beforeEach(() => {
      requestClear();
      user1 = requestAuthRegister('wrongemail@gmail.com', 'badpassword', 'wrong', 'email');
      user2 = requestAuthRegister('testtest@gmail.com', 'badpassword', 'wrong1', 'email1');
      channel1 = requestChannelscreate(user1.token, 'test', true).channelId;
    });

    test('should send a message to a running standup', () => {
      requeststandupStart(user1.token, channel1, 60);
      const result = requeststandupSend(user1.token, channel1, 'Test message');
      expect(result).toEqual({});
    });

    test('channelId is invalid', () => {
      const result = requeststandupSend(user1.token, -123, 'Test message');
      expect(result).toBe(400);
    });

    test('length of message is over 1000', () => {
      const messageOverLength = 'a'.repeat(1001);
      const result = requeststandupSend(user1.token, channel1, messageOverLength);
      expect(result).toBe(400);
    });

    test('an active standup is not currently running', () => {
      expect(requeststandupActive(user1.token, channel1)).toEqual({ isActive: false, timeFinish: null });
      const result = requeststandupSend(user1.token, channel1, 'Test message');
      expect(result).toBe(400);
    });

    test('user is not a member of the channel', () => {
      const result = requeststandupSend(user2.token, channel1, 'test message');
      expect(result).toBe(403);
    });
});

// testing standupStartV1:
describe('testing standupStartV1', () => {
    interface usr {
        authUserId: number;
        token: string;
      }
    let user1: usr;
    let user2: usr;
    let channel1: number;
    beforeEach(() => {
      requestClear();
      user1 = requestAuthRegister('wrongemail@gmail.com', 'badpassword', 'wrong', 'email');
      user2 = requestAuthRegister('testtest@gmail.com', 'badpassword', 'wrong1', 'email1');
      channel1 = requestChannelscreate(user1.token, 'test', true).channelId;
    });

    test('testing if standup manages to start', () => {
      const result = requeststandupStart(user1.token, channel1, 5);
      expect(result.timeFinish).toEqual(expect.any(Number));
      expect(result.timeFinish).toBeGreaterThan(Math.floor(Date.now() / 1000));
      expect(result.timeFinish).toBeLessThanOrEqual(Math.floor(Date.now() / 1000) + 5);
    });

    test('channelId is invalid', () => {
      // raise error 400 in HTTP: Bad Request
      const result = requeststandupStart(user1.token, -999, 10);
      expect(result).toBe(400);
    });

    test('testing if length is a negative integaer', () => {
      // raise error 400 in HTTP: Bad Request
      const result = requeststandupStart(user1.token, channel1, -10);
      expect(result).toBe(400);
    });

    test('testing if an active standup is currently running in the channel', () => {
      requeststandupStart(user1.token, channel1, 10);
      const result = requeststandupStart(user1.token, channel1, 5);
      expect(result).toBe(400);
    });

    test('testing if user is not a member of the channel', () => {
      const result = requeststandupStart(user2.token, channel1, 10);
      expect(result).toBe(403);
    });
});

// testing standupActiveV1:
describe('testing standupActiveV1', () => {
    interface usr {
        authUserId: number;
        token: string;
      }
    let user1: usr;
    let user2: usr;
    let channel1: number;
    beforeEach(() => {
      requestClear();
      user1 = requestAuthRegister('wrongemail@gmail.com', 'badpassword', 'wrong', 'email');
      user2 = requestAuthRegister('testtest@gmail.com', 'badpassword', 'wrong1', 'email1');
      channel1 = requestChannelscreate(user1.token, 'test', true).channelId;
    });

    test('returns true for an active standup period', () => {
      requeststandupStart(user1.token, channel1, 60);
      requeststandupSend(user1.token, channel1, 'test message');
  
      const result = requeststandupActive(user1.token, channel1);
      console.log(result);
      expect(result.isActive).toEqual(true);
      expect(result.timeFinish).not.toEqual(null);
    
    });

    test('returns false for an inactive standup period', () => {
      const result = requeststandupActive(user1.token, channel1);
      expect(result.isActive).toEqual(false);
      expect(result.timeFinish).toEqual(null);
    });

    test('throws error for invalid channelId', () => {
      const result = requeststandupActive(user1.token, -999);
      expect(result).toEqual(400);
      try {
        requeststandupActive(user1.token, -999);
      } catch (error) {
        expect(error.statusCode).toEqual(400);
      }
    });

    test('user is not a member of channel', () => {
      const result = requeststandupActive(user2.token, channel1);
      expect(result).toEqual(403);
    });
});
