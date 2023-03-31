import {getData, setData} from './dataStore';
import validator from 'validator';
import { token } from 'morgan';

export function tokenCreate(email: string){
    const data = getData();
    let token: string;
    const user = data.users.find(i => i.email === email);
    
    if(!user){
        return {error: "email not found"}
    }

    if(validator.isEmail(email) === false){
        return{error:"email is invalid"}
    }
    //check for repition
    token = Math.floor(Math.random() * 1000000000).toString();
    while(data.users.find(i => i.token.includes(token))){
        token = Math.floor(Math.random() * 1000000000).toString();
    }
    user.token.push(token)
    setData(data);
    return token;
}

export function tokenVerify(token: string){
    const data = getData();
    let user: number = -1;
    for (let i = 0; i < data.users.length; i++){
        for (let j = 0; j < data.users[i].token.length; j++){
            if (data.users[i].token[j] === token){
                user = data.users[i].authUserId
            }
        }
    }
    if(user == -1){
        return {error: "token is invalid"}
    }
    return user;
}

export function tokenDelete(token: string){
    const data = getData();
    const user = data.users.find(i => i.token.includes(token));
    if(!user){
        return {error: "token is invalid"}
    }
    const index = user.token.indexOf(token);
    user.token.splice(index, 1);
    setData(data);
    return user.authUserId;
}