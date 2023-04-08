import {getData,setData } from './dataStore';
import { tokenVerify } from './token';
/**
 * DESCRIPTION
 * copy from table
 * @param {string} token - token string
 * @param {array} uIds - array of userIds
 * 
 * @returns {number} - dmId: array of objects, where each object contains types { dmId, name }  
 * 
 * 
 */



export function dmCreate(token:string, uIds: number[] ){
    const data = getData();
    const authUserId = tokenVerify(token) as number;
    
    const authUser = data.users.find(i => i.authUserId === authUserId);
    if (!authUser) {
      return { error: "Invalid Token"};
    }
  
    // Determining whether there are duplicates user Ids in uIds
    const duplicates = uIds.filter((value, index) => uIds.indexOf(value) !== index);
    let handleArray = [];

    // Find the creators user handle by the token
    // Push their user handle to handleArray
    let creator = data.users.find(i => i.authUserId === authUserId);
    handleArray.push(creator.formattedHandle);

    if(duplicates.length === 0){
        // Checking if uIds are registered to a valid user
        for (const authId of uIds) {   
            const user = data.users.find(i => i.authUserId === authId);
            
            if(!user){              
                return {error: 'authUserId is invalid'}
            }
            // Assign the user handles to name if it is in the uIds array
            else {
                handleArray.push(user.formattedHandle)
               
            }      
        }
    
    // Sorting the handleArray alphabetically
    handleArray.sort();

    }
    else{
        return {error: 'Duplicate User Ids'};
    }
    // turn handleArray into a string seperated by commas
    let handlename = handleArray.join(', ');
    /// Create a dmId by iterating msgCount
    let dmId: number;
    
    dmId = data.msgcount;
    data.msgcount += 1;

    uIds.push(authUserId);
    
    data.dms.push({
        name: handlename,
        dmId: dmId,
        creator: creator.authUserId,
        allMembers: uIds,
        messages: [],
    })


    return {dmId: dmId};
}


/**
 * 
 * @param {string} token - token string
 * 
 * @returns {array} - dms: array of objects, where each object contains types { dmId, name }  
 * 
 * 
 */

export function dmList(token: string){
    const data = getData();
    let dmlists = [];

    // Check token in users to check what to authUser id is
    // 
    let uId: number;
    for(const user of data.users){
        if (user.token[0] === token){
            uId = user.authUserId;
        } 
    }

    //Now check for uId in dms in creator and allMembers
    const dmCreator =  data.dms.find(i => i.creator === uId);
    
    
    if(!dmCreator){
        let namesis: string;
        let dmids: number;
        for(const dm in data.dms){
            if(data.dms[dm].allMembers.find(i => i === uId)){
                namesis = data.dms[dm].name;
                dmids =  data.dms[dm].dmId;
                dmlists.push({dmids,namesis});          
            }
        }
    }
    else{
        let a: string;
        let b: number;
        b = dmCreator.dmId;
        a = dmCreator.name;
        dmlists.push({b, a});
    }


    return dmlists;
}

// /dm/remove/v1Remove an existing DM, so all members are no longer in the DM. 
//This can only be done by the original creator of the DM.

export function dmRemoveV1(token: string, dmId: number){
    const data = getData();
    const authUserId = tokenVerify(token) as number;
    const authUser = data.users.find(i => i.authUserId === authUserId);

    if (!authUser) {
      return { error: "Invalid Token"};
    }

    const dm = data.dms.find(i => i.dmId === dmId);
    if(!dm){
        return {error: 'dmId is invalid'};
    }

    else if(dm.creator !== authUserId){
        return {error: 'Only the creator of the DM can remove it'};
    }

    else{
        const index = data.dms.indexOf(dm);
        data.dms.splice(index, 1);
        return {};
    }
}

// /dm/details/v1Given a DM with ID dmId that the authorised user is a member of,
// provide basic details about the DM.

export function dmDetailsV1(token: string, dmId: number){
    const data = getData();
    const authUserId = tokenVerify(token) as number;
    const authUser = data.users.find(i => i.authUserId === authUserId);
    
    if (!authUser) {
      return { error: "Invalid Token"};
    }

    const dm = data.dms.find(i => i.dmId === dmId);

    if(!dm){
        return {error: 'dmId is invalid'};
    }
    
    
    if(dm.allMembers.includes(authUserId)){
        return {name: dm.name, members: dm.allMembers};
    } else {
        return {error: 'User is not a member of the DM'};
    }
}

// /dm/leave/v1 Given a DM ID, the user is removed as a member of this DM. 
// The creator is allowed to leave and the DM will still exist if this happens.
// This does not update the name of the DM.

export function dmLeaveV1(token: string, dmId: number){
    const data = getData();
    const authUserId = tokenVerify(token) as number;
    const authUser = data.users.find(i => i.authUserId === authUserId);
    const dm = data.dms.find(i => i.dmId === dmId);

    if (!authUser) {
      return { error: "Invalid Token"};
    }

    if(!dm){
        return {error: 'dmId is invalid'};
    }

    if(!dm.allMembers.includes(authUserId)){
        return {error: 'User is not a member of the DM'};
    }

    // If the user is the creator of the DM
    if(dm.creator === authUserId){
        // Remove the user from the DM
        dm.creator = 0;
    }

    const index = dm.allMembers.indexOf(authUserId);
    dm.allMembers.splice(index, 1);
    return {};
}