import { getData, setData } from './dataStore';
import { tokenVerify, tokenExists } from './token';
import validator from 'validator';
import HttpError from 'http-errors';
import fs from 'fs';
import request from 'sync-request';

export function userProfileV1(token: string, uId: number) {
  const authid = tokenVerify(token);
  const data = getData();
  const authUser = data.users.find(i => i.authUserId === authid);
  const user = data.users.find(i => i.authUserId === uId);

  if (!authUser) {
    throw HttpError(400, 'error');
  }
  if (!user) {
    throw HttpError(400, 'error');
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
    throw HttpError(400, 'error');
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
    throw HttpError(400, 'error');
  }

  if (nameLast.length < 1 || nameLast.length > 50) {
    throw HttpError(400, 'error');
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
    throw HttpError(400, 'error');
  }

  const authUserId = tokenVerify(token) as number;
  const authUser = data.users.find(i => i.authUserId === authUserId);

  if (!authUser) {
    throw HttpError(400, 'error');
  }

  // check if email is already being used by another user
  const check = data.users.find(i => i.email === email);

  if (check) {
    throw HttpError(400, 'error');
  }

  authUser.email = email;

  return {};
}

export function userProfileSethandleV1(token: string, handleStr: string) {
  const data = getData();
  if (handleStr.length < 4) {
    throw HttpError(400, 'error');
  }
  if (handleStr.length > 19) {
    throw HttpError(400, 'error');
  }
  const space = handleStr.split(' ');
  if (space.length > 1) {
    throw HttpError(400, 'error');
  }

  for (const userData of data.users) {
    if (token === userData.token[0]) {
      userData.handleStr = handleStr;
      setData(data);
      break;
    }
  }
  return {};
}

export function uploadPhotoV1(imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd:number) {
  const dir = './src/profileImgs.';
  const file = fs.readdirSync(dir).length;
  console.log(file);
  if ((xEnd <= xStart) || (yEnd <= yStart)) {
    throw HttpError(400, 'error');
  }

  let res;
  try {
    res = request(
      'GET', imgUrl
    );
  } catch (e) {
    throw HttpError(400, 'error');
  }
  const body = res.getBody();
  console.log(body);
  // const tempPath = 'src/profileImgs/${file}.TEMP';
  // const path = 'src/profileImgs/${file}.jpg';
  // console.log(path);
  // fs.writeFileSync(tempPath, body);
}
