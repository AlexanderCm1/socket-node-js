const express = require('express');
const router = express.Router();
const app = express();
const httpServer = require('http').createServer(app);
const formatMessage = require('./messages');
const { getCurrentUser, userJoin, userLeave, getRoomUsers } = require('./users')

const options = {
    cors : {
        origin : '*'
    }
};
const io = require('socket.io')(httpServer, options);



//midlewares
app.use(express.json());
app.use(router);


const botName = 'Chat bot';

//Connects
io.on('connection', (socket) =>{
    console.log(`User connected : ${socket.id}`);
    

    //aqui recibimos la data socket.on(nombre del socket, una funcion para recibir la data y que haremos con ella)
    socket.on('join_room', (data) =>{ 
        const user = userJoin(socket.id,data.username,data.room);

        //creando un room con esa data
        console.log(user);

        socket.join(user.room);

        console.log(`User Joined Room :${user.room}`);


        socket.emit('message',formatMessage(botName, `${user.username} Bienvendo al chat`));


        socket.broadcast.to(user.room).emit("message", formatMessage(botName,`${user.username} se ha unido`));


        io.to(user.room).emit('room_users',{
            room : user.room,
            users : getRoomUsers(user.room)
        } )
        
    });

    socket.on('send_message', (data) =>{
        console.log(formatMessage(data.content.author,data.content.message));
        //vamos a enviar data el room que recibmos y le enviamos la data
        io.to(data.room).emit('receive_message', formatMessage(data.content.author,data.content.message));
        // io.emit('time',formatMessage(data.content.author,data.content.message));


    });


    socket.on('disconnect', () =>{
        const user  = userLeave(socket.id);
        if(user){
            console.log(user);
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} se desconecto del chat`));


            io.to(user.room).emit('room_users',{
                room : user.room,
                users : getRoomUsers(user.room)
            });
        }
        console.log("User disconnected");
    });
})







const PORT = 3001 || process.env.PORT;

httpServer.listen(PORT, () =>{
    console.log(`Server running on port ${PORT}`);
});

