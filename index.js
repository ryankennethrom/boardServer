const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config()
const app = express();
// const path = require('path')
// app.use(express.static(path.join(__dirname + '/.next')))
mongoose.set('strictQuery', false);
const { createCanvas, loadImage } = require('canvas')

const httpServer = require("http").createServer(app);

const io = require("socket.io")(httpServer,{
    cors:{origin:"*"}
});

var canvasImageSchema = new mongoose.Schema({
    _id: String,
    image: String
});

var CanvasImage = mongoose.model('canvasimages', canvasImageSchema);

io.on('connection', (socket)=>{
    console.log('a user connected');

    socket.on("canvas-data", ()=>{
        CanvasImage.find({_id:"frequentSave"}).then((docs)=>{
            console.log("got from database")
            var base64ImageData = docs[0].image;
            socket.emit("canvas-data", base64ImageData );
        })
    })

    socket.on("pen-action", (draw_options_array) => {
        console.log("pen-action")
        CanvasImage.find({_id:"frequentSave"}).then((docs)=>{
            console.log("got from database")
            var base64ImageData = docs[0].image;
            loadImage(base64ImageData).then((image)=>{
                const canvas = createCanvas(750, 750)
                var ctx = canvas.getContext('2d');
                ctx.drawImage(image, 0, 0)
                for(var i = 0;i<draw_options_array.length;i++) {
                    var draw_options = draw_options_array[i];
                    ctx.lineWidth = draw_options.lineWidth;
                    ctx.lineJoin = draw_options.lineJoin;
                    ctx.lineCap = draw_options.lineCap;
                    ctx.strokeStyle = draw_options.strokeStyle;

                    ctx.beginPath();
                    ctx.moveTo(draw_options.startX, draw_options.startY);
                    ctx.lineTo(draw_options.currX, draw_options.currY);
                    ctx.closePath();
                    ctx.stroke();
                }
                var base64ImageData = canvas?.toDataURL("image/png");

                io.emit("canvas-data", base64ImageData );

                var filter = { _id: "frequentSave" };
                var update = { image: base64ImageData };
                CanvasImage.findOneAndUpdate(filter, update).then(()=>{
                    console.log("updated database")
                })
            })
        })
        
    })
})

const start = async() => {
    try {
        await mongoose.connect(process.env.MONGOOSE_URI);

        httpServer.listen(5000, ()=> console.log('started on 5000'))
    }
    catch(e){
        console.log(e.message);
    }
};

start();