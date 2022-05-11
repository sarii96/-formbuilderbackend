const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require("multer");
const upload = multer({ dest: "pdfs/" });
const {convertImage} = require('./utils/convert');
const { file } = require('pdfkit');





const app = express();
app.use(cors({
    origin: 'http://localhost:5500'
}));


app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));



//Register
app.post('/register', (req, res)=>{
    const registerRequest = req.body;
    const fullName = registerRequest.fullName;
    const userEmail = registerRequest.userEmail;
    const password = registerRequest.password;
    if(fullName=='Sarah Romero' && userEmail=='sara-96325@hotmail.com' && password=='Paramore96'){
        res.status(200);
        res.send("Welcome");
    }else{
        res.status(401);
        res.send("Unauthorized");
    }
});

//login 
app.post('/login', (req, res)=>{
    const loginRequest = req.body;
    const userEmail = loginRequest.userEmail;
    const password = loginRequest.password;

    if(userEmail=="sara-96325@hotmail.com" && password=="Paramore96"){
        res.status(200);
        res.send("Welcome");
    }else{
        res.status(401);
        res.send("Unauthorized");
    }

});

//upload file

app.post("/upload", upload.array('file'), uploadFiles);
function uploadFiles(req, res) {
    console.log(req.body);
    console.log(req.files);

    res.json({ filename:req.files[0].filename +'-1.jpg'});
    convertImage('./pdfs/' + req.files[0].filename);
}



   
app.listen(3000,()=>{ console.log("Listening...")});