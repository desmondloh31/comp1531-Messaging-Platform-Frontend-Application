import { STATUS_CODES } from 'http';
import request, { HttpVerb } from 'sync-request';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

export function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  return requestHelper('POST', '/auth/register/v2', { email, password, nameFirst, nameLast }, '-1');
}

function requestAuthLogin(email: string, password: string) {
  return requestHelper('POST', '/auth/login/v2', { email, password }, '-1');
}

function requestAuthLogout(token: string) {
  return requestHelper('POST', '/auth/logout/v1', { }, token);
}
function requestClear() {
  return requestHelper('DELETE', '/clear/v1', {}, '-1');
}

function requestAuthPasswordResetRequest(email: string){
  return requestHelper('POST', 'auth/passwordreset/request/v1', {email}, '-1')
}

function requestAuthPasswordResetReset(resetCode: number, newPassword: string){
  return requestHelper('POST', 'auth/passwordreset/reset/v1', {resetCode, newPassword}, '-1')
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
  const res = request(method, SERVER_URL + path, { qs, json, timeout: 20000 });
  if(res.statusCode !== 200){
    return res.statusCode
  }
  return JSON.parse(res.body as string);
}
const ERROR = { error: expect.any(String) };

describe('Testing authRegisterV1', () => {
  beforeEach(() => {
    requestClear();
  });
  
  test('Testing an invalid email', () => {
    const register = requestAuthRegister('oeihoashfoiahnfqo', '123456', 'John', 'Smith');
    //requestAuthRegister('oeihoashfoiahnfqo', '123456', 'John', 'Smith')
    expect(register).toBe(400);

  });

  test('Testing a short password', () => {
    const register = requestAuthRegister('example@gmail.com', '12345', 'John', 'Smith');
    expect(register).toEqual(400);
  });

  test('Testing an empty first name', () => {
    const register = requestAuthRegister('example@gmail.com', '123456', '', 'Smith');
    expect(register).toEqual(400);
  });

  test('Testing an empty last name', () => {
    const register = requestAuthRegister('example@gmail.com', '123456', 'John', '');
    expect(register).toEqual(400);
  });

  test('Testing standard register detail', () => {
    const register = requestAuthRegister('example@gmail.com', 'abc123', 'John', 'Smith');
    expect(register).toEqual({ authUserId: expect.any(Number), token: expect.any(String) });
  });
});


describe('Testing authLoginV1', () => {
  beforeEach(() => {
    requestClear();
  });
  
  test('Testing if login detail is correct', () => {
    requestAuthRegister('example@gmail.com', 'abc123', 'John', 'Smith');
    const login = requestAuthLogin('example@gmail.com', 'abc123');
    // const token = tokenCreate("example@gmail.com")
    expect(login).toEqual({ authUserId: expect.any(Number), token: expect.any(String) });
  });

  test('Testing if email does not match', () => {
    requestAuthRegister('example@gmail.com', 'abc123', 'John', 'Smith');
    const login = requestAuthLogin('example1@gmail.com', 'abc123');
    expect(login).toEqual(400);
  });

  test('Testing if password does not match', () => {
    requestAuthRegister('example@gmail.com', 'abc123', 'John', 'Smith');
    const login = requestAuthLogin('example@gmail.com', 'abc1234');
    expect(login).toEqual(400);
  });
});

/*
describe('Testing authLogoutV1', () => {
  beforeEach(() => {
    requestClear();
  });
  
  test('Testing if it will return nothing', () => {
    requestAuthRegister('example@gmail.com', 'abc123', 'John', 'Smith');
    const login = requestAuthLogin('example@gmail.com', 'abc123') as {token:string, authUserId: number};
    const logout = requestAuthLogout(login.token);
    expect(logout).toEqual({});
  });

  test('Testing if it will return error', () => {
    requestAuthRegister('example@gmail.com', 'abc123', 'John', 'Smith');
    const logout2 = requestAuthLogout('-1');
    expect(logout2).toEqual(400);
  });
});


describe('Testing authPasswordResetRequest', () => {
  beforeEach(() => {
    requestClear();
  });
  
  test('Testing if it will return nothing', () => {
    const user = requestAuthRegister('example@gmail.com', 'abc123', 'John', 'Smith');
    requestAuthPasswordResetRequest(user.email)
    const check = true
    expect(check).toEqual(true);
  });


});


describe('Testing authPasswordResetReset', () => {
  beforeEach(() => {
    requestClear();
  });
  
  test('Testing if it will return nothing', () => {
    const user = requestAuthRegister('example@gmail.com', 'abc123', 'John', 'Smith');
    requestAuthPasswordResetReset(123, "abcd1234")
    const check = true
    expect(check).toEqual(true);
  });
})
*/
