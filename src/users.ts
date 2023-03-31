import {getData, setData} from './dataStore';
import {tokenCreate, tokenVerify, tokenDelete, tokenExists} from './token' 

export function userProfileV1(token: string, uId: number) {

    let authid = tokenVerify(token);

    const data = getData();
    
    const user = data.users.find(i => i.authUserId === authid);
    const guest = data.users.find(i => i.authUserId === uId); //add to server.ts
    
    if (!user) {
        return { error: "authUserId is invalid"}; 
      }else if(!guest) {
        return { error: "uId is invalid"};
      }
    
    return {
        uId: guest.authUserId,
        nameFirst: guest.nameFirst,
        nameLast: guest.nameLast,
        email: guest.email,
        handleStr: guest.formattedHandle,

    }
  }

export function usersAllV1(token: string){
  // check that token is valid
  if(!tokenExists){
    return {error:"error"}
  }
  const data = getData()
  let users = []
  for(const userData of data.users){
    const alan = {
      uId: userData.authUserId, 
      email: userData.email, 
      nameFirst: userData.nameFirst, 
      nameLast: userData.nameLast, 
      handleStr: userData.formattedHandle
    } 
    users.push(alan)
    
  }
  return {users: users};
}