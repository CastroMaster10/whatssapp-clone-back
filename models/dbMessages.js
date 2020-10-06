const mongoose = require('mongoose');
const WhatssappSchema = mongoose.Schema({
    message: String,
    name: String,
    timeStamp: String,
    recieved: Boolean,
     
});

//collection
const messages = mongoose.model('messages', WhatssappSchema);

module.exports = messages;  
