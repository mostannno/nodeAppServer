const { Record } = require('immutable');

class Manager extends Record({
  name: '',
  pwd: '',
  key: ''
}) {

}

Manager.fromJS = (data) => {
  if (!data.name || !data.pwd) return false;
  return new Manager(data);
}

module.exports = Manager;