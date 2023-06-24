const db = require('./dbconnect');
module.exports = class question {
  constructor(){

  }
  static fetchAll(){
    return db.execute('select * from question');
  }
};