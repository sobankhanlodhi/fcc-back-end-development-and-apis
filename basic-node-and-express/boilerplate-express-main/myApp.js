let express = require('express');
let app = express();
console.log("Hello World")

app.use('/public', express.static(__dirname + '/public'));
const htmlFilePath = __dirname + '/views/index.html';
app.get('/', (req, res) => {
    res.sendFile(htmlFilePath);
})

app.get('/json', (req, res) => {
    res.json({
        "message": "Hello json"
    })
})


































 module.exports = app;
