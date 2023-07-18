var express = require("express");
var router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./db/O2ARC.db");

/* After deploying , API for traces*/
router.get("/submission", function (req, res, next) {
	const query = "SELECT * FROM submission";
	db.all(query, (err, rows) => {
		if (err) {
			console.error(err.message);
			return res.status(500).send("Error retrieving data");
		} else {
			fs.writeFile(
				"output.json",
				JSON.stringify(rows, null, 2),
				"utf8",
				function (err) {
					if (err) {
						console.error(err.message);
						return res.status(500).send("Error writing file");
					}
					return res.send(rows);
				}
			);
		}
	});
});

module.exports = router;
