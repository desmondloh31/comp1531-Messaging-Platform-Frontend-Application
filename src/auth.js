import {getData, setData} from './dataStore';
import { uuid } from 'uuidv4';

function authRegisterV1(email, password, nameFirst, nameLast) {
    const { uuid } = require('uuidv4');
    const data = getData()
    const authUserId = uuid()
    data.users["email"] = {
        email
    }
    data.users["password"] = {
        password
    }
    data.users["nameFirst"] = {
        nameFirst
    }
    data.users["nameLast"] = {
        nameLast
    }
    data.users["authUserId"] = {
        authUserId
    }
    
    setData(data)
    return{
        authUserId
    }
  }


function authLoginV1(email, password) {

    const data = getData()
    for (const user in data){
        if (findEmail(user["email"], email)){
            if(user["password"] == password){
                return user["authUserId"]
            } 
            else{
                return {error:"error"}
            }
        }
    }
}


function findEmail(useremail, email){
    if (useremail == email){

        return True
    }
}

export {authRegisterV1, authLoginV1};