import { channelMessagesV1 } from './channel.js';

const ERROR = { error: expect.any(String) };

describe('Error Checking in channel invite v1', () => {
    beforeEach (() => {
        const data = {
            users: [
                {
                  uId: 1,
                  nameFirst: 'generic',
                  nameLast: 'man',
                  email: 'genericman@unsw.edu.au',
                  password: 'ilovecomputers',     
                },
                {
                    uId: 2,
                    nameFirst: 'jacob',
                    nameLast: 'smith',
                    email: 'jacobsmith@unsw.edu.au',
                    password: '12345',     
                }
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
              ],            
        };
        setData(data);
    });

    test('invalid authuser id', () => {
        expect(channelMessagesV1({ authUserId: -1, channelId: 1, start: 0 })).toStrictEqual(ERROR);
    });

    test('invalid channel id', () => {
        expect(channelMessagesV1({ authUserId: 1, channelId: -1, start: 0 })).toStrictEqual(ERROR);
    });

    test('invalid start', () => {
        expect(channelMessagesV1({ authUserId: 1, channelId: 1, start: 9999 })).toStrictEqual(ERROR);
    });

    test('Authuser not part of channel', () => {
        expect(channelMessagesV1({ authUserId: 2, channelId: 1, start: 0 })).toStrictEqual(ERROR);
    });

});

describe('Valid tests for channel msgs v1', () => {
    beforeEach (() => {
        const data = {
            users: [
                {
                  uId: 1,
                  nameFirst: 'generic',
                  nameLast: 'man',
                  email: 'genericman@unsw.edu.au',
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
                        reactions: [],
                      },
                      {
                        messageId: 2,
                        senderId: 1,
                        message: 'How is everyone doing?',
                        timeSent: 1582426790,
                        reactions: [],
                      },
                      
                    ],
                  },
              ],            
        };
        setData(data);
    });

    test('no more messages to load', () => {
        expect(channelMessagesV1({ authUserId: 1, channelId: 1, start: 0 })).toStrictEqual([
            {
              messageId: 1,
              senderId: 1,
              message: 'Hello World!',
              timeSent: 1582426789,
              reactions: [],
            },
            {
              messageId: 2,
              senderId: 1,
              message: 'How is everyone doing?',
              timeSent: 1582426790,
              reactions: [],
            },
            
          ], 0, -1);
    });

});