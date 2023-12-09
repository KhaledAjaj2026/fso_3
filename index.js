const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

// Custom Morgan Token
morgan.token('data-log', (req, res) => {
	return JSON.stringify(req.body);
});

app.use(
	morgan(
		':method :data-log :url :status :res[content-length] - :response-time ms'
	)
);

let persons = [
	{
		id: 1,
		name: 'Arto Hellas',
		number: '040-123456',
	},
	{
		id: 2,
		name: 'Ada Lovelace',
		number: '39-44-5323523',
	},
	{
		id: 3,
		name: 'Dan Abramov',
		number: '12-43-234345',
	},
	{
		id: 4,
		name: 'Mary Poppendieck',
		number: '39-23-6423122',
	},
];

const markup = `
    <p>Phonebook has information for ${persons.length} people</p>
    <p>${Date()}</p>
`;

// Main Page
app.get('/', (req, res) => {
	res.send('<h1>Hello World</h1>');
});

// Info Page
app.get('/info', (req, res) => {
	res.send(markup);
});

// Phonebook - All persons
app.get('/api/persons', (req, res) => {
	res.json(persons);
});

// Phonebook - Single person
app.get('/api/persons/:id', (req, res) => {
	const id = Number(req.params.id);
	const person = persons.find((person) => person.id === id);
	if (person) {
		res.json(person);
	} else {
		res.status(404).send(`404 - User with ID (${id}) not found`);
	}
});

// Add Person
app.post('/api/persons', (req, res) => {
	const person = req.body;
	if (!person.name || !person.number) {
		res.status(406).json({ error: 'Name or number missing from entry' });
	} else if (person.name) {
		const nameToFind = person.name;
		const existingPerson = persons.find(({ name }) => name === nameToFind);
		if (existingPerson) {
			res.status(409).json({ error: 'Name must be unique' });
		} else {
			person.id = Math.floor(Math.random() * 100 + 1);
			res.json(person);
		}
	}
});

// Delete person
app.delete('/api/persons/:id', (req, res) => {
	const id = Number(req.params.id);
	persons = persons.filter((person) => person.id === id);

	res.sendStatus(204);
});

// 404 - Not Found
app.get('/*', (req, res) => {
	res.sendStatus(404);
});

app.listen(process.env.PORT || 3001);
