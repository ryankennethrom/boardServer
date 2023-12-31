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


io.on('connection', async(socket)=>{
        console.log('a user connected');
        socket.on("canvas-data", ()=>{
            CanvasImage.find({_id:"frequentSave"}).then((docs)=>{
                var base64ImageData = docs[0].image;
                socket.emit("canvas-data", base64ImageData );
                console.log("canvas-data-emitted");
            })
        })

        socket.on("pen-action", (line_details_array) => {
            console.log("pen-action")
            CanvasImage.find({_id:"frequentSave"}).then((docs)=>{
                var base64ImageData = docs[0].image;
                var canvas = createCanvas(750, 750);
                var ctx = canvas.getContext("2d");

                loadImage(base64ImageData).then((image)=>{
                    ctx?.drawImage(image, 0, 0)
                    for (let i = 0; i < line_details_array.length; i++) {
                    var line_details = line_details_array[i];
                    ctx.lineWidth = line_details.lineWidth;
                    ctx.lineJoin = line_details.lineJoin;
                    ctx.lineCap = line_details.lineCap;
                    ctx.strokeStyle = line_details.strokeStyle;
                    ctx.beginPath();
                    ctx.moveTo(line_details.startX, line_details.startY);
                    ctx.lineTo(line_details.currX, line_details.currY);
                    ctx.closePath();
                    ctx.stroke();
                    }
                    console.log("drawn to canvas")
                    base64ImageData = canvas?.toDataURL("image/png");

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

start()
