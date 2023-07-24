
var newID = function () {
    return Math.random().toString(36).substr(2, 16);
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomId() {
    const timestamp = Date.now().toString();
    const randomNumber = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    const randomId = timestamp + randomNumber;
    return randomId;
  }
  

module.exports = {
    newID,
    getRandomInt,
    generateRandomId
}