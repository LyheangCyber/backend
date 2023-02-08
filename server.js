
require("dotenv").config();
const express = require("express");
const { diskStorage } = require("multer");
const app = express();
const multer = require('multer');
const could = require("./Schema/cloudinary");
const streamifier = require('streamifier');
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require('fs');
const cors = require("cors");
//app.use(require("cors")());
app.use(
    cors({
      origin: "http://localhost:3000",
      methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
      credentials: true,
    })
);
app.use(session({secret : "klskjfij23!!!klksf!ks4",saveUninitialized: false,
resave: false,
cookie: {
  maxAge: (1000 * 60 *20),
  httpOnly: true,
}}));
//To parse URL encoded data
app.use(bodyParser.urlencoded({ extended: false }));
//To parse json data
app.use(bodyParser.json());
const storage=multer.memoryStorage();
const Upload = multer({storage : storage});
const PORT = process.env.PORT || 4000;
const {encrypt,decrypt} = require("./Schema/SensitiveProtecter/InforProcter.js");
const { profile } = require("console");
const a =encrypt("lyheang");
console.log(a);
console.log(encrypt("Philo sophy"));
console.log(decrypt(a))
// encrypt the data 
    // |=================================<< sign up >>============================
    
    app.post("/signUp",function(req,res,next){
        if(req.session.email){
            next();
        }else{
                req.session.email=req.body.email;
                let getProfile = JSON.parse(fs.readFileSync("./userprofile.json",{encoding:"utf-8",flag:"r"}));
                const userProfile = {
                    // dat to send to the userver
                    // this section you have to only concern about three fields : email , password , specialist
                specialist : req.body.specialist || null,
                latlng  : req.body.latlng || null,
                seftDescription: req.body.des || null,
                category : req.body.category || null,
                contact: {
                    "telegram" : req.body.telegram || null,
                    "gmail" : req.body.gmail || null,
                    "line"     : req.body.line || null
                },
                image : [],
                location : req.body.location || null,
                profession: req.body.profession || null,
                phoneContact : req.body.phone|| null,
                background   : req.body.background || null,
                profile      : req.body.profile || null,
                relatedWork : [],   
                password : req.body.password || null,
                service : req.body.service || null,
                company : req.body.company || null,
                email : req.body.email || null
                };
            // insert userProfile to data Storage 
                getProfile.push(userProfile);
                fs.writeFileSync("./userprofile.json",JSON.stringify(getProfile));
                res.send("You are registed.");
                
                }
    },function(req,res){
                // after sign the user already redirect to the user profile 
        res.send("You have already had this account");     
    })
    //| ===================================<< Log in >>===============================
    app.post('/login',(req,res)=>{
            // check to see whether there is a cookie a long with request
            // take the cookie from the broswer and compare it with our session on the server
            if(!req.session.email){
                // take data from user log in form and find that data in our userprofile json
                let getProfile = JSON.parse(fs.readFileSync("./userprofile.json",{encoding:"utf-8",flag:"r"}));
                // find one by one user account profile 
                let findProfile = getProfile.some((profile)=>{
                   return profile.email === req.body.email
                });
                if(findProfile){
                    req.session.email= req.body.email;
                    res.send("you are registerd");             
                }else{
                    res.send("you credential is not match");
                }
               
            }else{
                res.send(" have cookie");
            }
    })
    // | =============================<< get Profile >> =================================================
    app.get('/getProfile',(req,res,next)=>{
        // check the session
        if(!req.session.email){
            next();
        }else{
            // if the request accompanied with the value of the seesion 
            // take the value of the sesssion to retrieve 
            let getProfile = JSON.parse(fs.readFileSync("./userprofile.json",{encoding:"utf-8",flag:"r"}));
            let profileUser = getProfile.find(profile => profile.email === req.session.email);
            res.json({data : profileUser});
        }
    },(req,res)=>{
            res.json({data : []});
    })
    //| ===========================<<< Save edit content of the particular user >> =======================
    // in thise case we assume that thr user' browser is being stored the informationof the cookie in side that 
    app.post("/editPost",Upload.single("profile"),(req,res)=>{
            console.log(req.file);
            // use the session to get the data base from the backend
            let getProfileUserAll = JSON.parse(fs.readFileSync("./userprofile.json",{encoding:"utf-8",flag:"r"}));
            let getProfileUser = getProfileUserAll.find(profile=> profile.email === req.session.email);
            console.log(getProfileUser);
            // after the get the data take the profile getting from user upload through client-side
            let profileUploadToCloud = could.uploader.upload_stream(
                {
                  folder: "PROJECT"
                },
                async function(error, result) {
                    console.log(error, result.secure_url);
                    await getProfileUser.image.push(result.secure_url);      
                }
            );
    
            streamifier.createReadStream(req.file.buffer).pipe(profileUploadToCloud);
            setTimeout(()=>{
                // set all data to the storage 
                 getProfileUser.specialist = req.body.specialist;
                 getProfileUser.seftDescription = req.body.des;
                 getProfileUser.category = req.body.category;
                 getProfileUser.contact.telegram = req.body.telegram;
                 getProfileUser.contact.gmail = req.body.gamil;
                 getProfileUser.contact.line = req.body.line;
                 getProfileUser.location = req.body.location;
                 getProfileUser.profession = req.body.profession;
                 getProfileUser.phoneContact = req.body.phone;
                // getProfileUser.company = req.body.company;
                // getProfileUser.companyName = req.body.companyName;
                //the the modified data to the json again
                console.log(getProfileUser);
                getProfileUserAll.map((profile,index)=>{
                    if(profile.email === req.session.email){
                        getProfileUserAll.splice(index,1,getProfileUser);
                    }          
                })
                fs.writeFileSync("./userprofile.json",JSON.stringify(getProfileUserAll));
            },4000);
            res.send("edit post success");
    });
    app.get("/getEdit",(req,res)=>{
        // get the data from the json file 
        let getProfileUser = JSON.parse(fs.readFileSync("./userprofile.json",{encoding:"utf-8",flag:"r"})).find(profile =>profile.email === req.session.email);
        res.json({data: getProfileUser});
    })

    //|===================================<< user post content >>========================================
    app.post("/postContent",Upload.array("relatedWork", 8),(req,res)=>{
        let image_urls =[];
        let getProfileUserAll = JSON.parse(fs.readFileSync("./userprofile.json",{encoding:"utf-8",flag:"r"}));
        let getProfileUser = getProfileUserAll.find(profile=> profile.email === req.session.email);
            // after the get the data take the profile getting from user upload through client-side
            for(let i =0 ; i<req.files.length;i++){
                let cld_upload_stream2 = could.uploader.upload_stream(
                    {
                      folder: "PROJECT"
                    },
                    async function(error, result) {
    
                        await image_urls.push(result.secure_url);
                        console.log(error, result.secure_url);
                         
                    }
                );   
                streamifier.createReadStream(req.files[i].buffer).pipe(cld_upload_stream2);
            }  
            // wait for a second after uploading
            setTimeout(()=>{
                
                for(const url of image_urls){
                    getProfileUser.relatedWork.push(url);
                   
                }
                // after set all the url images to the relatedWork already
                 // set all data to the storage 
                 getProfileUser.latlng = req.body.latlng;
                 getProfileUser.company= req.body.titile;
                 getProfileUser.background= req.body.back;
                 //the the modified data to the json again
                 getProfileUserAll.map((profile,index)=>{
                     getProfileUserAll.splice(index,1,getProfileUser);
                 })
                 fs.writeFileSync("./userprofile.json",JSON.stringify(getProfileUserAll));
                 let getDataFromStore = JSON.parse(fs.readFileSync("./data.json",{encoding : "utf-8" , flag : "r"}));
                 getDataFromStore.push(getProfileUser);
                 fs.writeFileSync("./data.json",JSON.stringify(getDataFromStore));
            },(req.files.length+3)*1000);
            res.send("edit post success");
    })
    // |============================== << get post content >> ================================
    app.get("/getPost",(req,res)=>{
        // Getting the dta 
        let getProfileUser = JSON.parse(fs.readFileSync("./data.json",{encoding:"utf-8",flag:"r"})).find(profile => profile.email === req.session.email);
        // send the send to the user 
        res.json({data : getProfileUser});
    })
    //|==================================<< get data from json file >>====================================
    app.get("/getData",(req,res)=>{

        // get data from the Json 
        //---------------------------------------------------
        let objData=[];
        let Data= [];
        let wraper ={};
        const data_from_json = fs.readFileSync('./data.json',{encoding:'utf8', flag:'r'});
        const data_from_categories = fs.readFileSync('./categories.json',{encoding:'utf8', flag:'r'});
        JSON.parse( data_from_categories).map(category=> {JSON.parse(data_from_json).map((matcher=>{
            if(matcher.category === category){
                // it matcher is equal to the category 
                objData.push(matcher);
            }
        })); wraper={
            "category":category,
            "data" : objData
        };Data.push(wraper);objData=[];wraper={}})
        res.json({"data":Data});
    })

    //|===========================================<< insert dat to the jsonm file >>>======================
    app.post('/insertData',Upload.fields([{name:'profile',maxCount:1},{name:'relatedWork',maxCount:8}]),async (req,res)=>{
        // create an array to the image  URL from the cloudinary
        const link = [];
        // schema to be stored in josn file 
        const insertedDataTmp = { 
            specialist : req.body.specialist,
            latlng  : req.body.latlng,
            seftDescription: req.body.des,
            category : req.body.category,
            contact: {
                "telegram" : req.body.telegram,
                "linkedIn" : req.body.linkedIn,
                "line"     : req.body.line
            },
            image : [],
            location : req.body.location,
            profession: req.body.profession,
            phoneContact : req.body.phone,
            background   : req.body.background,
            profile      : req.body.profile,
            email : req.body.email || null,
            password : req.body.password || null,
            company : req.body.company || null,
            relatedWork : []
        }
        // stream data to be stored in cloudinary server
        let cld_upload_stream1 = could.uploader.upload_stream(
            {
              folder: "PROJECT"
            },
            async function(error, result) {
                console.log(error, result.secure_url);
                await insertedDataTmp.image.push(result.secure_url);      
            }
        );

        streamifier.createReadStream(req.files['profile'][0].buffer).pipe(cld_upload_stream1);
        
        for(let i =0 ; i<req.files.relatedWork.length;i++){
            let cld_upload_stream2 = could.uploader.upload_stream(
                {
                  folder: "PROJECT"
                },
                async function(error, result) {

                    await link.push(result.secure_url);
                    console.log(error, result.secure_url);
                     
                }
            );   
            streamifier.createReadStream(req.files.relatedWork[i].buffer).pipe(cld_upload_stream2);
        }  
        //wait for a while until the image urls are sent by Cloudinary  
        setTimeout(()=>{
            for(const href of link){
                insertedDataTmp.relatedWork.push(href);
            }
        },(req.files.relatedWork.length+4)*1000);  
        // actual object that will be pushed to Json file
        let insertedData;
         // wait until the images are set into interDatatmp completely  
       setTimeout(()=>{
             // ge data from the json and push a new data it 
        const data_from_json = JSON.parse(fs.readFileSync('./data.json',{encoding:'utf8', flag:'r'}));
        // // loop to get the assigned id to the next data
        for(let i =0 ; i<=data_from_json.length;i++){
            if(i===data_from_json.length-1){
                insertedData = {
                    "id" : (data_from_json[i].id +1),
                    ...insertedDataTmp
                }
                break;
            }else{
                insertedData = {
                    "id" : 1,
                    ...insertedDataTmp
                }
            }
        }
         data_from_json.push(insertedData);
         fs.writeFileSync('./data.json',JSON.stringify(data_from_json));
         res.send("insert success");
       },(req.files.relatedWork.length+5)*1000);
    })
    // |===================================<< modify data in json file >>==============================
    app.put('/modifyData',(req,res)=>{
        // get data form the json
        const data_from_json = JSON.parse(fs.readFileSync('./data.json',{encoding:'utf8', flag:'r'}));
        // find data to be updated
        data_from_json.map((data) => {
            if(data.id === req.body.id){
                data.name = req.body.name;
                data.age = req.body.age;
                data.major = req.body.major;
            }
        });
        // write data to json back 
        fs.writeFileSync('./data.json',JSON.stringify(data_from_json));
        res.send("update success");
    })
    // | ==================================<< Delete all dta >>>======================
    app.delete('/deleteAll',(req,res)=>{
        let data_from_json = JSON.parse(fs.readFileSync('./data.json',{encoding:'utf8', flag:'r'}));
        // let all data to empty array
        data_from_json = [];
        // set the empty array to json file 
        fs.writeFileSync('./data.json',data_from_json);
        res.send("All data completely deleted from your data storage");
    })
    //| =================================<< delete a specific dta from the json f iel >>=================
    app.delete('/deleteData/:name',(req,res)=>{
         // get data form the json
         const data_from_json = JSON.parse(fs.readFileSync('./data.json',{encoding:'utf8', flag:'r'}));
         // check the data and delete it 
         data_from_json.map((data,index) => {
            if(data.specialist === req.params.name){
                // use the current idex of the element and delete it 
                data_from_json.splice(index,1);
            }
         })
         // write data to json back 
        fs.writeFileSync('./data.json',JSON.stringify(data_from_json));
        res.send("delete success");
    })
app.listen(PORT,()=> console.log("The server is running on PORT : "+PORT));