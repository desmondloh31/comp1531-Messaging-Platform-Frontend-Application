
import request, { HttpVerb } from 'sync-request';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;

function requestChannelleavev1(token: string, channelId: number) {
  return requestHelper('POST', '/channel/leave/v2', { channelId }, token);
}

function requestChanneladdowner(token: string, channelId: number, uId: number) {
  return requestHelper('POST', '/channel/addowner/v2', { channelId, uId }, token);
}

function requestChannelremoveowner(token: string, channelId: number, uId: number) {
  return requestHelper('POST', '/channel/removeowner/v2', { channelId, uId }, token);
}

function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  return requestHelper('POST', '/auth/register/v3', { email, password, nameFirst, nameLast }, '-1');
}

function requestChannelscreate(token: string, name: string, isPublic: boolean) {
  return requestHelper('POST', '/channels/create/v3', { name, isPublic }, token);
}

// function requestChannelDetails(token: string, channelId: number) {
//   return requestHelper('GET', '/channel/details/v2', { token, channelId });
// }

// function requestChannelMessages(token: string, channelId: number, start: number) {
//   return requestHelper('GET', '/channel/messages/v2', { token, channelId, start });
// }

function requestChannelJoin(token: string, channelId: number) {
  return requestHelper('POST', '/channel/join/v3', { channelId }, token);
}

// function requestChannelInvite(token: string, channelId: number, uId: number) {
//   return requestHelper('POST', '/channel/invite/v2', { token, channelId, uId });
// }

function requestClear() {
  return requestHelper('DELETE', '/clear/v1', {}, '-1');
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
    json = payload;
  }
  const res = request(method, SERVER_URL + path, { qs, headers, json, timeout: 20000 });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.body as string);
}
// IT2 testing /channel/leave/v1:
describe('Testing channelLeaveV1', () => {
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

  test('allowing a member of a channel to leave the channel', () => {
    const result = requestChannelleavev1(user1.token, channel1);
    expect(result).toEqual({});
  });

  test('token generated is invalid', () => {
    const result = requestChannelleavev1('wrong token', channel1);
    expect(result).toEqual({ error: 'token is invalid' });
  });

  test('channelId does not refer to a valid channel', () => {
    const result = requestChannelleavev1(user1.token, -1);
    expect(result).toEqual(400);
  });

  test('user is not a member of the channel', () => {
    const result = requestChannelleavev1(user2.token, channel1);
    expect(result).toEqual(403);
  });
});

// IT2 testing /channel/addowner/v1:
describe('Testing the addowner function', () => {
  interface usr {
    authUserId: number;
    token: string;
  }
  let user1: usr;
  let user2: usr;
  let user3: usr;
  let channel1: number;
  let channel2: number;

  beforeEach(() => {
    requestClear();
    user1 = requestAuthRegister('wrongemail@gmail.com', 'badpassword', 'wrong', 'email');
    user2 = requestAuthRegister('wronge3mail@gmail.com', 'badpassword', 'wrong', 'email');
    user3 = requestAuthRegister('wronge2mail@gmail.com', 'badpassword', 'wrong2', 'email2');
    channel1 = requestChannelscreate(user1.token, 'test', true).channelId;
    channel2 = requestChannelscreate(user2.token, 'test1', false).channelId;
  });

  test('Adding a user as an owner to the channel', () => {
    requestChannelJoin(user2.token, channel1);
    const result = requestChanneladdowner(user1.token, channel1, user2.authUserId);
    expect(result).toEqual({});
  });

  test('should return error with invalid token', () => {
    requestChannelJoin(user2.token, channel1);
    const result = requestChanneladdowner('not a string', channel1, user2.authUserId);
    expect(result).toEqual({ error: 'token is invalid' });
  });

  test('should return error with invalid channelId', () => {
    const result = requestChanneladdowner(user1.token, -1, user2.authUserId);
    expect(result).toEqual(400);
  });

  test('should return error with invalid uId', () => {
    const result = requestChanneladdowner(user1.token, channel1, -1);
    expect(result).toEqual({ error: 'user is not valid' });
  });

  test('should return error with uId not in channel', () => {
    const result = requestChanneladdowner(user1.token, channel1, user2.authUserId);
    expect(result).toEqual(400);
  });

  test('should return error with uId already an owner', () => {
    const result = requestChanneladdowner(user2.token, channel2, user2.authUserId);
    expect(result).toEqual(400);
  });

  test('should return error with user without owner permissions', () => {
    requestChannelJoin(user2.token, channel1);
    const result = requestChanneladdowner(user3.token, channel1, user2.authUserId);
    expect(result).toEqual(403);
  });
});

// IT2 testing /channel/removeowner/v1:
describe('Testing the removeowner function', () => {
  interface usr {
    authUserId: number;
    token: string;
  }
  let user1: usr;
  let user2: usr;
  let user3: usr;
  let channel1: number;

  beforeEach(() => {
    requestClear();
    user1 = requestAuthRegister('wrongemail@gmail.com', 'badpassword', 'wrong', 'email');
    user2 = requestAuthRegister('wronge3mail@gmail.com', 'badpassword', 'wrong', 'email');
    user3 = requestAuthRegister('wronge2mail@gmail.com', 'badpassword', 'wrong2', 'email2');
    channel1 = requestChannelscreate(user1.token, 'test', true).channelId;
  });

  test('removing an owner from the channel', () => {
    requestChannelJoin(user2.token, channel1);
    const result = requestChannelremoveowner(user1.token, channel1, user2.authUserId);
    expect(result).toEqual({});
  });

  test('should return error with invalid token', () => {
    requestChannelJoin(user2.token, channel1);
    const result = requestChannelremoveowner('not a string', channel1, user2.authUserId);
    expect(result).toEqual({ error: 'token is invalid' });
  });

  test('should return error with invalid channelId', () => {
    const result = requestChanneladdowner(user1.token, -1, user2.authUserId);
    expect(result).toEqual(400);
  });

  test('should return error with invalid uId', () => {
    const result = requestChannelremoveowner(user1.token, channel1, -1);
    expect(result).toEqual({ error: 'user is not valid' });
  });

  test('should return error with uId not in channel', () => {
    const result = requestChannelremoveowner(user1.token, channel1, user2.authUserId);
    expect(result).toEqual(400);
  });

  test('should return error with user without owner permissions', () => {
    requestChannelJoin(user2.token, channel1);
    const result = requestChannelremoveowner(user3.token, channel1, user2.authUserId);
    expect(result).toEqual(403);
  });
});

// testing channelDetails:
// describe('Testing channelDetails Final Test batch', () => {
//   beforeEach(() => {
//     requestClear();
//   });
//   test('testing if authUserId is not valid', () => {
//     const user = requestAuthRegister('desmondloh@gmail.com', 'sdfsdfsdf', 'desmond', 'loh');
//     const channel = requestChannelscreate(user.token, 'test1', false);
//     const result = requestChannelDetails('asdas', channel.channelId);
//     expect(result).toEqual({ error: 'authUserId is invalid' });
//   });
//   test('testing if authUserId and channelId are valid', () => {
//     const userID = requestAuthRegister('desmondloh@gmail.com', 'sdfsdfsdf', 'desmond', 'loh');
//     const channel1 = requestChannelscreate(userID.token, 'channel1', false);
//     const result = requestChannelDetails(userID.token, channel1.channelId);
//     expect(result).toEqual({ allMembers: [0], isPublic: false, name: 'channel1', ownerMembers: [0] });
//   });
//   test('testing if channelId is not valid', () => {
//     const user = requestAuthRegister('desmondloh@gmail.com', 'sdfsdfsdf', 'desmond', 'loh');
//     const result = requestChannelDetails(user.token, -1);
//     expect(result).toEqual({ error: 'channelId is invalid' });
//   });
//   test('testing if channelId is valid but authuser is not a part of the channel', () => {
//     const user1 = requestAuthRegister('desmondloh@gmail.com', 'sdfsdfsdf', 'desmond', 'loh');
//     const user2 = requestAuthRegister('kavish@gmail.com', 'abc12asd3', 'Kavish', 'Smith');
//     const channel1 = requestChannelscreate(user1.token, 'channel1', false);
//     const result = requestChannelDetails(user2.token, channel1.channelId);
//     expect(result).toEqual({ error: 'User is not a part of the channel or invalid channelId' });
//   });
// });

const ERROR = { error: expect.any(String) };

// describe('Error Checking in channel invite v1', () => {
//   interface usr {
//       authUserId: number;
//       token: string;
//   }
//   let user: usr;
//   let user1: usr;
//   let user2: usr;
//   let user3: usr;
//   let channelid: number;
//   beforeEach(() => {
//     requestClear();

//     user = requestAuthRegister('test@gmail.com', 'test12345', 'test', 'test');
//     user1 = requestAuthRegister('test1@gmail.com', 'test12344', 'test1', 'test1');
//     user2 = requestAuthRegister('test2@gmail.com', 'test22345', 'test2', 'test2');
//     user3 = requestAuthRegister('test3@gmail.com', 'test31234', 'test3', 'test3');
//     channelid = requestChannelscreate(user.token, 'test', true).channelId;
//     requestChannelJoin(user1.token, channelid);
//   });

//   test('invalid channel id', () => {
//     const result = requestChannelInvite(user.token, -1, user2.authUserId);
//     expect(result).toStrictEqual(ERROR);
//   });

//   test('uid already member of channel', () => {
//     const result = requestChannelInvite(user.token, channelid, user1.authUserId);
//     expect(result).toStrictEqual(ERROR);
//   });

//   test('invalid uid', () => {
//     const result = requestChannelInvite(user.token, channelid, -1);
//     expect(result).toStrictEqual(ERROR);
//   });

//   test('Authuser not part of channel', () => {
//     const result = requestChannelInvite(user2.token, channelid, user3.authUserId);
//     expect(result).toStrictEqual(ERROR);
//   });

//   test('authuser is invalid', () => {
//     const result = requestChannelInvite(user.token, channelid, -1);
//     expect(result).toStrictEqual(ERROR);
//   });

//   test('valid test', () => {
//     const result = requestChannelInvite(user.token, channelid, user3.authUserId);
//     expect(result).toStrictEqual({});
//   });
// });

// describe('Error Checking in channel messages v1', () => {
//   interface usr {
//       authUserId: number;
//       token: string;
//   }
//   let user: usr;
//   let user1: usr;
//   let channelid: number;
//   beforeEach(() => {
//     requestClear();
//     user = requestAuthRegister('test@gmail.com', 'test1234', 'test', 'test');
//     user1 = requestAuthRegister('user2@gmail.com', 'test1234', 'Hritwik', 'Nauriyal');
//     channelid = requestChannelscreate(user.token, 'test', true).channelId;
//   });

//   test('invalid authuser id', () => {
//     const result = requestChannelMessages('-1', channelid, 0);
//     expect(result).toStrictEqual(ERROR);
//   });

//   test('invalid channel id', () => {
//     const channelid = -1;
//     const result = requestChannelMessages(user.token, channelid, 0);
//     expect(result).toStrictEqual(ERROR);
//   });

//   test('invalid start', () => {
//     const result = requestChannelMessages(user.token, channelid, 1);
//     expect(result).toStrictEqual(ERROR);
//   });

//   test('Authuser not part of channel', () => {
//     const result = requestChannelMessages(user1.token, channelid, 0);
//     expect(result).toStrictEqual(ERROR);
//   });

//   test('Valid Test', () => {
//     const result = requestChannelMessages(user.token, channelid, 0);
//     expect(result).toStrictEqual({ messages: [], start: 0, end: -1 });
//   });
// });

// testing channelJoinV1
describe('Testing channelJoinV1', () => {
  beforeEach(() => {
    requestClear();
  });

  // test that a channel Id does not refer to a valid channel
  test('channelId is invalid', () => {
    const authId2 = requestAuthRegister('john@gmail.com', '123456789', 'John', 'Smith');
    const channelId2 = -1;
    const result = requestChannelJoin(authId2.token, channelId2);
    expect(result).toStrictEqual(400);
  });

  // test that authorised user is already member of channel
  test('Authorised user is already a member', () => {
    const authId1 = requestAuthRegister('lebron@gmail.com', '123456789', 'Lebron', 'James');
    const channel1 = requestChannelscreate(authId1.token, 'channel1', true);
    const result = requestChannelJoin(authId1.token, channel1);
    expect(result).toStrictEqual(400);
  });

  // test that new authorised user cannot join private channel when not a member
  test('Private channel', () => {
    const authId1 = requestAuthRegister('lebron@gmail.com', '123456789', 'Lebron', 'James');
    const channel1 = requestChannelscreate(authId1.token, 'channel1', true);
    const result = requestChannelJoin(authId1.token, channel1);
    expect(result).toEqual(403);
  });
  // test that an authorised user's Id is invalid
  test('Authorised user Id is invalid', () => {
    const authId1 = requestAuthRegister('lebron@gmail.com', '123456789', 'Lebron', 'James');
    const channel1 = requestChannelscreate(authId1.token, 'channel1', true);

    const result = requestChannelJoin('null', channel1);
    expect(result).toStrictEqual(ERROR);
  });

  // test that valid parameters permits authorised user to join channel
  test('Authorised user successfully joins channel', () => {
    const authId2 = requestAuthRegister('Kanye@gmail.com', '123456789', 'Kanye', 'West');
    const authId1 = requestAuthRegister('Kanye1@gmail.com', '1232456789', 'K2anye', 'We2st');
    const channel1 = requestChannelscreate(authId2.token, 'channel1', true);
    const result = requestChannelJoin(authId1.token, channel1.channelId);
    expect(result).toStrictEqual({});
  });
});
