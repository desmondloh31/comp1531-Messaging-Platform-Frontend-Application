// YOU SHOULD MODIFY THIS OBJECT BELOW
import fs from 'fs'

interface usr {
  authUserId: number;
  nameFirst: string;
  nameLast: string;
  email: string;
  handleStr: string;
  password: string;
  token: string[];
  resetCode: number
  deletedEmail: string
  deletedHandle: string
  notifications: notification[]
}

interface notification{
  notificationId: number
  message: string
  timestamp: number
}

interface msg {
  messageId: number;
  senderId: number;
  message: string;
  timeSent: number;
}

interface cnl {
  channelId: number;
  name: string;
  isPublic: boolean;
  allMembers: number[];
  ownerMembers: number[];
  messages: msg[],
}



interface dm {
  name: string[];
  dmId: number;
  creator: number;
  allMembers: number[];
  messages: msg[];
}

interface db {
  users: usr[];
  channels: cnl[];
  dms: dm[];
  msgcount: number;
}

let data: db = {
  users: [],
  channels: [],
  dms: [],
  msgcount: 0,

};

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// Use get() to access the data
//const dataStorePath = './storage.json'
function getData() {
  
  //data = JSON.parse(String(fs.readFileSync(dataStorePath)))
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
// - Only needs to be used if you replace the data store entirely
// - Javascript uses pass-by-reference for objects... read more here: https://stackoverflow.com/questions/13104494/does-javascript-pass-by-reference
// Hint: this function might be useful to edit in iteration 2
function setData(newData: db) {
  data = newData;
  //fs.writeFileSync(dataStorePath, JSON.stringify(newData,null,4))
  
}


export { getData, setData };