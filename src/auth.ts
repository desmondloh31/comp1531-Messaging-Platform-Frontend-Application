import {getData, setData} from './dataStore';
import validator from 'validator';

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
        formattedHandle: formattedHandle
    })
    setData(data)
    return {authUserId}
    
  }



function authLoginV1(email: string, password: string ) {
    const data = getData()
    for (let user = 0; user < data.users.length; user++){

        if (data.users[user].email ===  email){
            if(data.users[user].password === password){
                return {authUserId: data.users[user].authUserId};
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


