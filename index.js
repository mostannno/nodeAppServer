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

app.post('/student/login', async (req, res) => {
  // 参数校验
  let manager = req.body;
  if (!manager.pwd || !manager.name) {
    res.status(400);
    res.json({ status: FAIL });
    return;
  }

  //查询是否存在
  try {
    await app.managerModel.find({ name: manager.name }, (err, results) => {
      if (err) throw new Error('login failed');
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
  } catch(e) {
    res.status(500);
    res.send(null);
  }
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

  // 检查是否已经有同名用户存在
  let flag = false;
  try {
    await app.managerModel.find({ name: manager.get('name') }, (err, results) => {
      if (err) throw new Error(err);
      if (results.length) {
        res.send({
          status: FAIL,
          extraMessage: 'user exist'
        });
        flag = true;
      }
    });
  } catch(e) {
    res.status(500);
    res.send(null);
    return;
  }
  if (flag) return;

  // 加密
  const key = getRandomKey();
  const hmac = crypto.createHmac('sha256', key);
  const pwd = hmac.update(manager.pwd).digest('hex');
  manager = manager.set('key', key).set('pwd', pwd);
  try {
    await app.managerModel.save(manager.toJS());
    res.json({ status: SUCCESS });
  } catch(e) {
    res.status(500);
    res.send(null);
  }
});

app.get('/student/getAllUser', async (req, res) => {
  let users = null;
  try {
    await app.userModel.find({}, (err, results) => {
      if (err) throw new Error('getAllUser failed');
      users = results;
    });
  } catch(e) {
    res.status(500);
    res.send(null);
    return;
  }
  res.json(users);
});

app.post('/student/deleteUser', (req, res) => {
  const { managerId, userId } = req.body;

});

app.post('/student/addUser', async (req, res) => {
  console.log(req.cookies);
  let user = req.body;
  user = User.fromJS(user);
  if (!user) {
    res.status(400);
    res.json({ status: FAIL });
    return;
  }

  // 检查是否已经有相同学号
  let flag = false;
  try {
    await app.userModel.find({ studentNumber: user.get('studentNumber') }, (err, results) => {
      if (err) throw new Error(err);
      if (results.length) {
        res.send({
          status: FAIL,
          extraMessage: 'repetition studentNumber'
        });
        flag = true;
      }
    });
  } catch(e) {
    res.status(500);
    res.send(null);
    return;
  }
  if (flag) return;

  // 保存
  try {
    const res = await app.userModel.save(user.toJS());
    if (res) throw res;
  } catch(e) {
    res.status(500);
    res.json({
      status: FAIL
    });
    return;
  }
  res.json({
    status: SUCCESS
  });
});

const server = app.listen(8080);
