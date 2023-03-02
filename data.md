```javascript

  let data = {
  users: [
    {
      uId: 1,
      nameFirst: 'generic',
      nameLast: 'man',
      email: 'genericman@unsw.edu.au',
      handleStr: 'genericman',
      password: 'ilovecomputers',     
    },
  ],

  channels: [
      {
        channelId: 1,
        name: 'Private Channel',
        isPublic: false,
        ownerIds: [1],
        memberIds: [1],
        messages: [
          {
            messageId: 1,
            senderId: 1,
            message: 'Hello World!',
            timeSent: 1582426789,
            reactions: [
              {
                reactionName: 'Heart',
                unicode: 'U+2764',
                timesUsed: 3,
              },
            ],
          },
        ],
      },
  ]
}



```

[Optional] short description: 

Design for the data needed to be stored in Memes
