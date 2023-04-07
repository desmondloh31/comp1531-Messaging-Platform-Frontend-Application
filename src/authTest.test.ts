import {authRegisterV1, authLoginV1, authLogoutV1} from './auth'; 
import {tokenCreate, tokenVerify, tokenDelete} from './token' 
import request, {HttpVerb} from 'sync-request';
import {port,url} from './config.json';
import { token } from 'morgan';
const SERVER_URL = `${url}:${port}`;

export function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string){
  return requestHelper('POST','/auth/register/v2',{email,password,nameFirst,nameLast});
}

function requestAuthLogin(email: string, password: string){
  return requestHelper('POST','/auth/login/v2',{email,password});
}

function requestAuthLogout(token: string){
  return requestHelper('POST','/auth/logout/v1',{token});
}

function requestClear() {
  return requestHelper('DELETE', '/clear/v1', {});
}

// Helper Function
function requestHelper(method: HttpVerb, path: string, payload: object) {
  let qs = {};
  let json = {};
  if (['GET', 'DELETE'].includes(method)) {
      qs = payload;
  } else {
      //PUT/POST
      json = payload;
  }
  const res = request(method, SERVER_URL + path, {qs,json,timeout: 20000});
  return JSON.parse(res.getBody('utf-8'));
}



describe("Testing authRegisterV1", () =>{

    beforeEach (() => {
        requestClear();

    });
    test('Testing an invalid email', () => {
        const register = requestAuthRegister("oeihoashfoiahnfqo", "123456", "John", "Smith")
        expect(register).toEqual({error: "error"});
      });
    
    test('Testing a short password', () => {
        const register = requestAuthRegister("example@gmail.com", "12345", "John", "Smith")
        expect(register).toEqual({error: "error"});
      });

    test('Testing an empty first name', () => {
        const register = requestAuthRegister("example@gmail.com", "123456", "", "Smith")
        expect(register).toEqual({error:"error"});
      });

    test('Testing an empty last name', () => {
        const register = requestAuthRegister("example@gmail.com", "123456", "John", "")
        expect(register).toEqual({error:"error"});
      });
    
    test('Testing standard register detail', () => {
        const register = requestAuthRegister("example@gmail.com", "abc123", "John", "Smith") 
        expect(register).toEqual({"authUserId": expect.any(Number), token: expect.any(String)});
        
      });
});

describe("Testing authLoginV1", () =>{

    beforeEach (() => {
        requestClear();

    });

    test('Testing if login detail is correct', () => {
        const { token } = requestAuthRegister("example@gmail.com", "abc123", "John", "Smith")
        const login = requestAuthLogin("example@gmail.com", "abc123")
        // const token = tokenCreate("example@gmail.com")
        expect(login).toEqual({"authUserId": expect.any(Number), token: expect.any(String)});
      });
      
    test('Testing if email does not match', () => {
        requestAuthRegister("example@gmail.com", "abc123", "John", "Smith")
        const login = requestAuthLogin("example1@gmail.com", "abc123")
        expect(login).toEqual({error:"error"});
          });
    
    test('Testing if password does not match', () => {
        requestAuthRegister("example@gmail.com", "abc123", "John", "Smith")
        const login = requestAuthLogin("example@gmail.com", "abc1234")
        expect(login).toEqual({error:"error"});
                });
          
});

describe("Testing authLogoutV1", () =>{

    beforeEach (() => {
        requestClear();

    });

    test('Testing if it will return nothing',() =>{
      requestAuthRegister("example@gmail.com", "abc123", "John", "Smith")
        const login = requestAuthLogin("example@gmail.com", "abc123") as {token:string, authUserId: number}
        const logout = requestAuthLogout(login.token);
        expect(logout).toEqual({});
    })

    test('Testing if it will return error',() =>{
      requestAuthRegister("example@gmail.com", "abc123", "John", "Smith")
      const login = requestAuthLogin("example@gmail.com", "abc123") as {token:string, authUserId: number};
      const logout = requestAuthLogout(login.token)
      const logout2 = requestAuthLogout(login.token)
      expect(logout2).toEqual({error:"error"})
    })
})
