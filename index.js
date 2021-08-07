const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


const app = express();
const movieRoute = require('./routes/home');
const usersRoutes = require('./routes/userRoutes');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');

  next();
});
app.use('/main', movieRoute);
app.use('/', usersRoutes);

app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  console.log(error.message, "fcb")
  res.json({ message: error.message || 'An unknown error occurred!' });
});

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true)
  .connect(
    'mongodb+srv://bhavesh:3IgQHLD9UsLgNakg@cluster0.evarr.mongodb.net/apex-movies?retryWrites=true&w=majority'
  )
  .then(() => {
    app.listen(5000);
  })
  .catch(err => {
    console.log(err);
  });
