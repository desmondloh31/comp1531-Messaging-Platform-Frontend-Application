export function userProfileV1(authUserID, uId) {

    const data = getData();
    
    const user = data.users.find(i => i.authUserId === authUserId);
    const guest = data.users.find(i => i.authUserId === uId);
  
    if (!user) {
        return { error: "authUserId is invalid"}; 
      }else if(!guest) {
        return { error: "uId is invalid"};
      }

    return {
        uId: guest.uId,
        nameFirst: guest.nameFirst,
        nameLast: guest.nameLast,
        email: guest.email,
        handleStr: guest.handleStr,

    }
  }
