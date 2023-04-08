import { getData } from './dataStore';

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

  // Determining whether there are duplicates user Ids in uIds
  const duplicates = uIds.filter((value, index) => uIds.indexOf(value) !== index);
  const handleArray = [];

  // Find the creators user handle by the token
  // Push their user handle to handleArray
  let flag = 0;
  let creator;
  for (const user of data.users) {
    if (user.token[0] === token) {
      // console.log(user.formattedHandle)
      creator = user.authUserId;
      handleArray.push(user.formattedHandle);
      flag = 1;
    }
  }
  if (flag === 0) {
    return { error: 'Invalid Token or duplicate user Ids' };
  }
  if (duplicates.length === 0) {
    // Checking if uIds are registered to a valid user
    for (const authId of uIds) {
      const user = data.users.find(i => i.authUserId === authId);

      if (!user) {
        return { error: 'authUserId is invalid' };
      } else {
        handleArray.push(user.formattedHandle);
      }
    }

    // Sorting the handleArray alphabetically
    handleArray.sort();
  } else {
    return { error: 'Invalid Token or duplicate user Ids' };
  }

  /// Create a dmId by iterating msgCount
  let dmId: number;

  if (data.dms.length === 0) {
    dmId = 0;
  } else {
    dmId = data.dms[data.dms.length - 1].dmId + 1;
  }

  data.dms.push({
    name: handleArray,
    dmId: dmId,
    creator: creator,
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
  const data = getData();
  const dmlists = [];

  // Check token in users to check what to authUser id is
  //
  let uId: number;
  for (const user of data.users) {
    if (user.token[0] === token) {
      uId = user.authUserId;
    }
  }

  // Now check for uId in dms in creator and allMembers
  const dmCreator = data.dms.find(i => i.creator === uId);

  if (!dmCreator) {
    let namesis: string[];
    let dmids: number;
    for (const dm in data.dms) {
      if (data.dms[dm].allMembers.find(i => i === uId)) {
        namesis = data.dms[dm].name;
        dmids = data.dms[dm].dmId;
        dmlists.push({ dmids, namesis });
      }
    }
  } else {
    let a: string[];
    let b: number;
    b = dmCreator.dmId;
    a = dmCreator.name;
    dmlists.push({ b, a });
  }

  return dmlists;
}
