var express = require('express');
var router = express.Router();
const axios = require('axios')
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/O2ARC.db');
const logic_function = require('../public/javascripts/logic_function.js')
const userhelper = require('../helpers/users');
const testing_function = require('../public/javascripts/testing_interface.js')

/* GET users listing. */
router.get('/:id', async function(req, res, next) {

    const userName = req.params.id
    var data
    var data2
    // var minirand = logic_function.getRandomInt(5948,6096)

    console.log(userName)

    try{
        // data = await userhelper.getARCList(userName,mini=true);
        // data2 = await userhelper.getARCList(userName);
        data = await userhelper.getARCList_test(userName,mini=true);
        data2 = await userhelper.getARCList_test(userName);

    } catch (err) {
        console.log(err)
        return res.status(500).send("Internal Server Error")
    }
    
    res.render('problem_set', {
        userName: userName,
        miniARC_idlist: data,
        ARC_idlist: data2,
    })


});

router.get('/:id/:problem', async function(req, res, next) {
    const userName = req.params.id
    const problem = req.params.problem
    
    console.log(userName, problem)
    const params = problem;
    
    // var minirand = logic_function.getRandomInt(5948,6096)
    var minirand = logic_function.getRandomInt(5948,6096)
    const random_stage_mini = [5952,5971,5978,5983,6015,6018,6021,6022,6026,6033,6048,6055]
    if (random_stage_mini.indexOf(minirand)!=-1) {
      minirand+=2
    }
    // var rand = logic_function.getRandomInt(6098,6496)
    var rand = logic_function.getRandomInt(6098,6496)
    const random_stage_arc = [6186, 6227, 6241, 6247, 6268, 6271, 6291, 6299, 6303, 6309, 6410, 6490]
    if (random_stage_arc.indexOf(rand)!=-1) {
      rand+=2
    }
    const qs = req.query.subp
    let subprobidx;
    if(!qs){
      subprobidx = 0;
    } else {
      subprobidx = parseInt(qs)
    }
    db.get("SELECT content FROM HappyARC WHERE id = ?", [params], async (err, row) => {

    // db.get("SELECT content FROM tasklist WHERE id = ?", [params], (err, row) => {
        if (err) {
          console.error(err.message);
          return res.status(500).send('Error executing query');
        }
        
        if (row) {
          const content = JSON.parse(row.content);
          trainData = content.train
          testData = content.test

          //console.log(trainData)

          traingrid = testing_function.loadJSONTask(trainData)
          testgrid = testing_function.loadJSONTask(testData)
          outputgrid = testing_function.loadJSONTask(testData)
          // console.log(traingrid[0][0])
          console.log(testgrid[0][0])
          h = traingrid[0][0].height
          w = traingrid[0][0].width
          //console.log(h, w)

          resettedgrid = testing_function.resetOutputGrid(outputgrid)

          cellsize = 200/Math.max(h,w)
          // console.log(cellsize)
          // console.log(h)

          // console.log(traingrid)
          var data, data2;
          try{
            // data = await userhelper.getARCList(userName,mini=true);
            // data2 = await userhelper.getARCList(userName);
            data = await userhelper.getARCList_test(userName,mini=true);
            data2 = await userhelper.getARCList_test(userName);
            
          } catch (err) {
              console.log(err)
              return res.status(500).send("Internal Server Error")
          }

          return res.render('problem_solve', {
            userName: userName,
            train: trainData,
            grid : traingrid,
            Testgrid: testgrid[subprobidx],
            Outputgrid: outputgrid[subprobidx],
            subprobidx: subprobidx,
            subprobcnt: testgrid.length,
            p:cellsize,
            reset: resettedgrid,
            competition: 0,
            miniARC_idlist: data,
            ARC_idlist: data2,
            ran1: minirand,
            ran2: rand
        })
        } else {
          return res.status(404).send('Content not found');
        }
      });



  // queryDB(query, params, (err, result) => {
  //   if (err) {
  //     return res.status(500).send(err);
  //   } else {
  //     return res.render('problem_solve', result);
  //   }
  // });
});

router.post('/:id/:problem/save-data', (req, res) => {
  // Retrieve the data from the request body
  const numbersArray = req.body.numbersArray;
  // const labelText = req.body.labelText;
  const userName = req.params.id
 
  const problem = req.params.problem
  var ids = []
  var task_name = []

  // console.log(req)
  const sql1 = 'SELECT id, name FROM user WHERE name = ?';
  const sql2 = 'SELECT id, task_name FROM tasklist WHERE id = ?';

  function retrieveIds() {
    return new Promise((resolve, reject) => {
      db.all(sql1, [userName], (err, rows) => {
        if (err) {
          reject(err);
        }
  
        const ids = rows.map(row => row.id);
        resolve(ids);
      });
    });
  }

  function retrieveTaskIds() {
    return new Promise((resolve, reject) => {
      db.all(sql2, [problem], (err, rows) => {
        if (err) {
          reject(err);
        }
  
        const ids = rows.map(row => row.task_name);
        resolve(ids);
      });
    });
  }

  function insertSubmission(subid, userId, userName, taskId, taskName, numbersArray) {
    const timeStamp = new Date().toISOString();
    const actionSequence = JSON.stringify(numbersArray.trace);
    const subtask_id = parseInt(numbersArray.subtask);
    const success = numbersArray.success ? 1 : 0;

    const sql = 'INSERT INTO submission (id, user_id, user_name, task_id, task_name, time_stamp, action_sequence, subtask_id, success) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    
    db.run(sql, [subid, userId, userName, taskId, taskName, timeStamp, actionSequence,subtask_id,success], function(err) {
      if (err) {
        console.error(err);
      } else {
        console.log('Submission inserted successfully.');
      }
    });
  }
  
  // Use async/await to retrieve the ids and perform other functions
  (async () => {
    try {
      ids = await retrieveIds();
      task_name = await retrieveTaskIds();
      //console.log('IDs:', ids);
      const subid = logic_function.generateRandomId();
      insertSubmission(subid, ids[0], userName, problem, task_name[0], numbersArray)
      // console.log(subid, ids[0], userName, problem, task_name[0], numbersArray)
      console.log(numbersArray)
  
      // Other functions that depend on the retrieved ids can be called here
      // ...
    } catch (err) {
      console.error(err);
    }

  })();

  
  // console.log(userName, problem)
  // Save the data to the database (replace this with your database logic)
  // ...

  // Send a response indicating success
  res.status(200).json({ message: 'Data saved successfully.' });
});

module.exports = router;
