const mongoose = require('mongoose');
const UserSchema = require('./schema/user');
const ManagerSchema = require('./schema/manager');

const alreadyExist = 'User Already Exsit'
const searchError = 'Search Failed';
const unExist = 'User unexist';
const mongoError = 'Mongod Error';
const error = errType => new Error(errType); 

const userModel = mongoose.model('User', UserSchema);
userModel.save = (User) => {
  userModel.find({ name: User.name} , (err, result) => {
    if (err) return error(searchError);
    if (result.length) return error(alreadyExist);
  });
  const user = new userModel(User);
  user.save((err) => {
    if (err) return error(mongoError);
  });
};

userModel.delete = (id) => {
  userModel.find({ id }, (err, result) => {
    console.log(err, result);
    if (err) return error(searchError);
    if (!result.length) return error(unExist);
  });
  userModel.deleteOne({ id }, (err) => {
    if (err) return error(mongoError);
  });
}

userModel.updateUser = (id, data) => {
  userModel.find({ id }, (err, result) => {
    if (err) return error(searchError);
    if (result.length) return error(unExist);
  });
  userModel.update({ id }, data, (err) => {
    if (err) return err;
  });
}



const managerModel = mongoose.model('Manager', ManagerSchema);
managerModel.save = (Manager) => {
  managerModel.find({ name: Manager.name }, (err, result) => {
    if (err) return error(searchError);
    if (result.length) return error(alreadyExist);
  });
  const manager = new managerModel(Manager);
  manager.save((err) => {
    if (err) return error(mongoError);
  });
}


module.exports = (app) => {
  app.userModel = userModel;
  app.managerModel = managerModel;
}