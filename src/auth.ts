import { getData, setData } from './dataStore';
import { tokenCreate } from './token';
import validator from 'validator';

function authRegisterV1(email: string, password: string, nameFirst: string, nameLast: string) {
  const data = getData();
  const authUserId = data.users.length;

  if (validator.isEmail(email) === false) {
    return { error: 'error' };
  }

  if (password.length < 6) {
    return { error: 'error' };
  }

  if (nameFirst.length < 1 || nameFirst.length > 50) {
    return { error: 'error' };
  }

  if (nameLast.length < 1 || nameLast.length > 50) {
    return { error: 'error' };
  }

  for (let user = 0; user < data.users.length; user++) {
    if (data.users[user].email === email) {
      return { error: 'error' };
    }
  }
  const handle = nameFirst + nameLast;
  let handleLower = handle.toLowerCase();
  if (handleLower.length > 20) {
    handleLower = handleLower.slice(0, 20);
  }

  const formattedHandle = formatAlias(handleLower, 0);

  data.users.push({
    email: email,
    password: password,
    nameFirst: nameFirst,
    nameLast: nameLast,
    authUserId: authUserId,
    formattedHandle: formattedHandle,
    token: []
  });
  setData(data);
  const token = tokenCreate(email); // place this in server.ts

  return { authUserId, token };
}

function authLoginV1(email: string, password: string) {
  const data = getData();
  for (let user = 0; user < data.users.length; user++) {
    if (data.users[user].email === email) {
      if (data.users[user].password === password) {
        return { authUserId: data.users[user].authUserId };
      } else {
        return { error: 'error' };
      }
    }
  }
  return { error: 'error' };
}

function formatAlias(handleLower: string, currentMaxNum: number) {
  const data = getData();
  for (let user = 0; user < data.users.length; user++) {
    if (data.users[user].formattedHandle === handleLower) {
      const newHandle = handleLower + currentMaxNum;
      currentMaxNum++;
      formatAlias(newHandle, currentMaxNum);
    }
  }
  return handleLower;
}

export { authRegisterV1, authLoginV1 };
