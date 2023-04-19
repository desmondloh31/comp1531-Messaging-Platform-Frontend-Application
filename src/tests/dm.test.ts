
import request, { HttpVerb } from 'sync-request';
import { port, url } from '../config.json';
const SERVER_URL = `${url}:${port}`;

export function requestChannelInvite(token: string, channelId: number, uId: number) {
  return requestHelper('POST', '/channel/invite/v3', { channelId, uId }, token);
}

export function requestClear() {
  return requestHelper('DELETE', '/clear/v1', {}, '-1');
}

export function requestdmLeave(token: string, dmId: number) {
  return requestHelper('POST', '/dm/leave/v2', { dmId }, token);
}

export function requestDeleteMessage(token: string, messageId: number) {
  return requestHelper('DELETE', '/message/remove/v2', { messageId }, token);
}

export function requestdmDelete(token: string, dmId: number) {
  return requestHelper('DELETE', '/dm/remove/v2', { dmId }, token);
}

export function requestChannelMessages(token: string, channelId: number, start: number) {
  return requestHelper('GET', '/channel/messages/v3', { channelId, start }, token);
}

export function requestDmMessages(token: string, dmId: number, start: number) {
  return requestHelper('GET', '/dm/messages/v2', { dmId, start }, token);
}

export function requestdmDetails(token: string, dmId: number) {
  return requestHelper('GET', '/dm/details/v2', { dmId }, token);
}

export function requestEditMessage(token: string, messageId: number, message: string) {
  return requestHelper('PUT', '/message/edit/v2', { messageId, message }, token);
}

export function requestSendMessages(token: string, channelId: number, message: string) {
  return requestHelper('POST', '/message/send/v2', { channelId, message }, token);
}

export function requestSendDm(token: string, dmId: number, message: string) {
  return requestHelper('POST', '/message/senddm/v2', { dmId, message }, token);
}

export function requestDmCreate(token: string, uIds: number[]) {
  return requestHelper('POST', '/dm/create/v2', { uIds }, token);
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
      expect(result).toStrictEqual(400);
    });

    test('invalid Message - toolong', () => {
      const result = requestSendMessages(user.token, channelid, 'temp'.repeat(1000));
      expect(result).toStrictEqual(400);
    });

    test('invalid Message - tooshort', () => {
      const result = requestSendMessages(user.token, channelid, '');
      expect(result).toStrictEqual(400);
    });

    test('Authuser not part of channel', () => {
      const result = requestSendMessages(user1.token, channelid, 'Test Message');
      expect(result).toStrictEqual(403);
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
      expect(result).toStrictEqual(400);
    });

    test('invalid Message - toolong', () => {
      const result = requestEditMessage(user.token, msgId, 'temp'.repeat(1000));
      expect(result).toStrictEqual(400);
    });

    test('authUserId is not the sender of the message with ID messageId', () => {
      const result = requestEditMessage(user1.token, msgId, 'Test Message');
      expect(result).toStrictEqual(403);
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
      expect(result).toStrictEqual(400);
    });

    test('authUserId is not the sender of the message with ID messageId', () => {
      const result = requestDeleteMessage(user1.token, msgId);
      expect(result).toStrictEqual(403);
    });

    test('Valid Test', () => {
      const result = requestDeleteMessage(user.token, msgId);
      expect(result).toStrictEqual({});
    });
});

describe('Error Checking in dm messages v1', () => {
    interface usr {
        authUserId: number;
        token: string;
    }
    let user: usr;
    let user1: usr;
    let user2: usr;
    let user3: usr;
    let dmid: number;
    beforeEach(() => {
      requestClear();
      user = requestAuthRegister('test@gmail.com', 'test1234', 'test', 'test');
      user1 = requestAuthRegister('user2@gmail.com', 'test1234', 'Hritwik', 'Nauriyal');
      user2 = requestAuthRegister('user3@gmail.com', 'test12344', 'asd', 'asd');
      user3 = requestAuthRegister('user4@gmail.com', 'test12344', 'assd', 'assd');
      dmid = requestDmCreate(user.token, [user2.authUserId, user1.authUserId]).dmId;
    });

    test('invalid authuser id', () => {
      const result = requestDmMessages('-1', dmid, 0);
      expect(result).toStrictEqual(ERROR);
    });

    test('invalid dm id', () => {
      const dmid = -1;
      const result = requestDmMessages(user.token, dmid, 0);
      expect(result).toStrictEqual(400);
    });

    test('invalid start', () => {
      const result = requestDmMessages(user.token, dmid, 1);
      expect(result).toStrictEqual(400);
    });

    test('Authuser not part of channel', () => {
      const result = requestDmMessages(user3.token, dmid, 0);
      expect(result).toStrictEqual(403);
    });

    test('Valid Test', () => {
      const result = requestDmMessages(user1.token, dmid, 0);
      expect(result).toStrictEqual({ messages: [], start: 0, end: -1 });
    });
});

describe('Error Checking in Senddm v1', () => {
    interface usr {
      authUserId: number;
      token: string;
    }
    let user: usr;
    let user1: usr;
    let user2: usr;
    let user3: usr;
    let dmid: number;
    beforeEach(() => {
      requestClear();
      user = requestAuthRegister('test@gmail.com', 'test1234', 'test', 'test');
      user1 = requestAuthRegister('user2@gmail.com', 'test1234', 'Hritwik', 'Nauriyal');
      user2 = requestAuthRegister('user3@gmail.com', 'test12344', 'asd', 'asd');
      user3 = requestAuthRegister('user4@gmail.com', 'test12344', 'assd', 'assd');
      dmid = requestDmCreate(user.token, [user2.authUserId, user1.authUserId]).dmId;
    });

    test('invalid authuser id', () => {
      const result = requestSendDm('-1', dmid, 'Test Message');
      expect(result).toStrictEqual(ERROR);
    });

    test('invalid dm id', () => {
      const result = requestSendDm(user1.token, -1, 'Test Message');
      expect(result).toStrictEqual(400);
    });

    test('invalid Message - toolong', () => {
      const result = requestSendDm(user1.token, dmid, 'temp'.repeat(1000));
      expect(result).toStrictEqual(400);
    });

    test('invalid Message - tooshort', () => {
      const result = requestSendDm(user1.token, dmid, '');
      expect(result).toStrictEqual(400);
    });

    test('Authuser not part of channel', () => {
      const result = requestSendDm(user3.token, dmid, 'Test Message');
      expect(result).toStrictEqual(403);
    });

    test('Valid Test', () => {
      const result = requestSendDm(user1.token, dmid, 'Test Message');
      expect(result).toStrictEqual({ messageId: expect.any(Number) });
    });
});

describe('Error Checking in dmDelete v1', () => {
  interface usr {
    authUserId: number;
    token: string;
  }
  let user: usr;
  let user1: usr;
  let user2: usr;
  let user3: usr;
  let dmid: number;
  beforeEach(() => {
    requestClear();
    user = requestAuthRegister('test@gmail.com', 'test1234', 'test', 'test');
    user1 = requestAuthRegister('user2@gmail.com', 'test1234', 'Hritwik', 'Nauriyal');
    user2 = requestAuthRegister('user3@gmail.com', 'test12344', 'asd', 'asd');
    user3 = requestAuthRegister('user4@gmail.com', 'test12344', 'assd', 'assd');
    dmid = requestDmCreate(user.token, [user2.authUserId, user1.authUserId]).dmId;
  });

  test('invalid authuser id', () => {
    const result = requestdmDelete('-1', dmid);
    expect(result).toStrictEqual(ERROR);
  });

  test('invalid dm id', () => {
    const result = requestdmDelete(user1.token, -1);
    expect(result).toStrictEqual(400);
  });

  test('Authuser not part of channel', () => {
    const result = requestdmDelete(user3.token, dmid);
    expect(result).toStrictEqual(403);
  });

  test('Authuser is not owner of DM', () => {
    const result = requestdmDelete(user1.token, dmid);
    expect(result).toStrictEqual(403);
  });

  test('Valid Test', () => {
    const result = requestdmDelete(user.token, dmid);
    expect(result).toStrictEqual({});
  });
});

describe('Error Checking in dmDetails v1', () => {
  interface usr {
    authUserId: number;
    token: string;
  }
  let user: usr;
  let user1: usr;
  let user2: usr;
  let user3: usr;
  let dmid: number;
  beforeEach(() => {
    requestClear();
    user = requestAuthRegister('test@gmail.com', 'test1234', 'test', 'test');
    user1 = requestAuthRegister('user2@gmail.com', 'test1234', 'Hritwik', 'Nauriyal');
    user2 = requestAuthRegister('user3@gmail.com', 'test12344', 'asd', 'asd');
    user3 = requestAuthRegister('user4@gmail.com', 'test12344', 'assd', 'assd');
    dmid = requestDmCreate(user.token, [user2.authUserId, user1.authUserId]).dmId;
  });

  test('invalid authuser id', () => {
    const result = requestdmDetails('-1', dmid);
    expect(result).toStrictEqual(ERROR);
  });

  test('invalid dm id', () => {
    const result = requestdmDetails(user1.token, -1);
    expect(result).toStrictEqual(400);
  });

  test('Authuser not part of channel', () => {
    const result = requestdmDetails(user3.token, dmid);
    expect(result).toStrictEqual(403);
  });

  test('Valid Test', () => {
    const result = requestdmDetails(user.token, dmid);
    expect(result).toStrictEqual({ name: expect.any(String), members: expect.any(Array) });
  });
});

describe('Error Checking in dmLeave v1', () => {
  interface usr {
    authUserId: number;
    token: string;
  }
  let user: usr;
  let user1: usr;
  let user2: usr;
  let user3: usr;
  let dmid: number;
  beforeEach(() => {
    requestClear();
    user = requestAuthRegister('test@gmail.com', 'test1234', 'test', 'test');
    user1 = requestAuthRegister('user2@gmail.com', 'test1234', 'Hritwik', 'Nauriyal');
    user2 = requestAuthRegister('user3@gmail.com', 'test12344', 'asd', 'asd');
    user3 = requestAuthRegister('user4@gmail.com', 'test12344', 'assd', 'assd');
    dmid = requestDmCreate(user.token, [user2.authUserId, user1.authUserId]).dmId;
  });

  test('invalid authuser id', () => {
    const result = requestdmLeave('-1', dmid);
    expect(result).toStrictEqual(ERROR);
  });

  test('invalid dm id', () => {
    const result = requestdmLeave(user1.token, -1);
    expect(result).toStrictEqual(400);
  });

  test('Authuser not part of channel', () => {
    const result = requestdmLeave(user3.token, dmid);
    expect(result).toStrictEqual(403);
  });

  test('Valid Test', () => {
    const result = requestdmLeave(user1.token, dmid);
    expect(result).toStrictEqual({});
  });
});

describe('Error Checking in message/react/v1', () => {
  interface usr {
    authUserId: number;
    token: string;
  }
  let user: usr;
  let user1: usr;
  let dmid: number;
  let msgId: number;

  beforeEach(() => {
    requestClear();
    user = requestAuthRegister('test@gmail.com', 'test1234', 'test', 'test');
    user1 = requestAuthRegister('user2@gmail.com', 'test1234', 'Hritwik', 'Nauriyal');
    dmid = requestChannelCreate(user.token, 'hello', true).channelId;
    requestChannelInvite(user.token, dmid, user1.authUserId);
    msgId = requestSendMessages(user.token, dmid, 'Test Message').messageId;
  });

  test('invalid messageId', () => {
    const result = requestMessageReact(-1, 1, user1.token);
    expect(result).toEqual(400);
  });

  test('invalid reactId', () => {
    const result = requestMessageReact(msgId, -1, user1.token);
    expect(result).toEqual(400);
  });

  test('msg already has react', () => {
    requestMessageReact(msgId, 1, user1.token);
    const result = requestMessageReact(msgId, 1, user1.token);
    expect(result).toEqual(400);
  });

  test('Valid Test', () => {
    const result = requestMessageReact(msgId, 1, user1.token);
    expect(result).toStrictEqual({});
  });
});

describe('Error Checking in message/unreact/v1', () => {
  interface usr {
    authUserId: number;
    token: string;
  }
  let user: usr;
  let user1: usr;
  let dmid: number;
  let msgId: number;

  beforeEach(() => {
    requestClear();
    user = requestAuthRegister('test@gmail.com', 'test1234', 'test', 'test');
    user1 = requestAuthRegister('user2@gmail.com', 'test1234', 'Hritwik', 'Nauriyal');
    dmid = requestChannelCreate(user.token, 'hello', true).channelId;
    requestChannelInvite(user.token, dmid, user1.authUserId);
    msgId = requestSendMessages(user.token, dmid, 'Test Message').messageId;
    requestMessageReact(msgId, 1, user.token);
  });

  test('invalid messageId', () => {
    const result = requestMessageUnreact(-1, 1, user1.token);
    expect(result).toEqual(400);
  });

  test('invalid reactId', () => {
    const result = requestMessageUnreact(msgId, -1, user1.token);
    expect(result).toEqual(400);
  });

  test('msg already has react', () => {
    requestMessageUnreact(msgId, 1, user1.token);
    const result = requestMessageUnreact(msgId, 1, user1.token);
    expect(result).toEqual(400);
  });

  test('Valid Test', () => {
    const result = requestMessageUnreact(msgId, 1, user.token);
    expect(result).toStrictEqual({});
  });
});

describe('Error Checking in message/pin/v1', () => {
  interface usr {
    authUserId: number;
    token: string;
  }
  let user: usr;
  let user1: usr;
  let dmid: number;
  let msgId: number;

  beforeEach(() => {
    requestClear();
    user = requestAuthRegister('test@gmail.com', 'test1234', 'test', 'test');
    user1 = requestAuthRegister('user2@gmail.com', 'test1234', 'Hritwik', 'Nauriyal');
    dmid = requestChannelCreate(user.token, 'hello', true).channelId;
    requestChannelInvite(user.token, dmid, user1.authUserId);
    msgId = requestSendMessages(user.token, dmid, 'Test Message').messageId;
  });

  test('invalid messageId', () => {
    const result = requestMessagePin(-1, user.token);
    expect(result).toStrictEqual(400);
  });

  test('msg already has pin', () => {
    requestMessagePin(msgId, user.token);
    const result = requestMessagePin(msgId, user.token);
    expect(result).toStrictEqual(400);
  });

  test('user does not have permission', () => {
    const result = requestMessagePin(msgId, user1.token);
    expect(result).toStrictEqual(403);
  });

  test('Valid Test', () => {
    const result = requestMessagePin(msgId, user.token);
    expect(result).toStrictEqual({});
  });
});

describe('Error Checking in message/unpin/v1', () => {
  interface usr {
    authUserId: number;
    token: string;
  }
  let user: usr;
  let user1: usr;
  let dmid: number;
  let msgId: number;

  beforeEach(() => {
    requestClear();
    user = requestAuthRegister('test@gmail.com', 'test1234', 'test', 'test');
    user1 = requestAuthRegister('user2@gmail.com', 'test1234', 'Hritwik', 'Nauriyal');
    dmid = requestChannelCreate(user.token, 'hello', true).channelId;
    requestChannelInvite(user.token, dmid, user1.authUserId);
    msgId = requestSendMessages(user.token, dmid, 'Test Message').messageId;
    requestMessagePin(msgId, user.token);
  });

  test('invalid messageId', () => {
    const result = requestMessageUnpin(-1, user.token);
    expect(result).toStrictEqual(400);
  });

  test('msg already has pin', () => {
    requestMessageUnpin(msgId, user.token);
    const result = requestMessageUnpin(msgId, user.token);
    expect(result).toStrictEqual(400);
  });

  test('user does not have permission', () => {
    const result = requestMessageUnpin(msgId, user1.token);
    expect(result).toStrictEqual(403);
  });

  test('Valid Test', () => {
    const result = requestMessageUnpin(msgId, user.token);
    expect(result).toStrictEqual({});
  });
});
