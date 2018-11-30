const { Record } = require('immutable');

class User extends Record({
  name: '',
  studentNumber: '', //学号
  major: '', //专业
  enrollmentDate: '' //入学时间
}) {

}

User.fromJS = (data) => {
  if (!data || !data.studentNumber || !data.name || !data.major || !data.enrollmentDate) return false;
  return new User(data);
}

module.exports = User;