// const { response } = require('express');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

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

let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

app.get('/api/persons', (request, response) => {
  return response.json(persons);
});

app.get('/info', (request, response) => {
  const contactsCount = persons.length;
  const currentDate = new Date();
  response.send(`<p>Phonebook has info for ${contactsCount} people</p><p>${currentDate}</p>`);
});

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find(person => person.id === id);

  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

const generateId = () => {
  let id = null;
  do {
    // Generate an id from 0 to 9999
    id = Math.floor(Math.random() * 10000);
    // If id is already used by anotherr person, generate a new id
  } while (persons.find(person => person.id === id))
  return id;
}

app.post('/api/persons', (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number is missing'
    });
  } 

  if (persons.find(person => person.name.toLocaleLowerCase() === body.name.toLocaleLowerCase())) {
    return response.status(400).json({
      error: 'name must be unique'
    });
  } 

  const id = generateId();
  const person = {
    id: id,
    name: body.name,
    number: body.number
  }
  persons = persons.concat(person);
  response.json(person);
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter(person => person.id !== id);

  response.status(204).end();
  
});




const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});