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

const userSchema = new mongoose.Schema({
  username: { type: String, required: true }
})
const USER_MODEL = mongoose.model('USER_MODEL', userSchema);

const userExerciseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'USER_MODEL'
  }
})
const USER_EXERCISE_MODEL = mongoose.model('USER_EXERCISE_MODEL', userExerciseSchema);

const userLOGSchema = new mongoose.Schema({
  count: {
    type: Number,
    default: 0
  },
  log: [
    {
      description: String,
      duration: Number,
      date: Date
    }
  ],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'USER_MODEL'
  }
})
const USER_LOG_MODEL = mongoose.model('USER_LOG_MODEL', userLOGSchema);

const usersGETHandler = async (req, res) => {
  try {
    const allUsers = await USER_MODEL.find({})
    res.json(allUsers)
  } catch (error) {
    console.log('\n usersGETHandler error is: ', error)
  }
}

const usersPOSTHandler = async (req, res) => {
  try {
    const newUser = new USER_MODEL({
      username: req.body.username
    })
    const savedUser = await newUser.save()

    const newLog = new USER_LOG_MODEL({
      userId: savedUser._id,
      count: 0,
      log: []
    });
    await newLog.save();

    res.json({
      _id: newUser._id,
      username: newUser.username
    })
  } catch (error) {
    console.log('\n usersPOSTHandler error is: ', error)
  }
}

const usersExercisePOSTHandler = async (req, res) => {
  const userId = req.params._id
  const { description, duration, date } = req.body
  try {
    const user = await USER_MODEL.findById(userId);
    const exerciseDate = date ? new Date(date) : new Date();
    const newExercise = new USER_EXERCISE_MODEL({
      userId: userId,
      description,
      duration: duration,
      date: exerciseDate
    })
    const savedExercise = await newExercise.save();
    const userLog = await USER_LOG_MODEL.findOne({ userId: userId })
    userLog.log.push({
      description: savedExercise.description,
      duration: savedExercise.duration,
      date: savedExercise.date
    })
    userLog.count = userLog.log.length
    await userLog.save()

    res.json({
      _id: user._id,
      username: user.username,
      date: savedExercise.date,
      duration: savedExercise.duration,
      description: savedExercise.description
    })

  } catch (error) {
    console.log('\n usersExercisePOSTHandler error is: ', error)
  }
}

const usersGETLogsHandler = async (req, res) => {
  const userId = req.params._id
  const { from, to, limit } = req.query
  try {
    const user = await USER_MODEL.findById(userId)
    const userLog = await USER_LOG_MODEL.findOne({ userId: userId })
    let filteredLog = userLog.log
    if (from || to) {
      const fromDate = from ? new Date(from) : new Date(0)
      const toDate = to ? new Date(to) : newDate()
      filteredLog = filteredLog.filter((exerciseDetail) => {
        const exerciseDate = new Date(exerciseDetail.date)
        return !isNaN(exerciseDate.getTime()) && exerciseDate >= fromDate && exerciseDate <= toDate
      })
    }
    if (limit) {
      filteredLog = filteredLog.slice(0, parseInt(limit))
    }

    res.json({
      _id: user._id,
      username: user.username,
      count: filteredLog.length,
      log: filteredLog.map((exercise) => {
        return {
          description: exercise.description,
          duration: exercise.duration,
          date: new Date(exercise.date).toDateString()
        }
      })
    })

  } catch (error) {
    console.log('\n usersGETLogsHandler error is: ', error)
  }
}

app.post('/api/users', usersPOSTHandler)
app.get('/api/users/', usersGETHandler)
app.post('/api/users/:_id/exercises', usersExercisePOSTHandler)
app.get('/api/users/:_id/logs', usersGETLogsHandler)

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
