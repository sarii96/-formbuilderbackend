const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require("multer");
const upload = multer({ dest: "pdfs/" });
const {convertImage} = require('./utils/convert');
const { file } = require('pdfkit');
const {createClient} = require('redis');
const { response } = require('express');
const pdfImageService = require('./services/pdfImageService');
const { json } = require('express/lib/response');
const redisClient = createClient({
    socket:{
        port:6379,
        host:"127.0.0.1",
    },
  }
  );

redisClient.connect();

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
async function uploadFiles(req, res) {
    console.log(req.body);
    console.log(req.files);
   const templateName  = req.body.templateName;
   const imgName = req.files[0].filename +'-1.jpg';
   console.log(templateName);
//    await redisClient.hSet('templates', templateName, JSON.stringify({templateName, imgName}));
    res.json({imgName});
    convertImage('./pdfs/' + req.files[0].filename);
}

//data list fiscal, client, and debtor
app.get("/fieldList", async(req, res) => {
const enpointName = req.enpointName;
const  fiscalResponse = await fetch("http://localhost:4561/fiscal/100");
const responseJson =  await fiscalResponse.json();
res.send(responseJson);

// if( fiscalResponse ===   ) {

// }
});

//get new coordinates of the template
app.get("/templates/:userEmail/:templateName", async(req, res)=>{
    const userEmail = req.params.userEmail;
    const templateName = req.params.templateName;
    const templateJson = await redisClient.hGet('templatesByEmailMap', userEmail + '-' + templateName);
    const templateObject = JSON.parse(templateJson);   
    res.status(200);
    res.send(templateObject);
});

//send the saves change of the image 

 app.post("/pdfImageCoordinates/:userEmail",  async (req, res)=>{
const listOfWords =  req.body.listOfWords;
const listOfWordsId = req.body.listOfWordsId;
const templateName = req.body.templateName;
const userEmail = req.params["userEmail"];
console.log(listOfWords);
const templateRecord = req.body;
templateRecord.createdDate = Date.now();
await redisClient.zAdd('templatesByEmail-'+userEmail,[{score: "0",value:templateName}]);
await redisClient.hSet('templatesByEmailMap', userEmail + "-" + templateName, JSON.stringify(templateRecord));
// await redisClient.zAdd("user:0:followers", [{score: "1", value: "John"}, {score: "2", value: "Other John"}]);
console.log(JSON.stringify(listOfWords));
res.status(200);
res.send({result:"Saved"});
});


//get template name and date of templates
app.get("/templates/:userEmail", async(req, res)=>{
const userEmail = req.params["userEmail"];
const templateNames = await  redisClient.zRange('templatesByEmail-'+userEmail, 0, -1);
let templateJson = [];
const templatePromises = [];
templateNames.forEach(templateName => {
    const templatePromise = redisClient.hGet('templatesByEmailMap', userEmail + '-' + templateName);
   templatePromises.push(templatePromise);
   console.log('adding to array');
//    console.log(templateString);
});

//we convert the templetaJson( a string) to an object before send it to the fronted
templateJson = await Promise.all(templatePromises);
let templateObjects = [];
templateJson.forEach((templateString) =>{
const templateObject = JSON.parse(templateString);   
templateObjects.push(templateObject);
});
res.status(200);
console.log('sending response');
res.send(templateObjects);
});

//delete template
app.delete("/templates/:userEmail/:templateName", async(req, res ) =>{
const userEmail = req.params.userEmail;
const templateName = req.params.templateName;
await redisClient.hDel('templatesByEmailMap', userEmail + '-' + templateName);
});
app.listen(3000,()=>{ console.log("Listening...")});