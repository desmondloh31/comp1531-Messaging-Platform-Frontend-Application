import { clearV1 } from '../other';
import { authRegisterV1 } from '../auth';
import { tokenCreate, tokenVerify } from '../token';

const ERROR = { error: expect.any(String) };

describe('Error Checking in tokenCreate', () => {
  const email = 'test@gmail.com';
  beforeEach(() => {
    clearV1();
    authRegisterV1(email, 'test1234', 'test', 'test');
  });

  test('invalid email', () => {
    const result = tokenCreate('testing');
    expect(result).toStrictEqual(ERROR);
  });

  test('email not found', () => {
    const result = tokenCreate('test123@gmail.com');
    expect(result).toStrictEqual(ERROR);
  });

  test('Valid Test', () => {
    const result = tokenCreate(email);
    expect(result).toStrictEqual(expect.any(String));// change to success
  });
});

describe('Error Checking in tokenVerify', () => {
    // const data = getData();
    interface usr {
        authUserId: number;
        token: string;
    }
    let user: usr;
    const email = 'test@gmail.com';
    let token: string | { error:string };
    beforeEach(() => {
      clearV1();
      user = authRegisterV1('test@gmail.com', 'test1234', 'test', 'test') as usr;
      token = tokenCreate(email);
    });

    test('token not found', () => {
      const result = tokenVerify('-1');
      expect(result).toStrictEqual(ERROR);
    });

    test('Valid Test', () => {
      const result = tokenVerify(token as string);
      expect(result).toStrictEqual(user.authUserId);// change to success
    });
});

describe('Error Checking in tokenDelete', () => {
    interface usr {
        authUserId: number;
        token: string;
    }
    let user: usr;
    const email = 'test@gmail.com';
    let token: string;
    beforeEach(() => {
      clearV1();
      user = authRegisterV1('test@gmail.com', 'test1234', 'test', 'test') as usr;
      token = tokenCreate(email) as string;
    });

    test('token not found', () => {
      const result = tokenVerify('-1');
      expect(result).toStrictEqual(ERROR);
    });

    test('Valid Test', () => {
      const result = tokenVerify(token);
      expect(result).toStrictEqual(user.authUserId);// change to success
    });
});
