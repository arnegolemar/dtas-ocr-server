const express    = require('express');
const fileUpload = require('express-fileupload');
const mongoose   = require('mongoose');
// const mongoose2  = require('mongoose');
const bodyParser = require('body-parser');
const path       = require('path');
const socket     = require('socket.io');

//=================~import route~=================
const log  = require('./routes/api/log');
const user = require('./routes/api/user');
const role = require('./routes/api/role');
const position = require('./routes/api/position');
const office = require('./routes/api/office');
const userComment = require('./routes/api/userComment');
const datetime = require('./routes/api/datetime');
const appModule = require('./routes/api/appModule');

const document = require('./routes/api/document');
const student = require('./routes/api/student');


// "dev": "concurrently \"npm run server\" \"npm run client\""

const app = express();


// Bodyparser Middleware
app.use(bodyParser.json());
app.use(fileUpload());

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");


  next();
});



// DB Config
const db = require('./config/keys').mongoURI;

// Connect to Mongo
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log(`MongoDB Connected...${db}`))
  .catch(err => console.log(err));

  require('./models/Role');
  // Connect to Mongo
  //
  // const db2 = require('./config/keys').mongoURI2;
  // mongoose2
  //   .connect(db2, { useNewUrlParser: true })
  //   .then(() => console.log(`MongoDB Connected...${db2}`))
  //   .catch(err => console.log(err));

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const port = process.env.PORT || 5002;

var server = app.listen(port, () => console.log(`Server started on port ${port}`));

var io = socket(server, { pingInterval: 5000 });


io.of('admin').on('connection', function (socket) {
  console.log('admin connected');
});

// app.use(express.bodyParser({limit: '50mb'}));

app.use(function (req, res, next) {
  req.io = io;

  next();
})

app.use('/images/users',express.static(__dirname + '/client/public/images/users'));
app.use('/images/students',express.static(__dirname + '/client/public/images/students'));
app.use('/docs/students',express.static(__dirname + '/client/public/images/student-files'));

//=================~use route~=================
app.use('/api/log', log);
app.use('/api/user', user);
app.use('/api/role', role);
app.use('/api/position', position);
app.use('/api/office', office);
app.use('/api/userComment',userComment);
app.use('/api/admin/appModule', appModule);
app.use('/api/dt', datetime);
app.use('/api/document', document);

app.use('/api/student', student);


// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));
 
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}
