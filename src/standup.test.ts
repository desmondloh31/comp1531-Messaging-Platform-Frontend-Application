import request, { HttpVerb } from 'sync-request';
import { port, url } from './config.json';
// import { requestDmCreate } from './tests/dm.test';

const SERVER_URL = `${url}:${port}`;

function requeststandupActive(token: string, channelId: number) {
  return requestHelper('GET', '/standup/active/v1', { channelId }, token);
}

function requeststandupStart(token: string, channelId: number, length: number) {
  return requestHelper('POST', '/standup/start/v1', { channelId, length }, token);
}

function requeststandupSend(token: string, channelId: number, message: string) {
  return requestHelper('POST', '/standup/send/v1', { channelId, message }, token);
}

function requestNotifications(token: string, oldestNotificationId?: number) {
  return requestHelper('GET', '/notifications/get/v1', { oldestNotificationId }, token);
}

function requestSearch(token: string, queryStr: string) {
  return requestHelper('GET', '/search/v1', { queryStr }, token);
}

function requestdmCreate(token: string, uIds: number[]) {
  return requestHelper('POST', '/dm/create/v1', { uIds }, token);
}

function requestMessageSend(token: string, channelId: number, message: string) {
  return requestHelper('POST', '/message/send/v2', { channelId, message }, token);
}

function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  return requestHelper('POST', '/auth/register/v3', { email, password, nameFirst, nameLast }, '-1');
}

function requestChannelscreate(token: string, name: string, isPublic: boolean) {
  return requestHelper('POST', '/channels/create/v3', { name, isPublic }, token);
}

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
    let user2: usr;
    let channel1: number;
    // let channel2: number;
    let dmChannel1: number;
    beforeEach(() => {
      requestClear();
      user1 = requestAuthRegister('wrongemail@gmail.com', 'badpassword', 'wrong', 'email');
      user2 = requestAuthRegister('testemail@gmail.com', 'password', 'pass', 'word');
      channel1 = requestChannelscreate(user1.token, 'test', true).channelId;
      // channel2 = requestChannelscreate(user1.token, 'test2', true).channelId;
      dmChannel1 = requestdmCreate(user1.token, [user2.authUserId]).channelId;
      requestMessageSend(user1.token, channel1, 'Test message one');
      requestMessageSend(user2.token, channel1, 'Test message two');
      requestMessageSend(user1.token, dmChannel1, 'Direct message one');
      requestMessageSend(user2.token, dmChannel1, 'Direct message two');
    });

    test('returns messages containing query substring', () => {
      const { messages } = requestSearch(user1.token, 'message');
      expect(messages).toEqual([]);
    });

    test('returns empty array if no messages contain query substring', () => {
      const { messages } = requestSearch(user1.token, 'somethingelse');
      expect(messages).toHaveLength(0);
    });

    test('throws HttpError if queryStr is less than 1 character', () => {
      const result = requestSearch(user1.token, '');
      expect(result).toBe(400);
    });

    test('throws HttpError if queryStr is over 1000 characters', () => {
      const longQueryStr = 'a'.repeat(1001);
      const result = requestSearch(user1.token, longQueryStr);
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
    const notifications = requestNotifications(user1.token).notifications;
    // Create 25 notifications and verify that the first 20 are returned by the function
    const numNotifications = 25;
    const messages = Array.from({ length: numNotifications }, (_, i) => `notification ${i + 1}`);
    messages.forEach((message) => {
      requestHelper('POST', '/message/send/v2', { channelId: channel1, message }, user1.token);
    });

    const expectedNotifications = messages
      .reverse()
      .slice(0, 20)
      .map((message, i) => ({ notificationId: numNotifications - i, message, timestamp: expect.any(Number) }));

    expect(notifications).toEqual(expectedNotifications);
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
      requestChannelscreate(user2.token, 'test 2', true);
    });

    test('returns true for an active standup period', () => {
      // requeststandupStart(user1.token, channel1, 60);
      const { isActive, timeFinish } = requeststandupActive(user1.token, channel1);
      expect(isActive).toBe(true);
      expect(timeFinish).toBeDefined();
      const now = Date.now();
      const expectedFinishTime = Math.floor(now / 1000) + 60;
      expect(timeFinish).toBeGreaterThanOrEqual(expectedFinishTime - 1);
      expect(timeFinish).toBeLessThanOrEqual(expectedFinishTime + 1);
    });

    test('returns false for an inactive standup period', () => {
      const { isActive, timeFinish } = requeststandupActive(user1.token, channel1);
      expect(isActive).toBe(false);
      expect(timeFinish).toBeNull();
    });

    test('throws error for invalid channelId', () => {
      const result = requeststandupActive(user1.token, -12345);
      expect(result).toBe(400);
    });

    test('user is not a member of channel', () => {
      const result = requeststandupActive(user2.token, channel1);
      expect(result).toEqual(403);
    });
});
