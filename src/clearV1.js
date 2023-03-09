import { setData } from "./dataStore";

function clear(){
    setData(
        {
            users: [
              {    
              },
            ],
          
            channels: [
                {
                  messages: [
                    {
                      reactions: [
                        {
                        },
                      ],
                    },
                  ],
                },
            ]
        }
    )      
}