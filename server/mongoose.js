const mongoose = require('mongoose');

const DB_URL = 'mongodb://localhost:27017/manage'

const init = () => {
  mongoose.connect(DB_URL, { useNewUrlParser: true });
  mongoose.connection.on('error', (err) => { console.log(`connect mongo err: ${err}`) });
}
module.exports = init;