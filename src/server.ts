import express, { json, Request, Response } from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';

import {
  channelDetailsV1, channelJoinV1, channelInviteV1,
  channelMessagesV1, channelLeaveV1, channelAddOwnerV1,
  channelRemoveOwnerV1, messageDeleteV1, messageEditV1, messageSendV1, dmMessagesV1
} from './channel';
import { dmCreate, dmList, dmRemoveV1, dmDetailsV1, dmLeaveV1 } from './dm';
import {
  messageUnpinV1, messagePinV1, messageReactV1, messageUnreactV1,
  messageShareV1, messageSendLaterV1, messageSendLaterDmV1
} from './message';
import { clearV1 } from './other';

import { authRegisterV1, authLoginV1, authLogoutV1, authPasswordResetRequestV1, authPasswordResetResetV1 } from './auth';
import { tokenVerify } from './token';
import {
  userProfileV1, usersAllV1, userProfileSetemailV1, userProfileSethandleV1,
  userProfileSetnameV1, uploadPhotoV1
} from './users';
import { channelsCreateV1, channelsListAllV1, channelsListV1 } from './channels';
import { getNotificationsV1, searchV1, standupActiveV1, standupSendV1, standupStartV1 } from './standup';
import { adminUserRemoveV1 } from './admin';
import { escape } from 'querystring';
import { userStatsV1, usersStatsV1 } from './stats';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// Example get request
app.get('/echo', (req: Request, res: Response, next) => {
  const data = req.query.echo as string;
  return res.json(echo(data));
});

// Keep this BENEATH route definitions
// handles errors nicely
// app.use(errorHandler());
// All http function wrappers for All Functions:
app.post('/auth/login/v3', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const authid = authLoginV1(email, password);
  res.json(authid);
});

app.post('/auth/register/v3', (req: Request, res: Response) => {
  // const { email, password, nameFirst, nameLast } = req.body
  const email = req.body.email as string;
  const password = req.body.password as string;
  const nameFirst = req.body.nameFirst as string;
  const nameLast = req.body.nameLast as string;
  const authid = authRegisterV1(email, password, nameFirst, nameLast);
  return res.json(authid);
});

app.post('/channels/create/v3', (req: Request, res: Response) => {
  const { name, isPublic } = req.body;
  const token = req.header('token');
  res.json(channelsCreateV1(token, name, isPublic));
});

app.get('/channels/list/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  const result = channelsListV1(token);
  res.json(result);
});

app.get('/channels/listall/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  const result = channelsListAllV1(token);
  res.json(result);
});

app.get('/channel/details/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  const channelId = parseInt(req.query.channelId as string);
  res.json(channelDetailsV1(token, channelId));
});

app.post('/channel/join/v3', (req: Request, res: Response) => {
  const { channelId } = req.body;
  const token = req.header('token');
  res.json(channelJoinV1(token, channelId));
});

app.post('/channel/invite/v3', (req: Request, res: Response) => {
  const { channelId, uId } = req.body;
  const token = req.header('token');
  return res.json(channelInviteV1(tokenVerify(token as string) as number, channelId, uId));
});

app.get('/channel/messages/v3', (req: Request, res: Response) => {
  // const { token, channelId, start } = req.query;
  const { channelId, start } = req.query;
  const token = req.header('token');
  return res.json(channelMessagesV1(tokenVerify(token as string) as number, parseInt(channelId as string), parseInt(start as string)));
});

app.get('/user/profile/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  const uId = parseInt(req.query.uId as string);
  const function1 = userProfileV1(token, uId);
  res.json(function1);
});

app.delete('/clear/v1', (req: Request, res: Response) => {
  return res.json(clearV1());
});

app.post('/auth/logout/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const authid = authLogoutV1(token);
  res.json(authid);
});

app.post('/channel/leave/v2', (req: Request, res: Response) => {
  const { channelId } = req.body;
  const token = req.header('token');
  res.json(channelLeaveV1(token, channelId));
});

app.post('/channel/addowner/v2', (req: Request, res: Response) => {
  const { channelId, uId } = req.body;
  const token = req.header('token');
  res.json(channelAddOwnerV1(token, channelId, uId));
});

app.post('/channel/removeowner/v2', (req: Request, res: Response) => {
  const { channelId, uId } = req.body;
  const token = req.header('token');
  res.json(channelRemoveOwnerV1(token, channelId, uId));
});

app.post('/message/send/v2', (req: Request, res: Response) => {
  const { channelId, message } = req.body;
  const token = req.header('token');
  return res.json(messageSendV1(tokenVerify(token) as number, channelId, -1, message));
});

app.put('/message/edit/v2', (req: Request, res: Response) => {
  const { messageId, message } = req.body;
  const token = req.header('token');
  return res.json(messageEditV1(token, messageId, message));
});

app.delete('/message/remove/v2', (req: Request, res: Response) => {
  const { messageId } = req.query;
  const token = req.header('token');
  return res.json(messageDeleteV1(token as string, parseInt(messageId as string)));
});

app.post('/dm/create/v2', (req: Request, res: Response) => {
  const { uIds } = req.body;
  const token = req.header('token');
  res.json(dmCreate(token, uIds));
});

app.get('/dm/list/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const function2 = dmList(token);
  res.json(function2);
});

app.delete('/dm/remove/v2', (req: Request, res: Response) => {
  const { dmId } = req.query;
  const token = req.header('token');
  return res.json(dmRemoveV1(token as string, parseInt(dmId as string)));
});

app.get('/dm/details/v2', (req: Request, res: Response) => {
  const { dmId } = req.query;
  const token = req.header('token');
  return res.json(dmDetailsV1(token as string, parseInt(dmId as string)));
});

app.post('/dm/leave/v2', (req: Request, res: Response) => {
  const { dmId } = req.body;
  const token = req.header('token');
  return res.json(dmLeaveV1(token, dmId));
});

app.get('/dm/messages/v2', (req: Request, res: Response) => {
  const { dmId, start } = req.query;
  const token = req.header('token');
  return res.json(dmMessagesV1(token as string, parseInt(dmId as string), parseInt(start as string)));
});

app.post('/message/senddm/v2', (req: Request, res: Response) => {
  const { dmId, message } = req.body;
  const token = req.header('token');
  return res.json(messageSendV1(tokenVerify(token) as number, -1, dmId, message));
});

app.post('/message/react/v1', (req: Request, res: Response) => {
  const { messageId, reactId } = req.body;
  const token = req.header('token');
  return res.json(messageReactV1(token, messageId, reactId));
});

app.post('/message/unreact/v1', (req: Request, res: Response) => {
  const { messageId, reactId } = req.body;
  const token = req.header('token');
  return res.json(messageUnreactV1(token, messageId, reactId));
});

app.post('/message/pin/v1', (req: Request, res: Response) => {
  const { messageId } = req.body;
  const token = req.header('token');
  return res.json(messagePinV1(token, messageId));
});

app.post('/message/unpin/v1', (req: Request, res: Response) => {
  const { messageId } = req.body;
  const token = req.header('token');
  return res.json(messageUnpinV1(token, messageId));
});

app.post('/message/share/v1', (req: Request, res: Response) => {
  const { channelId, ogMessageId, message, dmId } = req.body;
  const token = req.header('token');
  return res.json(messageShareV1(token, ogMessageId, channelId, dmId, message));
});

app.post('/message/sendlater/v1', (req: Request, res: Response) => {
  const { channelId, message, timeSent } = req.body;
  const token = req.header('token');
  return res.json(messageSendLaterV1(token, channelId, message, timeSent));
});

app.post('/message/sendlaterdm/v1', (req: Request, res: Response) => {
  const { dmId, message, timeSent } = req.body;
  const token = req.header('token');
  return res.json(messageSendLaterDmV1(token, dmId, message, timeSent));
});

app.get('/users/all/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const function2 = usersAllV1(token);
  res.json(function2);
});

app.put('/user/profile/setname/v2', (req: Request, res: Response) => {
  const { nameFirst, nameLast } = req.body;
  const token = req.header('token');
  const function1 = userProfileSetnameV1(token, nameFirst, nameLast);
  res.json(function1);
});

app.put('/user/profile/setemail/v2', (req: Request, res: Response) => {
  const { email } = req.body;
  const token = req.header('token');
  const function1 = userProfileSetemailV1(token, email);
  res.json(function1);
});

app.put('/user/profile/sethandle/v2', (req: Request, res: Response) => {
  const { handleStr } = req.body;
  const token = req.header('token');
  const function1 = userProfileSethandleV1(token, handleStr);
  res.json(function1);
});

app.get('/notifications/get/v1', (req: Request, res: Response) => {
  const token = req.query.token as string;
  // const oldestNotificationId = parseInt(req.query.notificationId as string);
  res.json(getNotificationsV1(token));
});

app.get('/search/v1', (req: Request, res: Response) => {
  // const token = req.query.token as string;
  const queryStr = req.query.message as string;
  res.json(searchV1(queryStr));
});

app.post('/standup/start/v1', (req: Request, res: Response) => {
  const { channelId, length } = req.body;
  const token = req.header('token');
  return res.json(standupStartV1(token, channelId, length));
});

app.get('/standup/active/v1', (req: Request, res: Response) => {
  const { channelId } = req.query;
  const token = req.header('token');
  return res.json(standupActiveV1(token as string, parseInt(channelId as string)));
});

app.post('/standup/send/v1', (req: Request, res: Response) => {
  const { channelId, message } = req.body;
  const token = req.header('token');
  return res.json(standupSendV1(token, channelId, message));
});

app.delete('/admin/user/remove/v1', (req: Request, res: Response) => {
  const uId = parseInt(req.query.uId as string);
  const function1 = adminUserRemoveV1(uId);
  res.json(function1);
});

app.post('/auth/passwordreset/request/v1', (req: Request, res: Response) => {
  const { email } = req.body;
  const authid = authPasswordResetRequestV1(email);
  res.json(authid);
});

app.post('/auth/passwordreset/reset/v1', (req: Request, res: Response) => {
  const { resetCode, newPassword } = req.body;
  const authid = authPasswordResetResetV1(resetCode, newPassword);
  res.json(authid);
});

app.post('/user/profile/uploadphoto/v1', (req: Request, res: Response) => {
  const { imgUrl, xStart, yStart, xEnd, yEnd } = req.body;
  const authid = uploadPhotoV1(imgUrl, xStart, yStart, xEnd, yEnd);
  res.json(authid);
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
app.use(errorHandler());
