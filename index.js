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

const FAIL = 0, SUCCESS = 1, LOGIN_KEY = crypto.createHash('md5').digest();
const INVALIE_TOKEN = 'token invalid';

const app = express();

// 因为是nginx代理的请求 所以不需要在这里设置
app.use('*',function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*'); 
  res.header('Access-Control-Allow-Credentials', 'true'); 
  res.header('Access-Control-Allow-Headers', 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type');
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
      // 一个小时后过期
      res.cookie('token', token, { 'expires': new Date(Date.now() +  1000 * 60 * 60) });
      res.send(JSON.stringify({
        status: SUCCESS
      }));
    } else {
      res.json({
        status: FAIL,
        extraMessage: 'wrong password'
      });
    }
  });
});

app.get('/student/preLogin', (req, res) => {
  // 检查是否已有有效token
  const token = req.cookies.token;
  if ((checkToken(token))) {
    let name =  null;
    try {
      name = decrypt(token, LOGIN_KEY);
      res.json({
        status: SUCCESS,
        name
      });
    } catch(e) {
      res.json({
        status: FAIL
      });
    }
  } else {
    res.json({
      status: FAIL
    });
  }
});

app.post('/student/search', (req, res) => {
  const keywrod = req.body.keywrod;
  const reg = new RegExp(keywrod, 'i');
  app.userModel.find({
    $or: [
      { name: { $regex: reg } },
      { studentNumber: { $regex: reg } },
      { major: { $regex: reg } },
      { enrollmentDate: { $regex: reg } }
    ]
  }, (err, results) => {
    if (err) {
      res.status(500);
      res.send(null);
    } else {
      res.json({
        status: SUCCESS,
        users: results
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

  const resp = await app.managerModel.saveManager(manager.toJS());
  errorHandler(resp, res);
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

app.post('/student/deleteUser', async (req, res) => {
  const token = await checkToken(req.cookies.token);
  if (!token) {
    res.json({
      status: FAIL,
      extraMessage: INVALIE_TOKEN
    });
    return;
  }
  const { studentNumber } = req.body;

  const resp = await app.userModel.deleteUser(studentNumber);
  errorHandler(resp, res);
});

app.post('/student/updateUser', async (req, res) => {
  const token = await checkToken(req.cookies.token);
  if (!token) {
    res.json({
      status: FAIL,
      extraMessage: INVALIE_TOKEN
    });
    return;
  }

  let user = req.body;
  user = User.fromJS(user);
  if (!user) {
    res.status(400);
    res.json({ status: FAIL });
    return;
  }

  const resp = await app.userModel.updateUser(user.studentNumber, user.toJS());
  errorHandler(resp, res);
});

app.post('/student/addUser', async (req, res) => {
  const token = await checkToken(req.cookies.token);
  if (!token) {
    res.json({
      status: FAIL,
      extraMessage: INVALIE_TOKEN
    });
    return;
  }

  let user = req.body;
  user = User.fromJS(user);
  if (!user) {
    res.status(400);
    res.json({ status: FAIL });
    return;
  }

  // 保存
  const resp = await app.userModel.saveUser(user.toJS());
  errorHandler(resp, res);
});

async function checkToken(token) {
  let flag = true;
  if (!token) flag = false;
  let name = '';
  try {
    name = decrypt(token, LOGIN_KEY);
  } catch (e) {
    flag = false;
  }
  await app.managerModel.find({ name }, (err, result) => {
    if (err || !result.length) flag = false;
  });
  return flag;
}

function errorHandler(err, res) {
  if (!err) {
    res.json({
      status: SUCCESS
    });
    return;
  }
  if (err.message === app.unExist || err.message === app.alreadyExist) {
    res.json({
      status: FAIL,
      extraMessage: err.message
    })
  } else {
    res.status(500);
    res.send(null);
  }
}

const server = app.listen(8080);
