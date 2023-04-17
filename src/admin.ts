import { getData, setData } from './dataStore';

export function adminUserRemoveV1(authUserId: number) {
  const data = getData();
  for (const channel of data.channels) {
    const user = channel.allMembers.find(i => i === authUserId);

    const index = channel.allMembers.indexOf(user);
    delete channel.allMembers[index];

    for (const message of channel.messages) {
      if (message.senderId === authUserId) {
        message.message = 'Removed user';
      }
    }
  }
  for (const dms of data.dms) {
    const user = dms.allMembers.find(i => i === authUserId);
    const index = dms.allMembers[user];
    delete dms.allMembers[index];

    for (const message of dms.messages) {
      if (message.senderId === authUserId) {
        message.message = 'Removed user';
      }
    }
  }
  const user = data.users.find(i => i.authUserId === authUserId);
  user.nameFirst = 'Removed ';
  user.nameLast = 'user';
  user.deletedEmail = user.email;
  user.email = '';
  user.deletedHandle = user.handleStr;
  user.handleStr = '';

  setData(data);
  return {};
}
