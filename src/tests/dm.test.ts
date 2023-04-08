import request, { HttpVerb } from 'sync-request';
import { port, url } from '../config.json';
const SERVER_URL = `${url}:${port}`;

export function requestChannelInvite(token: string, channelId: number, uId: number) {
  return requestHelper('POST', '/channel/invite/v2', { token, channelId, uId });
}

export function requestClear() {
  return requestHelper('DELETE', '/clear/v1', {});
}

export function requestdmLeave(token: string, dmId: number) {
  return requestHelper('POST', '/dm/leave/v1', { token, dmId });
}

export function requestDeleteMessage(token: string, messageId: number) {
  return requestHelper('DELETE', '/message/remove/v1', { token, messageId });
}

export function requestdmDelete(token: string, dmId: number) {
  return requestHelper('DELETE', '/dm/remove/v1', { token, dmId });
}

export function requestChannelMessages(token: string, channelId: number, start: number) {
  return requestHelper('GET', '/channel/messages/v2', { token, channelId, start });
}

export function requestDmMessages(token: string, dmId: number, start: number) {
  return requestHelper('GET', '/dm/messages/v1', { token, dmId, start });
}

export function requestdmDetails(token: string, dmId: number) {
  return requestHelper('GET', '/dm/details/v1', { token, dmId });
}

export function requestEditMessage(token: string, messageId: number, message: string) {
  return requestHelper('PUT', '/message/edit/v1', { token, messageId, message });
}

export function requestSendMessages(token: string, channelId: number, message: string) {
  return requestHelper('POST', '/message/send/v1', { token, channelId, message });
}

export function requestSendDm(token: string, dmId: number, message: string) {
  return requestHelper('POST', '/message/senddm/v1', { token, dmId, message });
}

export function requestDmCreate(token: string, uIds: number[]) {
  return requestHelper('POST', '/dm/create/v1', { token, uIds });
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

describe('Error Checking in dm messages v1', () => {
    interface user {
        authUserId: number;
        token: string;
    }
    let user: user;
    let user1: user;
    let user2: user;
    let user3: user;
    let dmid: number;
    beforeEach (() => {
        requestClear();
        user = requestAuthRegister("test@gmail.com", "test1234", "test", "test");
        user1 = requestAuthRegister("user2@gmail.com", "test1234", "Hritwik", "Nauriyal");
        user2 = requestAuthRegister("user3@gmail.com", "test12344", "asd", "asd");
        user3 = requestAuthRegister("user4@gmail.com", "test12344", "assd", "assd");
        dmid = requestDmCreate(user.token , [user2.authUserId, user1.authUserId]).dmId;
    });

    test('invalid authuser id', () => {
        const result = requestDmMessages("-1", dmid, 0);
        expect(result).toStrictEqual(ERROR);
    });

    test('invalid dm id', () => {
        let dmid = -1;
        const result = requestDmMessages(user.token, dmid, 0);
        expect(result).toStrictEqual(ERROR);
    });

    test('invalid start', () => {
        const result = requestDmMessages(user.token, dmid, 1);
        expect(result).toStrictEqual(ERROR);
    });

    test('Authuser not part of channel', () => {

        const result = requestDmMessages(user3.token, dmid, 0);
        expect(result).toStrictEqual(ERROR);
    });

    test('Valid Test', () => {
        const result = requestDmMessages(user1.token, dmid, 0);
        expect(result).toStrictEqual({messages: [],start: 0, end: -1});
    });

});

describe('Error Checking in Senddm v1', () => {
    interface user {
      authUserId: number;
      token: string;
    }
    let user: user;
    let user1: user;
    let user2: user;
    let user3: user;
    let dmid: number;
    beforeEach (() => {
        requestClear();
        user = requestAuthRegister("test@gmail.com", "test1234", "test", "test");
        user1 = requestAuthRegister("user2@gmail.com", "test1234", "Hritwik", "Nauriyal");
        user2 = requestAuthRegister("user3@gmail.com", "test12344", "asd", "asd");
        user3 = requestAuthRegister("user4@gmail.com", "test12344", "assd", "assd");
        dmid = requestDmCreate(user.token , [user2.authUserId, user1.authUserId]).dmId;
    });

    test('invalid authuser id', () => {
        const result = requestSendDm("-1", dmid, "Test Message");
        expect(result).toStrictEqual(ERROR);
    });

    test('invalid dm id', () => {
        const result = requestSendDm(user1.token, -1, "Test Message");
        expect(result).toStrictEqual(ERROR);
    });

    test('invalid Message - toolong', () => {
        const result = requestSendDm(user1.token, dmid, "temp".repeat(1000));
        expect(result).toStrictEqual(ERROR);
    });

    test('invalid Message - tooshort', () => {
        const result = requestSendDm(user1.token, dmid, "");
        expect(result).toStrictEqual(ERROR);
    });

    test('Authuser not part of channel', () => {

        const result = requestSendDm(user3.token, dmid, "Test Message");
        expect(result).toStrictEqual(ERROR);
    });

    test('Valid Test', () => {
      const result = requestSendDm(user1.token, dmid, "Test Message");
      expect(result).toStrictEqual({messageId: expect.any(Number)});
    });

});

describe('Error Checking in dmDelete v1', () => { 
  interface user {
    authUserId: number;
    token: string;
  }
  let user: user;
  let user1: user;
  let user2: user;
  let user3: user;
  let dmid: number;
  beforeEach (() => {
      requestClear();
      user = requestAuthRegister("test@gmail.com", "test1234", "test", "test");
      user1 = requestAuthRegister("user2@gmail.com", "test1234", "Hritwik", "Nauriyal");
      user2 = requestAuthRegister("user3@gmail.com", "test12344", "asd", "asd");
      user3 = requestAuthRegister("user4@gmail.com", "test12344", "assd", "assd");
      dmid = requestDmCreate(user.token , [user2.authUserId, user1.authUserId]).dmId;
  });

  test('invalid authuser id', () => {
    const result = requestdmDelete("-1", dmid);
    expect(result).toStrictEqual(ERROR);
  });

  test('invalid dm id', () => {
    const result = requestdmDelete(user1.token, -1);
    expect(result).toStrictEqual(ERROR);
  })

  test('Authuser not part of channel', () => {
    const result = requestdmDelete(user3.token, dmid);
    expect(result).toStrictEqual(ERROR);
  })

  test('Authuser is not owner of DM', () => {
    const result = requestdmDelete(user1.token, dmid);
    expect(result).toStrictEqual(ERROR);
  })

  test('Valid Test', () => {
    const result = requestdmDelete(user.token, dmid);
    expect(result).toStrictEqual({});
  });
})

describe('Error Checking in dmDetails v1', () => {
  interface user {
    authUserId: number;
    token: string;
  }
  let user: user;
  let user1: user;
  let user2: user;
  let user3: user;
  let dmid: number;
  beforeEach (() => {
      requestClear();
      user = requestAuthRegister("test@gmail.com", "test1234", "test", "test");
      user1 = requestAuthRegister("user2@gmail.com", "test1234", "Hritwik", "Nauriyal");
      user2 = requestAuthRegister("user3@gmail.com", "test12344", "asd", "asd");
      user3 = requestAuthRegister("user4@gmail.com", "test12344", "assd", "assd");
      dmid = requestDmCreate(user.token , [user2.authUserId, user1.authUserId]).dmId;
  });

  test('invalid authuser id', () => {
    const result = requestdmDetails("-1", dmid);
    expect(result).toStrictEqual(ERROR);
  });

  test('invalid dm id', () => {
    const result = requestdmDetails(user1.token, -1);
    expect(result).toStrictEqual(ERROR);
  })

  test('Authuser not part of channel', () => {
    const result = requestdmDetails(user3.token, dmid);
    expect(result).toStrictEqual(ERROR);
  })

  test('Valid Test', () => {
    const result = requestdmDetails(user.token, dmid);
    expect(result).toStrictEqual({name: expect.any(String), members: expect.any(Array)});
  });

})

describe ('Error Checking in dmLeave v1', () => {
  interface user {
    authUserId: number;
    token: string;
  }
  let user: user;
  let user1: user;
  let user2: user;
  let user3: user;
  let dmid: number;
  beforeEach (() => {
      requestClear();
      user = requestAuthRegister("test@gmail.com", "test1234", "test", "test");
      user1 = requestAuthRegister("user2@gmail.com", "test1234", "Hritwik", "Nauriyal");
      user2 = requestAuthRegister("user3@gmail.com", "test12344", "asd", "asd");
      user3 = requestAuthRegister("user4@gmail.com", "test12344", "assd", "assd");
      dmid = requestDmCreate(user.token , [user2.authUserId, user1.authUserId]).dmId;
  });

  test('invalid authuser id', () => {
    const result = requestdmLeave("-1", dmid);
    expect(result).toStrictEqual(ERROR);
  });

  test('invalid dm id', () => {
    const result = requestdmLeave(user1.token, -1);
    expect(result).toStrictEqual(ERROR);
  })

  test('Authuser not part of channel', () => {
    const result = requestdmLeave(user3.token, dmid);
    expect(result).toStrictEqual(ERROR);
  });

  test('Valid Test', () => {
    const result = requestdmLeave(user1.token, dmid);
    expect(result).toStrictEqual({});
  });
  
})
