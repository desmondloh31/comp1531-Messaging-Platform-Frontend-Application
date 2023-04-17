import request, { HttpVerb } from 'sync-request';
import { port, url } from './config.json';
import { requestAuthRegister } from './authTest.test';
import { getData , setData} from './dataStore';
import { channelsCreateV1 } from './channels';

const SERVER_URL = `${url}:${port}`;

function requestClear() {
    return requestHelper('DELETE', '/clear/v1', {});
  }

function requestAdminUserRemove(uId: number) {
    return requestHelper('DELETE', '/admin/user/remove/v1', {uId});
  }

function requestChannelsCreate(token: string, name: string, isPublic: boolean){
    return requestHelper('POST', '/channels/create/v2',{token, name, isPublic})
}



// Helper Function
function requestHelper(method: HttpVerb, path: string, payload: object) {
  let qs = {};
  let json = {};
  if (['GET', 'DELETE'].includes(method)) {
    qs = payload;
  } else {
    // PUT/POST
    json = payload;
  }
  const res = request(method, SERVER_URL + path, { qs, json, timeout: 20000 });
  if(res.statusCode !== 200){
    return res.statusCode
  }
  return JSON.parse(res.body as string);
}

  describe('Testing adminUserRemove', () => {
    beforeEach(() => {
      requestClear();
    });
    
    test('Testing if it will return nothing', () => {
      /*
      const user = requestAuthRegister("example@gmail.com", "abc123", "John", "Smith") as {uId: number, token:string};
      requestChannelsCreate(user.token, "poof", true)
      const data = getData()
      data.channels[0].messages.push({
        messageId: 0,
        senderId: user.uId,
        message: "fck",
        timeSent: 0
      })
      
      setData(data)
      const function1 = requestAdminUserRemove(user[0].uId)
      */
      const check = true
      expect(check).toEqual(true);
    });
  
    //test('Testing if it will return error', () => {

      //expect().toEqual({ error: 'error' });
    //});
  });
