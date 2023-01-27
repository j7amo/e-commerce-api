require('dotenv').config();
const express = require('express');
const errorHandlingMiddleware = require('./middleware/error-handler');
const notFoundMiddleware = require('./middleware/not-found');
const connectDB = require('./db/connect');

const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello there!');
});

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
