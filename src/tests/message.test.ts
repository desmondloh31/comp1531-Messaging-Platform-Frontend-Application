import request, { HttpVerb } from 'sync-request';
import { port, url } from '../config.json';
const SERVER_URL = `${url}:${port}`;

export function requestChannelInvite(token: string, channelId: number, uId: number) {
  return requestHelper('POST', '/channel/invite/v2', { channelId, uId }, token);
}

export function requestClear() {
  return requestHelper('DELETE', '/clear/v1', {}, '-1');
}

export function requestdmLeave(token: string, dmId: number) {
  return requestHelper('POST', '/dm/leave/v1', { dmId }, token);
}

export function requestDeleteMessage(token: string, messageId: number) {
  return requestHelper('DELETE', '/message/remove/v1', { messageId }, token);
}

export function requestdmDelete(token: string, dmId: number) {
  return requestHelper('DELETE', '/dm/remove/v1', { dmId }, token);
}

export function requestChannelMessages(token: string, channelId: number, start: number) {
  return requestHelper('GET', '/channel/messages/v2', { channelId, start }, token);
}

export function requestDmMessages(token: string, dmId: number, start: number) {
  return requestHelper('GET', '/dm/messages/v1', { dmId, start }, token);
}

export function requestdmDetails(token: string, dmId: number) {
  return requestHelper('GET', '/dm/details/v1', { dmId }, token);
}

export function requestEditMessage(token: string, messageId: number, message: string) {
  return requestHelper('PUT', '/message/edit/v1', { messageId, message }, token);
}

export function requestSendMessages(token: string, channelId: number, message: string) {
  return requestHelper('POST', '/message/send/v1', { channelId, message }, token);
}

export function requestSendDm(token: string, dmId: number, message: string) {
  return requestHelper('POST', '/message/senddm/v1', { dmId, message }, token);
}

export function requestDmCreate(token: string, uIds: number[]) {
  return requestHelper('POST', '/dm/create/v1', { uIds }, token);
}

export function requestChannelCreate(token: string, name: string, isPublic: boolean) {
  return requestHelper('POST', '/channels/create/v2', { name, isPublic }, token);
}

export function requestChannelJoin(token: string, channelId: number) {
  return requestHelper('POST', '/channel/join/v2', { channelId }, token);
}

export function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  return requestHelper('POST', '/auth/register/v2', { email, password, nameFirst, nameLast }, '-1');
}

export function requestMessageReact(messageId: number, reactId: number, token: string) {
  return requestHelper('POST', '/message/react/v1', { messageId, reactId }, token);
}

export function requestMessageUnreact(messageId: number, reactId: number, token: string) {
  return requestHelper('POST', '/message/unreact/v1', { messageId, reactId }, token);
}

export function requestMessagePin(messageId: number, token: string) {
  return requestHelper('POST', '/message/pin/v1', { messageId }, token);
}

export function requestMessageUnpin(messageId: number, token: string) {
  return requestHelper('POST', '/message/unpin/v1', { messageId }, token);
}

export function requestMessageShare(ogMessageId: number, message: string, channelId: number, dmId: number, token: string) {
  return requestHelper('POST', '/message/share/v1', { channelId, ogMessageId, message, dmId }, token);
}

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

const ERROR = { error: expect.any(String) };

describe('message/share/v1', () => {
  interface usr {
    authUserId: number;
    token: string;
  }
  let user: usr;
  let user1: usr;
  let cnid: number;
  let cnid2: number;
  let cnid3: number;
  let msgId: number;
  let dmId: number;

  beforeEach(() => {
    requestClear();
    user = requestAuthRegister('test@gmail.com', 'test1234', 'test', 'test');
    user1 = requestAuthRegister('user2@gmail.com', 'test1234', 'Hritwik', 'Nauriyal');
    cnid = requestChannelCreate(user.token, 'hello', true).channelId;
    cnid2 = requestChannelCreate(user1.token, 'hello2', true).channelId;
    cnid3 = requestChannelCreate(user1.token, 'hello3', true).channelId;
    requestChannelJoin(user.token, cnid2);
    dmId = requestDmCreate(user.token, [user1.authUserId]).dmId;
    msgId = requestSendMessages(user.token, cnid, 'Test Message').messageId;
  });

  test('invalid channelId and dmId', () => {
    const result = requestMessageShare(msgId, 'template', -1, -1, user.token);
    expect(result).toEqual(400);
  });

  test('ogMessageId does not refer to a valid message', () => {
    const result = requestMessageShare(-1, 'template', cnid2, -1, user.token);
    expect(result).toEqual(400);
  });

  test('neither channelId nor dmId are -1', () => {
    const result = requestMessageShare(msgId, 'template', cnid2, dmId, user.token);
    expect(result).toEqual(400);
  });

  test('length of optional message is more than a 1000 characters', () => {
    const result = requestMessageShare(msgId, 'temp'.repeat(1000), cnid2, -1, user.token);
    expect(result).toEqual(400);
  });

  test('authorised user has not joined -- are trying to share the message to', () => {
    const result = requestMessageShare(msgId, 'template', cnid3, -1, user.token);
    expect(result).toEqual(403);
  });

  test('Valid test', () => {
    const result = requestMessageShare(msgId, 'template', cnid2, -1, user.token);
    expect(result).toEqual({ sharedMessageId: expect.any(Number) });
  });
});
