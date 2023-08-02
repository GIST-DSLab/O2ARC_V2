const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/O2ARC.db');
  
module.exports.getARCList = async function (userName, mini = false){
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

module.exports.getARCList_test = async function (userName, mini = false){
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

module.exports.fetchAllData = async function (){
  const query = 'SELECT * FROM submission'
  return new Promise((resolve, reject) => {
    db.all(query, (err, rows) => {
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


// 특정 유저의 submission 중에서 success인 모든 문제의 task_id와 task_name을 return하는 API
module.exports.fetchSuccessProblem = async function (userName){
  const query = 'SELECT task_id, task_name, action_sequence FROM submission WHERE user_name = ?';
  const params = []
  params.push(userName)


    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) {
              reject(err);
              //db.close()
            } else {
              var result = []
              for(i = 0; i < rows.length; i++){
                console.log(rows[i])
                if(rows[i].action_sequence.success){
                  result.push(rows[i])
                }
              }
              // console.log(result)
              resolve(result);
              //db.close()
            }
          });
    })
}