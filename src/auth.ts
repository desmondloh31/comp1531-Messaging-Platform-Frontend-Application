import {getData, setData} from './dataStore';
import validator from 'validator';
import {tokenCreate, tokenVerify, tokenDelete, tokenExists} from './token' 

function authRegisterV1(email: string, password: string, nameFirst: string, nameLast: string) {
    const data = getData()
    const authUserId = data.users.length

    if(validator.isEmail(email) === false){
        return{error:"error"}
    }

    if(password.length < 6){
        return{error:"error"}
    }

    if(nameFirst.length < 1 || nameFirst.length > 50){
        return{error:"error"}
    }

    if(nameLast.length < 1 || nameLast.length >50){
        return{error:"error"}
    }

    for(const user in data){
        if(user["email"] === email){
        return{error:"error"}
        }
    }

    let handle = nameFirst + nameLast
    let handleLower = handle.toLowerCase()
    if (handleLower.length > 20) {
        handleLower = handleLower.slice(0, 20);
      }
    
    const formattedHandle = formatAlias(handleLower, 0)

    data.users.push({
        email: email,
        password: password,
        nameFirst: nameFirst,
        nameLast: nameLast,
        authUserId: authUserId,
        formattedHandle: formattedHandle,
        token: []
    })
    setData(data)
    const token = tokenCreate(email) //place this in server.ts

    return {authUserId, token}
    
  }

//const test = authRegisterV1("example@gmail.com", "abc123", "John", "Smith")
//console.log(test)

function authLoginV1(email: string, password: string ) {
    const data = getData()
    for (let user = 0; user < data.users.length; user++){
        if (data.users[user].email ===  email){
            if(data.users[user].password === password){
                const token = tokenCreate(email) 
                return {authUserId: data.users[user].authUserId, token};
            } 
            else{
                return {error:"error"}
            }
        }
    }
    
    return {error:"error"}
}



function formatAlias(handleLower: string, currentMaxNum: number){
    const data = getData()
    for(const user in data){
        if(user["handleLower"] === handleLower){
           const newHandle = handleLower + currentMaxNum
           currentMaxNum ++ 
           formatAlias(newHandle, currentMaxNum)
        }
}
    return handleLower
} 

export {authRegisterV1, authLoginV1};


export function authLogoutV1(token: string){
    if (!tokenExists(token)){
        return {error:'error'}
    }
    tokenDelete(token)

    //console.log(getData());
    return {}
}