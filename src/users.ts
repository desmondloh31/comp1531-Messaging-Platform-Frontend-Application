import {getData, setData} from './dataStore';
import {tokenCreate, tokenVerify, tokenDelete, tokenExists} from './token' 
import validator from 'validator';

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
    const fdone = {
      uId: userData.authUserId, 
      email: userData.email, 
      nameFirst: userData.nameFirst, 
      nameLast: userData.nameLast, 
      handleStr: userData.formattedHandle
    } 
    users.push(fdone)
    
  }
  return {users: users};
}

export function userProfileSetnameV1(token: string, nameFirst: string, nameLast: string){
  const data = getData()


  if(nameFirst.length < 1 || nameFirst.length > 50){
    return{error:"error"}
  }

  if(nameLast.length < 1 || nameLast.length >50){
    return{error:"error"}
  }

  for(const userData of data.users){
    if(token === userData.token[0]){
      userData.nameFirst = nameFirst
      userData.nameLast = nameLast
      break
    }

    }
  return {}
}

export function userProfileSetemailV1(token: string, email: string){
  const data = getData()
  if(validator.isEmail(email) === false){
    return{error:"error"}
  }

  for(const user in data){
    if(user["email"] === email){
    return{error:"error"}
    }
  }
  for(const userData of data.users){
    if(token === userData.token[0]){
      userData.email = email
      break
    }
    }
  return {}
}

export function userProfileSethandleV1(token: string, handleStr: string){
  const data = getData()
  for(const userData of data.users){
    if(token === userData.token[0]){
      userData.formattedHandle = handleStr
      break
    }
    }
  return {}
}