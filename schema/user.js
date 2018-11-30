const { Schema } = require('mongoose');

const UserSchema = new Schema({
  name: String,
  studentNumber: String, //学号
  major: String, //专业
  enrollmentDate: String //入学时间
});

module.exports = UserSchema;