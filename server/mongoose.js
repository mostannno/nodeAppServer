const mongoose = require('mongoose');

const DB_URL = 'mongodb://localhost:27017/manage'

const init = () => {
  mongoose.connect(DB_URL, { useNewUrlParser: true });

  mongoose.connection.on('connected', () => { 
    console.log('login');
  });
  mongoose.connection.on('error', (err) => { console.log(`login err: ${err}`) });
}
module.exports = init;