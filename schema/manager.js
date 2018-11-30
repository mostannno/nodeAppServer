const { Schema } = require('mongoose');

const ManagerSchema = new Schema({
  name: String,
  pwd: String,
  key: String
});

module.exports = ManagerSchema;