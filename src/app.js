require('dotenv').config();
require('express-async-errors');
const express = require('express');
const morgan = require('morgan');
const errorHandlingMiddleware = require('./middleware/error-handler');
const notFoundMiddleware = require('./middleware/not-found');
const connectDB = require('./db/connect');
const authRouter = require('./routes/auth-routes');

const app = express();

const port = process.env.PORT || 3000;

// add logging
app.use(morgan('tiny')); // this results in "GET /apples 404 20 - 3.515 ms"
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello there!');
});

app.use('/api/v1/auth', authRouter);

app.use(errorHandlingMiddleware);
app.use(notFoundMiddleware);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => console.log(`Server is running on port ${port}...`));
  } catch (err) {
    console.log(err);
  }
};

start();
