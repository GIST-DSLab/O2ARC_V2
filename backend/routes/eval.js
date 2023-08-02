var express = require("express");
var router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./db/O2ARC.db");
const testing_function = require("../public/javascripts/testing_interface.js");

/* GET home page */
router.get("/", function (req, res, next) {
	return res.render("eval", {});
});

module.exports = router;
