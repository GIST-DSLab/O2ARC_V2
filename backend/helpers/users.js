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