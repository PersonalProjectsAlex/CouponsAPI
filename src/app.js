import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose'

import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';

import morgan from 'morgan';

import routes from './routes';

const app = express()

// *************************************************************
// ******************   Configs    *****************************
// *************************************************************

// Parse body params and attache them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Secure apps by setting various HTTP headers
app.use(helmet());

// Enable CORS - Cross Origin Resource Sharing
app.use(cors())

// *************************************************************
// ******************   Logs    ********************************
// *************************************************************

// Console logger
app.use(morgan('dev'));


// *************************************************************
// ******************   Server    ******************************
// *************************************************************

// Opening port
app.listen(process.env.PORT, ()=> {
  console.log("Server started on port", process.env.PORT + "!")
});

// Emulate the body of the methods POST and PUT, when it's a GET or delete
app.use( (req, res, next) => {
  // Allow Access control for other origins
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Authorization, Accept");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
  if('OPTIONS' == req.method) res.send(200);
  else{
    if('GET' == req.method || "DELETE" == req.method) req.body = req.query;
    next();
  }
})

// Using routes from index.
app.use('/', routes);

// Error handle middleware
app.use((err, req, res, next) => {

  let msg;
  let status;
  let errorName;

  if(err.name == "CastError" && err.path.includes("id")){
    msg = "Invalid cast for ObjectId";
    status = 400;
    errorName = "CastError";
  }
  else if(err.name == "ValidationError"){
    msg = err.message;
    status = 400;
    errorName = "ValidationError";
  }
  else{
    msg = err.message || err;
    status = err.status || 500;
    errorName = err.name || "Error";
  }

  if(typeof msg == "Object") msg = JSON.stringify(msg);

  // HTTP Response
  res.status(status).json({'msg': msg, errorType: errorName })
});


// *************************************************************
// ******************   Mongo    *******************************
// *************************************************************
//mongoose.connect(process.env.db, { keepAlive: true }, (err) => {
//  if(err) console.error(`Unable to connect to database ${process.env.db}`);
//  else console.log(`Database connected successfully!: ${process.env.db}`);
//});

export default app
