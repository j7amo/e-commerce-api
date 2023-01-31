require('dotenv').config();
require('express-async-errors');
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');
const errorHandlingMiddleware = require('./middleware/error-handler');
const notFoundMiddleware = require('./middleware/not-found');
const connectDB = require('./db/connect');
const authRouter = require('./routes/auth-routes');
const usersRouter = require('./routes/user-routes');
const productsRouter = require('./routes/product-routes');
const reviewsRouter = require('./routes/review-routes');
const ordersRouter = require('./routes/order-routes');

const app = express();

const port = process.env.PORT || 3000;

// security
app.set('trust proxy', 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
  }),
);
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(mongoSanitize());

// add logging
app.use(morgan('tiny')); // this results in "GET /apples 404 20 - 3.515 ms"
// in order to sign cookies when must pass the secret
app.use(cookieParser(process.env.JWT_SECRET));
// in order to enable image uploading and access to uploaded image we:
// 1) serve "/public" folder
app.use(express.static(path.resolve(__dirname, '../public')));
// 2) use "express-fileupload" middleware that attaches files to "req.files"
app.use(fileUpload());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello there!');
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/reviews', reviewsRouter);
app.use('/api/v1/orders', ordersRouter);

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
