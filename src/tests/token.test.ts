import { getData, setData } from '../dataStore';
import { clearV1 } from "../other";
import { authRegisterV1 } from '../auth';
import { tokenCreate, tokenDelete, tokenVerify } from '../token';

const ERROR = { error: expect.any(String) };

describe('Error Checking in tokenCreate', () => {
    const data = getData();
    beforeEach (() => {
        clearV1();
        authRegisterV1("test@gmail.com", "test1234", "test", "test");
        
    });

    test('invalid email', () => {
        let email = "-1";
        const result = tokenCreate(email);
        expect(result).toStrictEqual(ERROR);
    });

    test('email not found', () => {
        let email = "test";
        let channelid = -1;
        const result = tokenCreate(email);
        expect(result).toStrictEqual(ERROR);
    });

    test('Valid Test', () => {
        let correctEmail = data.users[0].email; //check with tutor
        const result = tokenCreate(correctEmail);
        expect(result).toStrictEqual(ERROR);//change to success
    });

});


describe('Error Checking in tokenVerify', () => {
    const data = getData();
    beforeEach (() => {
        clearV1();
        authRegisterV1("test@gmail.com", "test1234", "test", "test");
        tokenCreate(data.users[0].email);
        
    });

    test('token not found', () => {
        let token = data.users[0].token[0];
        const result = tokenVerify(token);
        expect(result).toStrictEqual(ERROR);
    });

    test('Valid Test', () => {
        let token = data.users[0].token[0];
        const result = tokenVerify(token);
        expect(result).toStrictEqual(ERROR);//change to success
    });

});

describe('Error Checking in tokenDelete', () => {
    const data = getData();
    beforeEach (() => {
        clearV1();
        authRegisterV1("test@gmail.com", "test1234", "test", "test");
        tokenCreate(data.users[0].email);
        
    });

    test('token not found', () => {
        let token = data.users[0].token[0];
        const result = tokenVerify(token);
        expect(result).toStrictEqual(ERROR);
    });

    test('Valid Test', () => {
        let token = data.users[0].token[0];
        const result = tokenVerify(token);
        expect(result).toStrictEqual(ERROR);//change to success
    });

});