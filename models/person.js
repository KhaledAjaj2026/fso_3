const mongoose = require('mongoose');

const url = process.env.MONGODB_URI;
console.log('connecting to MongoDB...');

mongoose.set('strictQuery', false);
mongoose
	.connect(url)
	.then(() => {
		console.log('connected to MongoDB!');
	})
	.catch((err) => {
		console.log('error connecting to MongoDB: ', err.message);
	});

const personSchema = new mongoose.Schema({
	name: {
		type: String,
		minLength: 3,
		required: true,
	},
	number: {
		type: String,
		minLength: 8,
		validate: {
			validator: (v) => {
				return /^\d{2}-\d+$|^\d{3}-\d+$/.test(v);
			},
			message: 'Number must match correct format',
		},
		required: true,
	},
});

personSchema.set('toJSON', {
	transform: (document, returnedObj) => {
		returnedObj.id = returnedObj._id.toString();
		delete returnedObj._id;
		delete returnedObj.__v;
	},
});

module.exports = mongoose.model('Person', personSchema);
