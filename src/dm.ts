import { getData } from './dataStore';
import { tokenVerify } from './token';
import HttpError from 'http-errors';
/**
 * DESCRIPTION
 * copy from table
 * @param {string} token - token string
 * @param {array} uIds - array of userIds
 *
 * @returns {number} - dmId: array of objects, where each object contains types { dmId, name }
 *
 *
 */

export function dmCreate(token:string, uIds: number[]) {
  const data = getData();
  const authUserId = tokenVerify(token) as number;

  const authUser = data.users.find(i => i.authUserId === authUserId);
  if (!authUser) {
    throw HttpError(403, 'Invalid Token');
  }

  // Determining whether there are duplicates user Ids in uIds
  const duplicates = uIds.filter((value, index) => uIds.indexOf(value) !== index);
  const handleArray = [];

  // Find the creators user handle by the token
  // Push their user handle to handleArray
  const creator = data.users.find(i => i.authUserId === authUserId);
  handleArray.push(creator.handleStr);

  if (duplicates.length === 0) {
    // Checking if uIds are registered to a valid user
    for (const authId of uIds) {
      const user = data.users.find(i => i.authUserId === authId);

      if (!user) {
        return { error: 'authUserId is invalid' };
      } else {
        handleArray.push(user.handleStr);
      }
    }

    // Sorting the handleArray alphabetically
    handleArray.sort();
  } else {
    return { error: 'Duplicate User Ids' };
  }
  // turn handleArray into a string seperated by commas
  const handlename = handleArray.join(', ');
  /// Create a dmId by iterating msgCount
  const dmId = data.msgcount;
  data.msgcount += 1;

  uIds.push(authUserId);

  data.dms.push({
    name: handlename,
    dmId: dmId,
    creator: creator.authUserId,
    allMembers: uIds,
    messages: [],
  });

  return { dmId: dmId };
}

/**
 *
 * @param {string} token - token string
 *
 * @returns {array} - dms: array of objects, where each object contains types { dmId, name }
 *
 *
 */

export function dmList(token: string) {
  const dmlists = [];
  const authid = tokenVerify(token) as number;
  const data = getData();

  for (const dm in data.dms) {
    if (data.dms[dm].allMembers.find(i => i === authid)) {
      dmlists.push({ dmId: data.dms[dm].dmId, name: data.dms[dm].name });
    }
  }

  console.log({ dms: dmlists });
  return { dms: dmlists };
}

// /dm/remove/v1Remove an existing DM, so all members are no longer in the DM.
// This can only be done by the original creator of the DM.

export function dmRemoveV1(token: string, dmId: number) {
  const data = getData();
  const authUserId = tokenVerify(token) as number;
  const authUser = data.users.find(i => i.authUserId === authUserId);

  if (!authUser) {
    throw HttpError(403, 'Invalid Token');
  }

  const dm = data.dms.find(i => i.dmId === dmId);
  if (!dm) {
    throw HttpError(400, 'dmId is invalid');
  } else if (dm.creator !== authUserId) {
    throw HttpError(403, 'Only the creator of the DM can remove it');
  } else {
    const index = data.dms.indexOf(dm);
    data.dms.splice(index, 1);
    return {};
  }
}

// /dm/details/v1Given a DM with ID dmId that the authorised user is a member of,
// provide basic details about the DM.
function usersAll(target: any) {
  // check that token is valid
  console.log('target', target);
  const data = getData();
  const users = [];
  for (const userData of data.users) {
    if (target.includes(userData.authUserId)) {
      const alan = {
        uId: userData.authUserId,
        email: userData.email,
        nameFirst: userData.nameFirst,
        nameLast: userData.nameLast,
        handleStr: userData.handleStr
      };
      users.push(alan);
    }
  }
  return users;
}

export function dmDetailsV1(token: string, dmId: number) {
  const data = getData();
  const authUserId = tokenVerify(token) as number;
  const authUser = data.users.find(i => i.authUserId === authUserId);

  if (!authUser) {
    throw HttpError(403, 'Invalid Token');
  }

  const dm = data.dms.find(i => i.dmId === dmId);

  if (!dm) {
    throw HttpError(400, 'dmId is invalid');
  }

  if (dm.allMembers.includes(authUserId)) {
    console.log({ name: dm.name, members: usersAll(dm.allMembers) });
    return { name: dm.name, members: usersAll(dm.allMembers) };
  } else {
    throw HttpError(403, 'User is not a member of the DM');
  }
}

// /dm/leave/v1 Given a DM ID, the user is removed as a member of this DM.
// The creator is allowed to leave and the DM will still exist if this happens.
// This does not update the name of the DM.

export function dmLeaveV1(token: string, dmId: number) {
  const data = getData();
  const authUserId = tokenVerify(token) as number;
  const authUser = data.users.find(i => i.authUserId === authUserId);
  const dm = data.dms.find(i => i.dmId === dmId);

  if (!authUser) {
    throw HttpError(403, 'Invalid Token');
  }

  if (!dm) {
    throw HttpError(400, 'dmId is invalid');
  }

  if (!dm.allMembers.includes(authUserId)) {
    throw HttpError(403, 'User is not a member of the DM');
  }

  // If the user is the creator of the DM
  if (dm.creator === authUserId) {
    // Remove the user from the DM
    dm.creator = 0;
  }

  const index = dm.allMembers.indexOf(authUserId);
  dm.allMembers.splice(index, 1);
  return {};
}
