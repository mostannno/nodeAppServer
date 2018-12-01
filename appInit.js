const mongoose = require('mongoose');
const UserSchema = require('./schema/user');
const ManagerSchema = require('./schema/manager');

const alreadyExist = 'User Already Exsit'
const searchError = 'Search Failed';
const unExist = 'User not exist';
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
  return Err;
};

userModel.deleteUser = async (studentNumber) => {
  let Err = false;
  await userModel.find({ studentNumber }, (err, result) => {
    if (err) Err = error(searchError);
    if (!result.length) Err = error(unExist);
  });
  if (Err) return Err;
  await userModel.deleteOne({ studentNumber }, (err) => {
    if (err) Err = error(mongoError);
  });
  return Err;
}

userModel.updateUser = async (studentNumber, data) => {
  let Err = false;
  await userModel.find({ studentNumber }, (err, result) => {
    if (err) Err = error(searchError);
    if (!result.length) Err = error(unExist);
  });
  if (Err) return Err;
  console.log(studentNumber, data);
  await userModel.updateOne({ studentNumber }, data, (err) => {
    if (err) Err = err;
  });
  return Err;
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
  return Err;
}

module.exports = (app) => {
  app.alreadyExist = alreadyExist;
  app.unExist = unExist;
  app.userModel = userModel;
  app.managerModel = managerModel;
}