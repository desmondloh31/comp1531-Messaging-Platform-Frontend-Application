
import {getData, setData} from './dataStore';
import validator from 'validator';
import {tokenCreate, tokenVerify, tokenDelete, tokenExists} from './token' 
import crypto from 'crypto'
import { getHashOf } from './other';
import { resetPasswordEmail } from './other';

export function adminUserRemoveV1(uId: number){
    const data = getData()
    for(const channel of data.channels){
        let user = channel.allMembers.find(i => i = uId)
        const index = channel.allMembers.indexOf(user)
        delete channel.allMembers[index]

        for(const message of channel.messages){
            if(message.senderId === uId){
                message.message = "Removed user"
            }
        }
    }
    for(const dms of data.dms){
        let user = dms.allMembers.find(i => i= uId)
        const index = dms.allMembers[user]
        delete dms.allMembers[index]

        for(const message of dms.messages){
            if(message.senderId === uId){
                message.message = "Removed user"
            }
        }
    }
    let user = data.users.find(i => i.authUserId === uId)
    user.nameFirst = "Removed "
    user.nameLast = "user"
    user.deletedEmail = user.email
    user.email = ""
    user.deletedHandle = user.handleStr
    user.handleStr = ""

    setData(data)
}