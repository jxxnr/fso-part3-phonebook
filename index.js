require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()
app.use(cors())
app.use(express.static('build'))
app.use(express.json())

app.use(morgan(function (tokens, req, res) {
  let reqBody = ''
  if (tokens.method(req, res) === 'POST') {
    reqBody = JSON.stringify(req.body)
  }
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    reqBody
  ].join(' ')
}))


app.get('/api/persons', (request, response) => {
  Person.find({}).then(people => {
    response.json(people)
  })
})

app.get('/info', (request, response, next) => {
  Person.find({})
    .then(people => {
      const peopleCount = people.length
      const currentDate = new Date()

      response.send(`<p>Phonebook has info for ${peopleCount} people</p><p>${currentDate}</p>`)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error =>  next(error))
})

// const generateId = () => {
//   let id = null;
//   do {
//     // Generate an id from 0 to 9999
//     id = Math.floor(Math.random() * 10000);
//     // If id is already used by another person, generate a new id
//   } while (persons.find(person => person.id === id))
//   return id;
// }

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number is missing'
    })
  }

  // if (persons.find(person => person.name.toLocaleLowerCase() === body.name.toLocaleLowerCase())) {
  //   return response.status(400).json({
  //     error: 'name must be unique'
  //   });
  // }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
    .catch(error => next(error))

})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))

})

app.put('/api/persons/:id', (request, response, next) => {
  console.log('inside put')

  const body = request.body
  console.log(body)

  const person = {
    name: body.name,
    number: body.number
  }

  console.log(person)

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformed id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  } else if (error.name === 'MongoError') {
    return response.status(400).send({ error: error.message })
  }
  else {
    response.status(500).end()
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
