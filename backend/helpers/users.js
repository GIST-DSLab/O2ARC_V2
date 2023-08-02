const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/O2ARC.db');
  
var getARCList = async function (userName, mini = false){
    const query = 'SELECT id, task_name FROM tasklist WHERE type = ?';
    const params = [];
    if(mini){
      params.push('MiniARC');
    } else params.push('ARC');
  
    
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) {
              reject(err);
              //db.close()
            } else {
      
              resolve(rows);
              //db.close()
            }
          });
    })
  }

var getARCList_test = async function (userName, mini = false){
  const query = 'SELECT id, task_name FROM HappyARC WHERE type = ?';
  const params = [];
  if(mini){
    params.push('MiniARC');
  } else params.push('ARC');

  
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
          if (err) {
            reject(err);
            //db.close()
          } else {
    
            resolve(rows);
            //db.close()
          }
        });
  })
}

var getSuccessList = async function(userName){
  const query = 'SELECT task_id, count(*), max(subtask_count) FROM submission WHERE user_name = ? AND success = 1 GROUP BY task_id';
  return new Promise((resolve, reject) => {
    db.all(query, [userName], (err, rows) => {
          if (err) {
            reject(err);
            //db.close()
          } else {
    
            resolve(rows);
            //db.close()
          }
        });
  })
}

module.exports = {
  getARCList,
  getARCList_test,
  getSuccessList
}