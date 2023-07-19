var express = require('express');
var router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/O2ARC.db');
const testing_function = require('../public/javascripts/testing_interface.js')

/* GET home page */ 
router.get('/', function(req, res, next) {
  res.render('mario_test');
});

/* GET problem page */
router.get('/:id/:problem', function(req, res, next) {
  const userName = req.params.id
  const problem = req.params.problem

  console.log(userName, problem)
  const query = 'SELECT content FROM tasklist WHERE id = ?';
  const params = problem;

  db.get(query, [params], (err, row) => {
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
        //console.log(traingrid[0][0])
        //console.log(testgrid[0])
        h = traingrid[0][0].height
        w = traingrid[0][0].width
        //console.log(h, w)

        resettedgrid = testing_function.resetOutputGrid(outputgrid)

        cellsize = 200/Math.max(h,w)
        // console.log(cellsize)
        // console.log(h)

        // console.log(traingrid)
        return res.render('problem_solve_mario', {
          userName: userName,
          train: trainData,
          grid : traingrid,
          Testgrid: testgrid,
          Outputgrid: outputgrid,
          p:cellsize,
          reset: resettedgrid
      })
      } else {
        return res.status(404).send('Content not found');
      }
    });
});

module.exports = router;
