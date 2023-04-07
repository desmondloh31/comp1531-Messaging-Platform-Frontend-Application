import express, { json, Request, Response } from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import { channelDetailsV1, channelJoinV1, channelInviteV1, 
channelMessagesV1, channelLeaveV1, channelAddOwnerV1, 
channelRemoveOwnerV1 } from './channel';


import { dmCreate,dmList } from './dm';

import { clearV1 } from './other';

import { authRegisterV1, authLoginV1, authLogoutV1 } from './auth';
import { tokenCreate, tokenVerify } from './token';
import { userProfileV1, usersAllV1 } from './users';
import { channelsCreateV1, channelsListV1, channelsListAllV1 } from './channels';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));


const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || '127.0.0.1';

// Example get request
app.get('/echo', (req: Request, res: Response, next) => {
  const data = req.query.echo as string;
  return res.json(echo(data));
});

//All http function wrappers for All Functions:
app.post('/auth/login/v2',(req: Request, res: Response) => {
  const { email, password } = req.body;
  let authid = authLoginV1(email,password);
  res.json(authid);
  
});

app.post('/auth/register/v2',(req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast} = req.body;
  let authid = authRegisterV1(email,password,nameFirst,nameLast);

  return res.json(authid);

  res.json(authid);
});

app.post('/channels/create/v2',(req: Request, res: Response) => {
  const { token, name, isPublic } = req.body;
  res.json(channelsCreateV1(token, name, isPublic));
  
});

app.get('/channels/list/v2',(req: Request, res: Response) => {
  const token = req.query.token as string;
  const result = channelsListV1(token);
  res.json(result);
  
});

app.get('/channels/listall/v2',(req: Request, res: Response) => {
  const token = req.query.token as string;
  const result = channelsListAllV1(token);
  res.json(result);
  
});

app.get('/channel/details/v2',(req: Request, res: Response) => {
  const token = req.query.token as string;
  const channelId = parseInt(req.query.channelId as string);
  res.json(channelDetailsV1(token, channelId));
  
});

app.post('/channel/join/v2',(req: Request, res: Response) => {
  const { token, channelId } = req.body;
  res.json(channelJoinV1(token, channelId));
});

app.post('/channel/invite/v2',(req: Request, res: Response) => {
  const { token, channelId, uId } = req.body;
  res.json(channelInviteV1(token, channelId, uId));
  
});

app.get('/channel/messages/v2',(req: Request, res: Response) => {
  //const { token, channelId, start } = req.query;
  const token = req.query.token as string;
  const channelId = parseInt(req.query.channelId as string);
  const start = parseInt(req.query.start as string);
  res.json(channelMessagesV1(token, channelId, start))
  
});

app.get('/user/profile/v2',(req: Request, res: Response) => {
  const token = req.query.token as string;
  const uId = parseInt(req.query.uId as string);
  let authid = tokenVerify(token)
  let function1 = userProfileV1(token,uId)
  res.json(function1)
});

app.delete('/clear/v1',(req: Request, res: Response) => {
  const {} = req;
  return res.json(clearV1())
});

app.post('/auth/logout/v1',(req: Request, res: Response) => {
  const { token } = req.body;
  let authid = authLogoutV1(token);
  res.json(authid);
});

app.post('/channel/leave/v1',(req: Request, res: Response) => {
  const { token, channelId } = req.body;
  res.json(channelLeaveV1(token, channelId));
});

app.post('/channel/addowner/v1',(req: Request, res: Response) => {
  const { token, channelId, uId } = req.body;
  res.json(channelAddOwnerV1(token, channelId, uId));
});

app.post('/channel/removeowner/v1',(req: Request, res: Response) => {
  const { token, channelId, uId } = req.body;
  res.json(channelRemoveOwnerV1(token, channelId, uId));
  
});

app.post('/message/send/v1',(req: Request, res: Response) => {
  const { token, channelId, message } = req.body;
  
});

app.put('/message/edit/v1',(req: Request, res: Response) => {
  const { token, messageId, message } = req.body;
  
});

app.delete('/message/remove/v1',(req: Request, res: Response) => {
  const { token, messageId } = req.body;
  
});

app.post('/dm/create/v1',(req: Request, res: Response) => {
  const { token, uIds } = req.body;
  res.json(dmCreate(token,uIds));
});

app.get('/dm/list/v1',(req: Request, res: Response) => {
  const token = req.query.token as string;
  const function2 = dmList(token)
  res.json(function2)

});

app.delete('/dm/remove/v1',(req: Request, res: Response) => {
  const { token, dmId } = req.query;
  
});

app.get('/dm/details/v1',(req: Request, res: Response) => {
  const { token, dmId } = req.query;
  
});

app.post('/dm/leave/v1',(req: Request, res: Response) => {
  const { token, dmId } = req.body;
  
});

app.get('/dm/messages/v1',(req: Request, res: Response) => {
  const { token, dmId, start } = req.query;
  
});

app.post('/message/senddm/v1',(req: Request, res: Response) => {
  const { token, dmId, message } = req.body;
  
});

app.get('/users/all/v1',(req: Request, res: Response) => {
  const token = req.query.token as string;
  const function2 = usersAllV1(token)
  res.json(function2)
});

app.put('/user/profile/setname/v1',(req: Request, res: Response) => {
  const { token, nameFirst, nameLast } = req.body;
  let function1 = userProfileSetnameV1(token, nameFirst, nameLast)
  res.json(function1)
});

app.put('/user/profile/setemail/v1',(req: Request, res: Response) => {
  const { token, email } = req.body;
  let function1 = userProfileSetemailV1(token, email)
  res.json (function1)
});

app.put('/user/profile/sethandle/v1',(req: Request, res: Response) => {
  const { token, handleStr } = req.body;
  let function1 = userProfileSethandleV1(token, handleStr)
  res.json(function1)
});

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
