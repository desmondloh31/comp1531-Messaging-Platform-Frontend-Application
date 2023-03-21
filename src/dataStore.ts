// YOU SHOULD MODIFY THIS OBJECT BELOW

interface usr {
  authUserId: number;
  nameFirst: string;
  nameLast: string;
  email: string;
  formattedHandle: string;
  password: string;
}

interface cnl {
  channelId: number;
  name: string;
  isPublic: boolean;
  allMembers: number[];
  ownerMembers: number[];
  messages: msg[],
}

interface msg {
  messageId: number;
  senderId: number;
  message: string;
  timeSent: number;
}

interface db {
  users: usr[];
  channels: cnl[];
}

let data: db = {
  users: [],
  channels: [],

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
function getData() {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
// - Only needs to be used if you replace the data store entirely
// - Javascript uses pass-by-reference for objects... read more here: https://stackoverflow.com/questions/13104494/does-javascript-pass-by-reference
// Hint: this function might be useful to edit in iteration 2
function setData(newData: db) {
  data = newData;
}

export { getData, setData };
