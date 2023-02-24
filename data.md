```javascript
let Users = [
{
    authUserId: 4,
    uId: 1,
    nameFirst: "John",
    nameLast: "Smith",
    email: "genericman@gmail.com"
    password: "password123",
    name: "generic_man"
},
]

//ownerMembers and allMembers only stores the Uid for each user

let Channels = [
{
     channelId: 1,
     name: 'My Channel',
     users: Users,
     ownerMembers: [1,], 
     allMembers: [1,],
     msg: messages 
},
]


let messages = [
    {
      messageId: 1,
      uId: 1,
      channelId: 1,
      message: 'Hello world',
      timeSent: 1582426789,
    },
  start: 0,
  end: 50,
]


```

[Optional] short description: 

Design for the data needed to be stored in Memes
