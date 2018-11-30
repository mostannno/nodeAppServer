const mongoose = require('mongoose');
const UserSchema = require('./schema/user');
const ManagerSchema = require('./schema/manager');

const alreadyExist = 'User Already Exsit'
const searchError = 'Search Failed';
const unExist = 'User unexist';
const mongoError = 'Mongod Error';
const error = errType => new Error(errType); 

const userModel = mongoose.model('User', UserSchema);
userModel.saveUser = async (User) => {
  let Err = false;
  await userModel.find({ studentNumber: User.studentNumber} , (err, result) => {
    if (err) Err =  error(searchError);
    if (result.length) Err = error(alreadyExist);
  });
  if (Err) return Err;
  const user = new userModel(User);
  await user.save((err) => {
    if (err) Err = error(mongoError);
  });
  if (Err) return Err;
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
managerModel.saveManager = async (Manager) => {
  let Err = false;
  await managerModel.find({ name: Manager.name }, (err, result) => {
    if (err) Err = error(searchError);
    if (result.length) Err = error(alreadyExist);
  });
  if (Err) return Err;
  const manager = new managerModel(Manager);
  await manager.save((err) => {
    if (err) Err = error(mongoError);
  });
  if (Err) return Err;
}


module.exports = (app) => {
  app.alreadyExist = alreadyExist;
  app.userModel = userModel;
  app.managerModel = managerModel;
}