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

var canvas = createCanvas(750, 750);
var ctx = canvas.getContext("2d");

io.on('connection', (socket)=>{
    console.log('a user connected');

    socket.on("canvas-data", ()=>{
        var base64ImageData = canvas?.toDataURL("image/png");
        socket.emit("canvas-data", base64ImageData );
    })

    socket.on("pen-action", (line_details) => {
        console.log("pen-action")

        //draw to canvas
        ctx.lineWidth = draw_options.lineWidth;
        ctx.lineJoin = draw_options.lineJoin;
        ctx.lineCap = draw_options.lineCap;
        ctx.strokeStyle = draw_options.strokeStyle;
        ctx.beginPath();
        ctx.moveTo(line_details.startX, line_details.startY);
        ctx.lineTo(line_details.currX, line_details.currY);
        ctx.closePath();
        ctx.stroke();

        //notify views
        var base64ImageData = canvas?.toDataURL("image/png");
        io.emit("canvas-data", base64ImageData );
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
