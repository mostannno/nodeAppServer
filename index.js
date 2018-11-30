const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

const mongooseInit = require('./server/mongoose');
const appInit = require('./appInit');

const getRandomKey = require('./util/getRandomKey');
const { encrypt, decrypt } = require('./util/crypt');

const User = require('./models/User');
const Manager = require('./models/Manager');

const FAIL = 0, SUCCESS = 1, LOGIN_KEY = crypto.createHash('md5').digest();;

const app = express();

app.use('*',function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*'); 
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept');
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  if (req.method == 'OPTIONS') {
    res.status(200);
    res.send(null);
  } else {
    next();
  }
});
app.use(bodyParser.json());
app.use(cookieParser());
mongooseInit();
appInit(app);

app.post('/student/login', (req, res) => {
  // 参数校验
  let manager = req.body;
  if (!manager.pwd || !manager.name) {
    res.status(400);
    res.json({ status: FAIL });
    return;
  }

  app.managerModel.find({ name: manager.name }, (err, results) => {
    if (err) {
      res.status(500);
      res.send(null);
      return;
    };
    if (!results.length) {
      res.json({
        status: FAIL,
        extraMessage: 'manager not found'
      });
      return;
    }

    const hmac = crypto.createHmac('sha256', results[0].key);
    if (hmac.update(manager.pwd).digest('hex') === results[0].pwd) {
      const token = encrypt(manager.name, LOGIN_KEY);
      res.cookie('token', token);
      res.json({
        status: SUCCESS
      })
    }
  });
});

app.post('/student/submit', async (req, res) => {
  // 参数校验
  let manager = req.body;
  manager = Manager.fromJS(manager);
  if (!manager) {
    res.status(400);
    res.json({ status: FAIL });
    return;
  }

  // 加密保存
  const key = getRandomKey();
  const hmac = crypto.createHmac('sha256', key);
  const pwd = hmac.update(manager.pwd).digest('hex');
  manager = manager.set('key', key).set('pwd', pwd);
  try {
    const resp = await app.managerModel.saveManager(manager.toJS());
    if (resp) throw resp;
    res.json({ status: SUCCESS });
  } catch(e) {
    if (e.message = app.alreadyExist) {
      res.json({
        status: FAIL,
        extraMessage: app.alreadyExist
      });
      return;
    }
    res.status(500);
    res.send(null);
  }
});

app.get('/student/getAllUser', (req, res) => {
  app.userModel.find({}, (err, results) => {
      if (err) {
        res.status(500);
        res.send(null);
        return;
      }
      res.json(results);
  });
});

app.post('/student/deleteUser', (req, res) => {
  const { managerId, userId } = req.body;

});

app.post('/student/addUser', async (req, res) => {
  console.log('cookies', req.signedCookies, req.cookies.token);
  let user = req.body;
  user = User.fromJS(user);
  if (!user) {
    res.status(400);
    res.json({ status: FAIL });
    return;
  }

  // 保存
  try {
    const resp = await app.userModel.saveUser(user.toJS());
    if (resp) throw resp;
    res.json({ status: SUCCESS });
  } catch(e) {
    if (e.message = app.alreadyExist) {
      res.json({
        status: FAIL,
        extraMessage: app.alreadyExist
      });
      return;
    }
    res.status(500);
    res.json({ status: FAIL });
  }
});

const server = app.listen(8080);
