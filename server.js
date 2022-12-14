const express = require('express')
const app = express()
// const cors = require('cors')
// app.use(cors())
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer');
const mongoose=require('mongoose');
const Video=require('./models/video');
const peerServer = ExpressPeerServer(server, {
  debug: true
});
const { v4: uuidV4 } = require('uuid')

app.use('/peerjs', peerServer);

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.query.room,patientId:req.query.patientId,docId:req.query.docId,name:req.query.name });
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId,patientId,docId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId);
     //get all old messages
     Video.find({patientId:patientId,docId:docId})
     .then(video =>{
       console.log(video);
       socket.emit('output',video);
     })
     .catch(err => console.log(err));
     
    // messages
    socket.on('message', (message,patientId,docId,name) => {
      //save msg
      const video= new Video({
        patientId:patientId,
        docId:docId,
        name:name,
        msg:message
      });
      video.save();
      //send message to the same room
      io.to(roomId).emit('createMessage', message,name)
  }); 

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})
mongoose.connect(`mongodb+srv://admin:lRbedv2BquWiNYif@cluster0.hnbr0.mongodb.net/video?retryWrites=true&w=majority`)
.then(result =>{
  console.log('Connected');
  server.listen(process.env.PORT||3030);

})
.catch(err =>console.log(err));

