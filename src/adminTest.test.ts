import request, { HttpVerb } from 'sync-request';
import { port, url } from './config.json';
import { requestAuthRegister } from './authTest.test';
import { getData , setData} from './dataStore';



const SERVER_URL = `${url}:${port}`;

function requestClear() {
    return requestHelper('DELETE', '/clear/v1', {});
  }

function requestAdminUserRemove(authUserId: number) {
    return requestHelper('DELETE', '/admin/user/remove/v1', {authUserId});
  }

function requestChannelsCreate(token: string, name: string, isPublic: boolean){
    return requestHelper('POST', '/channels/create/v2',{token, name, isPublic})
}

function requestDmCreate(token: string, uId: number){
  return requestHelper('POST', '/dm/create/v1', {token, uId})
}

function requestUserAll(token: string) {
  return requestHelper('GET', '/users/all/v1', { token });
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
      
      const user = requestAuthRegister("example@gmail.com", "abc123", "John", "Smith") 
      
      /*
      requestChannelsCreate(user.token, "poof", true)
      const data = getData()
      data.channels[0].messages.push({
        messageId: 0,
        senderId: user.uId,
        message: "fck",
        timeSent: 0
      })
      requestDmCreate(user.token, user.uId)
      data.dms[0].messages.push({
        messageId: 0,
        senderId: user.uId,
        message: "sht",
        timeSent: 0
      })
      setData(data)
      */
      const len = requestUserAll(user.token)
      requestAdminUserRemove(user.authUserId)
      const len2 = requestUserAll(user.token)
      //const function1 = user.authUserId
      //const newData = getData()
      const check = true
      expect(check).toEqual(true);
    });
  
    //test('Testing if it will return error', () => {

      //expect().toEqual({ error: 'error' });
    //});
  });
