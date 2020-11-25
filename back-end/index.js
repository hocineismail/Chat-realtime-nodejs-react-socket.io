const app = require('express')();
const server = require('http').createServer(app);
const port = process.env.PORT || 3001
require('dotenv').config()

const io = require('socket.io')(server, { origins: [process.env.HOST]});


io.on('connection', (socket) => { 
 
      socket.on('new message', data => {
        //Sending to all clients including sender
        io.sockets.emit('receive message', {message: data})
      });


      socket.on('remove message', data => {
        //Sending to all clients including sender
        io.sockets.emit('remove message', data)
      });

      socket.on('typing',  data => {
        //Sending to all clients except sender
        socket.broadcast.emit('typing', {value: data.value});
      });


    socket.on('disconnect', function(){
        console.log('disconnect client server ')
    });

 });


server.listen(port);