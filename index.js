require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Person = require('./models/person');
const app = express();

app.use(cors());
app.use(express.static('dist'));
app.use(express.json());

// Main Page
app.get('/', (req, res) => {
	res.send('<h1>Hello World</h1>');
});

// Info Page
app.get('/info', (req, res) => {
	Person.countDocuments({}).then((result) => {
		res.send(`
			<p>There are ${result} entries in the phonebook.</p>
			<p>${Date()}</p>
		`);
	});
});

// Phonebook - All persons
app.get('/api/persons', (req, res) => {
	Person.find({}).then((people) => {
		res.json(people);
	});
});

// Phonebook - Single person
app.get('/api/persons/:id', (req, res, next) => {
	Person.findById(req.params.id)
		.then((person) => {
			res.json(person);
		})
		.catch((err) => next(err));
});

// Add Person
app.post('/api/persons', (req, res, next) => {
	const newPerson = req.body;

	if (!newPerson) {
		return res.status(400).json({ error: 'name or number missing' });
	} else if (newPerson.name && newPerson.number) {
		const person = new Person({
			name: newPerson.name,
			number: newPerson.number,
		});

		person
			.save()
			.then((newPerson) => {
				res.json(newPerson);
			})
			.catch((err) => next(err));
	}
});

// Update Person
app.put('/api/persons/:id', (req, res, next) => {
	const { name, number } = req.body;

	Person.findByIdAndUpdate(
		req.params.id,
		{ name, number },
		{ new: true, runValidators: true, context: 'query' }
	)
		.then((updatedPerson) => {
			res.json(updatedPerson);
		})
		.catch((err) => next(err));
});

// Delete person
app.delete('/api/persons/:id', (req, res, next) => {
	Person.findByIdAndDelete(req.params.id)
		.then(() => {
			res.sendStatus(204);
		})
		.catch((err) => next(err));
});

// 404 - Not Found
app.get('/*', (req, res) => {
	res.sendStatus(404);
});

// Error Handler
const errorHandler = (err, req, res, next) => {
	if (err.name === 'CastError') {
		return res.status(400).send({ error: 'malformatted id' });
	} else if (err.name === 'ValidationError') {
		return res.status(400).send({ error: err.message });
	} else if (err.name === 'AxiosError') {
		return res.status(400).send({ error: err.message });
	}

	next(err);
};
app.use(errorHandler);

app.listen(process.env.PORT || 3001);
