import {authRegisterV1, authLoginV1} from './auth'; 

describe("Testing authRegisterV1", () =>{
    test('Testing an invalid email', () => {
        const register = authRegisterV1("oeihoashfoiahnfqo", "123456", "John", "Smith")
        expect(register).toEqual({error: "error"});
      });
    
    test('Testing a short password', () => {
        const register = authRegisterV1("example@gmail.com", "12345", "John", "Smith")
        expect(register).toEqual({error: "error"});
      });

    test('Testing an empty first name', () => {
        const register = authRegisterV1("example@gmail.com", "123456", "", "Smith")
        expect(register).toEqual({error:"error"});
      });

    test('Testing an empty last name', () => {
        const register = authRegisterV1("example@gmail.com", "123456", "John", "")
        expect(register).toEqual({error:"error"});
      });
    
    test('Testing standard register detail', () => {
        const register = authRegisterV1("example@gmail.com", "abc123", "John", "Smith")
        const login = authLoginV1("example@gmail.com", "abc123")
        expect(register).toEqual(authUserId);
        
      });
});

describe("Testing authLoginV1", () =>{
    test('Testing if login detail is correct', () => {
        const login = authLoginV1("example@addEventListener.unsw.edu.au", "12345678")
        expect(login).toEqual({error: "error"});
      });
      
    
});