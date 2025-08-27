const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})

// In-memory storage
const users = []
const exercises = []

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 10)

// POST /api/users - create new user
app.post('/api/users', (req, res) => {
  const username = req.body.username
  if (!username) return res.status(400).json({ error: 'Username required' })
  const user = { username, _id: generateId() }
  users.push(user)
  res.json(user)
})

// GET /api/users - get all users
app.get('/api/users', (req, res) => {
  res.json(users)
})

// POST /api/users/:_id/exercises - add exercise
app.post('/api/users/:_id/exercises', (req, res) => {
  const user = users.find(u => u._id === req.params._id)
  if (!user) return res.status(400).json({ error: 'User not found' })

  let { description, duration, date } = req.body
  if (!description || !duration) return res.status(400).json({ error: 'Description and duration required' })
  duration = Number(duration)
  date = date ? new Date(date) : new Date()
  if (date.toString() === 'Invalid Date') date = new Date()

  const exercise = {
    userId: user._id,
    description,
    duration,
    date
  }
  exercises.push(exercise)

  res.json({
    _id: user._id,
    username: user.username,
    date: exercise.date.toDateString(),
    duration: exercise.duration,
    description: exercise.description
  })
})

// GET /api/users/:_id/logs - get exercise log
app.get('/api/users/:_id/logs', (req, res) => {
  const user = users.find(u => u._id === req.params._id)
  if (!user) return res.status(400).json({ error: 'User not found' })

  let { from, to, limit } = req.query
  let log = exercises.filter(e => e.userId === user._id)

  if (from) log = log.filter(e => e.date >= new Date(from))
  if (to) log = log.filter(e => e.date <= new Date(to))
  if (limit) log = log.slice(0, Number(limit))

  res.json({
    _id: user._id,
    username: user.username,
    count: log.length,
    log: log.map(e => ({
      description: e.description,
      duration: e.duration,
      date: e.date.toDateString()
    }))
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})