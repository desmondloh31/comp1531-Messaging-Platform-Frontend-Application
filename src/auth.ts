import {getData, setData} from './dataStore';
import validator from 'validator';
import {tokenCreate, tokenVerify, tokenDelete, tokenExists} from './token' 
import crypto from 'crypto'
import { getHashOf } from './other';
import { resetPasswordEmail } from './other';
import { setDefaultResultOrder } from 'dns';

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

    for(const user of data.users){
        if(user.email === email){
        return{error:"error"}
        }
    }

    let handle = nameFirst + nameLast
    let handleLower = handle.toLowerCase()
    if (handleLower.length > 20) {
        handleLower = handleLower.slice(0, 20);
      }
    
    const handleStr = formatAlias(handleLower, 0)

    data.users.push({
        email: email,
        password: getHashOf(password),
        nameFirst: nameFirst,
        nameLast: nameLast,
        authUserId: authUserId,
        handleStr: handleStr,
        token: [],
        resetCode: 0,       
        deletedEmail: "",
        deletedHandle: ""
    })
    setData(data)
    const token = tokenCreate(email) 

    return {authUserId, token}
    
  }

//const test = authRegisterV1("example@gmail.com", "abc123", "John", "Smith")
//console.log(test)

function authLoginV1(email: string, password: string ) {
    const data = getData()
    for (let user = 0; user < data.users.length; user++){
        if (data.users[user].email ===  email){
            if(data.users[user].password === getHashOf(password)){
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
    for(const user of data.users){
        if(user.handleStr === handleLower){
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

export function authPasswordResetRequestV1(email: string){
    const data = getData()
    for(const user of data.users){
        if(user.email === email){
        return{error:"error"}
        }
    }
    let resetCode = Math.floor(Math.random() * 999)
    
    const text = "This is your password reset code: " + resetCode
    resetPasswordEmail(email, text)

    let user = data.users.find(i => i.email === email);
    user.resetCode = resetCode
    setData(data)
}

export function authPasswordResetResetV1(resetCode: number, newPassword: string){
    const data = getData()
    let user = data.users.find(i => i.resetCode === resetCode)
    if(newPassword.length < 6){
        return{error:"error"}
    }
    if(user != null){
        user.password = getHashOf(newPassword)
        user.resetCode = 0
        setData(data)
    }
    else{
        return{error:"error"}
    }
}
