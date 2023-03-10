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
        expect(register).toEqual(0);
        
      });
});

describe("Testing authLoginV1", () =>{
    test('Testing if login detail is correct', () => {
    authRegisterV1("example@gmail.com", "abc123", "John", "Smith")
    const login = authLoginV1("example@gmail.com", "abc123")
    expect(login).toEqual(0);
      });
      
    test('Testing if email does not match', () => {
    authRegisterV1("example@gmail.com", "abc123", "John", "Smith")
    const login = authLoginV1("example1@gmail.com", "abc123")
    expect(login).toEqual({error:"error"});
          });
    
    test('Testing if password does not match', () => {
    authRegisterV1("example@gmail.com", "abc123", "John", "Smith")
    const login = authLoginV1("example@gmail.com", "abc1234")
    expect(login).toEqual({error:"error"});
                });
          
});