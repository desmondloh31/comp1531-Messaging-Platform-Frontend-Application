import {getData, setData} from './dataStore.js';
import { fromString } from 'uuidv4';
import validator from 'validator';

function authRegisterV1(email, password, nameFirst, nameLast) {
    const users = {};
    const data = getData()
    const authUserId =  fromString(email + nameFirst + nameLast)


    if(validator.isEmail(email) == false){
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
        if(user["email"] == email){
        return{error:"error"}
        }
    }

    let handle = nameFirst + nameLast
    let handleLower = handle.toLowerCase()
    if (handleLower.length > 20) {
        handleLower = handleLower.slice(0, 20);
      }
    
    const formattedHandle = formatAlias(handleLower, 0)
    
    users.email = email;
    users.password = password;
    users.nameFirst = nameFirst;
    users.nameLast = nameLast;
    users.authUserId = authUserId;
    users.formattedHandle = formattedHandle;
    

    data.users.push(users)
    setData(data)
    console.log(authUserId);
    return authUserId
    
  }



function authLoginV1(email, password) {
    const data = getData()
    //console.log(data.users);
    for (let user = 0; user < data.users.length; user++){
        //console.log(data.users[user].authUserId);

        if (data.users[user].email ==  email){
            //console.log("Here");
            if(data.users[user].password == password){
                console.log(data.users[user].authUserId +  " - result");
                return data.users[user].authUserId;
            } 
            else{
                return {error:"error"}
            }
        }
    }
    return {error:"error"}
}



function formatAlias(handleLower, currentMaxNum){
    const data = getData()
    for(const user in data){
        if(user["handleLower"] == handleLower){
           const newHandle = handleLower + currentMaxNum
           currentMaxNum ++ 
           formatAlias(newHandle, currentMaxNum)
        }
}
    return handleLower
} 

export {authRegisterV1, authLoginV1};


