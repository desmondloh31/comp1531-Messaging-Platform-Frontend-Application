import { getData } from './dataStore';

export function userProfileV1(authUserID: number, uId: number) {
  const data = getData();

  const user = data.users.find(i => i.authUserId === authUserID);
  const guest = data.users.find(i => i.authUserId === uId);

  if (!user) {
    return { error: 'authUserId is invalid' };
  } else if (!guest) {
    return { error: 'uId is invalid' };
  }

  return {
    uId: guest.authUserId,
    nameFirst: guest.nameFirst,
    nameLast: guest.nameLast,
    email: guest.email,
    handleStr: guest.formattedHandle,

  };
}
