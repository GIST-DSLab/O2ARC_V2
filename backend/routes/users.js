var express = require('express');
var router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/O2ARC.db');
const userhelper = require('../helpers/users');

/* 유저가 푼 미니 아크와 아크 문항을 가져오는 API입니다. */
router.get('/:id/miniarcs', async function(req, res, next) {
  const userName = req.params.id
  //console.log(userName)
  let result = await userhelper.getARCList(userName,mini=true);
  
  if (result === null){
    return res.send('Error retrieving data');
  }
  return res.send(result);
})

/* GET users listing. */
router.get('/:id/arcs', async function(req, res, next) {
  const userName = req.params.id
  //console.log(userName)
  console.log(result)
  let result = await userhelper.getARCList(userName,mini=false);
  if (result === null){
    return res.send('Error retrieving data');
  }
  return res.send(result);
})

router.get('/fetch-all-data', async (req, res, next) => {
  // fetching all data from db 
  let result = await userhelper.fetchAllData()
  if (result === null){
    return res.send('Error retrieving data');
  }
  return res.send(result);



})

module.exports = router;
