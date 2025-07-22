const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const urlSchema = new mongoose.Schema({
  username: String
})
const USER_MODEL = mongoose.model('USER_MODEL', urlSchema);

const usersGETHandler = async (req, res) => {
  const userId = req.params._id
  if (userId) {

  } else {
    const allUsers = USER_MODEL.find({})
    let allUsersList = []
    for await (const user of allUsers) {
      allUsersList.push(user)
    }
    res.json(allUsersList)
  }
}

const usersPOSTHandler = (req, res) => {
  const newUser = new USER_MODEL({
    username: req.body.username
  })
  newUser.save(function (err, data) {
    if (err) return console.error(err)
    res.json({
      _id: data._id,
      username: data.username
    })
  })
}

app.get('/api/users/:_id?', usersGETHandler)
app.post('/api/users', usersPOSTHandler)


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
