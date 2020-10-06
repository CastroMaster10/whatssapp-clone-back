const express = require('express');
const app = new express();
const config = require('./config')
const mongoose = require('mongoose')
const Messages = require('./models/dbMessages')  //we import a collection from the db
const Pusher =require('pusher')
const cors = require('cors')

//app middlewares
app.use(express.json()) ; //SUPER IMPORTANT in order to get the JSON requests
app.use(cors());


const connection_url = 'mongodb+srv://admin:mZuIfI4Ij9KcV6sg@cluster0.tynid.mongodb.net/whatssapp_cloneDB?retryWrites=true&w=majority'

const pusher = new Pusher({
    appId: '1085511',
    key: '3231f22f93d191ffa0ed',
    secret: 'e2b62ea1618b8ff2b0f2',
    cluster: 'us2',
    encrypted: true
});

//DB config

mongoose.connect(connection_url, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
})


  mongoose.connect(connection_url, {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
//real-time

mongoose.connection.once('open', () => {
    console.log('DB is connected')
    const MessageContent  = mongoose.connection.collection('messages');  //collection
    const ChangeStream = MessageContent.watch();
    ChangeStream.on('change', (change) => {
        console.log(change)         
        if(change.operationType === "insert") {        //we connect to pusher
            const messageDetails = change.fullDocument;
            pusher.trigger('newMessages', "inserted", {  // channel and event
                name: messageDetails.name,
                message: messageDetails.message,
                timeStamp:messageDetails.timeStamp,
                recieved: messageDetails.recieved
            }) 
        } else {
            console.log('Error triggering pusher')
        }
    })
})  


//routes
app.get('/', (req,res) => {
    res.status(200).send({
        hellow: 'Hey world🙂'
    })
})

app.post('/messages/new', (req,res) => {
    const dbMessages = req.body;  // we are gonna get the new mesage through the request
    Messages.create(dbMessages, (err, data) => {  //the error goes as first argument and the data as second
        if(err) {
            res.status(500).send('There was an error in the db')
        } else {
            res.status(201).send(data)
        }
    })   


})

app.get('/messages/sync', (req,res) => {
    Messages.find(req.body, (err, data) => {   //the find method helps us to get request the whole data of the db
        if(data) {
            res.status(200).send(data)
        } else {
            res.status(500).send(err)
        }
    })     
})


//middlewares

//listening
app.listen(config.port, (req,res) => {
    console.log('App listening on port:', config.port)
})
