var express = require('express');
const { deepStrictEqual } = require('assert');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
fs = require('fs');
app.use(express.static(__dirname+'/public'));

var userIds = [];
var cards = [],fullcards=[];
var users = 0;
var cardSelected=0;
var gameStart=false;
var win="";
app.get('/', (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

fs.writeFile("data.txt","",(err)=>{
  if(err) console.log(err);
})


function emitReset()
{
  io.emit("reset");
}

io.on('connection',(socket) =>{
    console.log("a user connected : " + socket.id);
    users++;
    if(users==1)
    {
      console.log("Waiting for users");
      userIds.push(socket.id);
      io.emit("waiting");
    }
    else if(users==2)
    {
      console.log("Game begins");      
      userIds.push(socket.id);
      io.emit("begin");
    }


    socket.on("cardSelect",(card)=> {
      console.log(card);
      cards.push(card[0]);
      fullcards.push(card);
      cardSelected++;
      
      if(cardSelected==2)
      {
          if(cards[0]==cards[1])
          {
            if(cards[0]=="K")
            {
              io.emit("red",cards[0],cards[1]);  
              win = "r"; 

            }     
            else
            {
              io.emit("black",cards[0],cards[1]);
              win="b";
            }
               
          }
          else
          {
            if(cards[0]=="K" || cards[1]=="K")
            {
              io.emit("black",cards[0],cards[1]);
              win="b";
            }
            else
            {
              io.emit("red",cards[0],cards[1]);
              win="r";
            }
          }
          var data = fullcards[0] + "," + fullcards[1] + "," + win + "\n";
          fs.appendFile("data.txt",data,(err)=>{
            if(err) console.log(err);
          });
          cardSelected=0;
          cards=[]; 
          fullcards=[];        
        
      }
    });
    console.log(users);
    socket.on('disconnect', () => {
    console.log('user disconnected');
    cardSelected=0;
    cards=[];
    users--;
    if(users==1)
      io.emit("user_left");
    console.log(users);});
});


http.listen(3000,'0.0.0.0',() => {
  console.log('listening on *:3000');
});