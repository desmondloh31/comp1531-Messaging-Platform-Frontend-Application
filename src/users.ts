import { getData, setData } from './dataStore';
import { tokenVerify, tokenExists } from './token';
import validator from 'validator';

export function userProfileV1(token: string, uId: number) {
  const authid = tokenVerify(token);
  const data = getData();
  const authUser = data.users.find(i => i.authUserId === authid);
  const user = data.users.find(i => i.authUserId === uId);

  if (!authUser) {
    return { error: 'authUserId is invalid' };
  }
  if (!user) {
    return { error: 'uId is invalid' };
  }

  console.log({
    user:
        {
          uId: user.authUserId,
          nameFirst: user.nameFirst,
          nameLast: user.nameLast,
          email: user.email,
          handleStr: user.handleStr
        }
  });

  return {
    user:
        {
          uId: user.authUserId,
          nameFirst: user.nameFirst,
          nameLast: user.nameLast,
          email: user.email,
          handleStr: user.handleStr
        }
  };
}

export function usersAllV1(token: string) {
  // check that token is valid
  if (!tokenExists) {
    return { error: 'error' };
  }
  const data = getData();
  const users = [];
  for (const userData of data.users) {
    const alan = {
      uId: userData.authUserId,
      email: userData.email,
      nameFirst: userData.nameFirst,
      nameLast: userData.nameLast,
      handleStr: userData.handleStr
    };
    users.push(alan);
  }
  console.log({ users: users });
  return { users: users };
}

export function userProfileSetnameV1(token: string, nameFirst: string, nameLast: string) {
  const data = getData();

  if (nameFirst.length < 1 || nameFirst.length > 50) {
    return { error: 'error' };
  }

  if (nameLast.length < 1 || nameLast.length > 50) {
    return { error: 'error' };
  }

  for (const userData of data.users) {
    if (token === userData.token[0]) {
      userData.nameFirst = nameFirst;
      userData.nameLast = nameLast;
      setData(data);
      break;
    }
  }
  return {};
}

export function userProfileSetemailV1(token: string, email: string) {
  const data = getData();
  if (validator.isEmail(email) === false) {
    return { error: 'error' };
  }

  const authUserId = tokenVerify(token) as number;
  const authUser = data.users.find(i => i.authUserId === authUserId);

  if (!authUser) {
    return { error: 'Invalid Token' };
  }

  // check if email is already being used by another user
  const check = data.users.find(i => i.email === email);

  if (check) {
    return { error: 'email already in use' };
  }

  authUser.email = email;

  return {};
}

export function userProfileSethandleV1(token: string, handleStr: string) {
  const data = getData();
  for (const userData of data.users) {
    if (token === userData.token[0]) {
      userData.handleStr = handleStr;
      setData(data);
      break;
    }
  }
  return {};
}
