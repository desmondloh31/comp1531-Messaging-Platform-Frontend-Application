import { getData, setData } from './dataStore';
import validator from 'validator';
import { tokenCreate, tokenDelete, tokenExists } from './token';

function authRegisterV1(email: string, password: string, nameFirst: string, nameLast: string) {
  const data = getData();
  const authUserId = data.users.length;

  if (validator.isEmail(email) === false) {
    return { error: 'error1' };
  }

  if (password.length < 6) {
    return { error: 'error2' };
  }

  if (nameFirst.length < 1 || nameFirst.length > 50) {
    return { error: 'error3' };
  }

  if (nameLast.length < 1 || nameLast.length > 50) {
    return { error: 'error4' };
  }

  for (const user of data.users) {
    if (user.email === email) {
      return { error: 'error5' };
    }
  }

  const handle = nameFirst + nameLast;
  let handleLower = handle.toLowerCase();
  if (handleLower.length > 20) {
    handleLower = handleLower.slice(0, 20);
  }
  const handleStr = formatAlias(handleLower, 0);

  data.users.push({
    email: email,
    password: password,
    nameFirst: nameFirst,
    nameLast: nameLast,
    authUserId: authUserId,
    handleStr: handleStr,
    token: [],
    notifications:[],
  });
  setData(data);
  const token = tokenCreate(email);

  return { authUserId, token };
}

// const test = authRegisterV1("example@gmail.com", "abc123", "John", "Smith")
// console.log(test)

function authLoginV1(email: string, password: string) {
  const data = getData();
  for (let user = 0; user < data.users.length; user++) {
    if (data.users[user].email === email) {
      if (data.users[user].password === password) {
        const token = tokenCreate(email);
        return { authUserId: data.users[user].authUserId, token };
      } else {
        return { error: 'error' };
      }
    }
  }

  return { error: 'error' };
}

function formatAlias(handleLower: string, currentMaxNum: number) {
  const data = getData();
  for (const user of data.users) {
    if (user.handleStr === handleLower) {
      const newHandle = handleLower + currentMaxNum;
      currentMaxNum++;
      formatAlias(newHandle, currentMaxNum);
    }
  }
  return handleLower;
}

export { authRegisterV1, authLoginV1 };

export function authLogoutV1(token: string) {
  if (!tokenExists(token)) {
    return { error: 'token does not exist' };
  }
  tokenDelete(token);

  // console.log(getData());
  return {};
}

