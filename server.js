const express = require('express');
const app = express();
const ejs = require('ejs');
const path = require('path');
const {uploadImage, showImages, deleteImage, obtainResized} = require('./aws-upload');
const sharp = require('sharp');

const multer = require('multer');

const upload = multer({});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//IMAGE SECTION
app.post('/images/v1/references/id_de_referinta/images', upload.array('image'), async (req,res) => {
   const files = req.files;
   let size1 = [];
   let size2 = [];
   let results = await obtainResized(files);
   size1 = results[0];
   size2 = results[1];
   
   try {
      let responseOriginal = [];
      let response1 = [];
      let response2 = [];
      for (let i = 0; i < files.length; i++){
         responseOriginal[i] = await uploadImage(files[i].buffer, files[i].originalname, "image");
         response1[i] = await uploadImage(size1[i].buffer, size1[i].originalname, "image");
         response2[i] = await uploadImage(size2[i].buffer, size2[i].originalname, "image");
         // console.log(responseOriginal[i])
         // console.log(response1[i])
         // console.log(response2[i])
      }
      let response = [responseOriginal, response1, response2]
      res.send(response);
   }
   catch(err) {
      res.send(err);
   }
})

app.get('/images/v1/references/id_de_referinta/images', async (req,res) =>{
   try{
      const response = await showImages("image");
      res.send(response);
   } catch (err) {
      res.send(err);
   }
})

app.delete('/images/v1/references/id_de_referinta/images/delete/:Folder/:initialName', async(req,res) => {
   try{
      const Key = req.params.Folder+"/"+req.params.initialName;
      await deleteImage(Key);      
      res.send("Image deleted");
   }catch(err){
      res.send(err);
   }
})
//END OF IMAGE SECTION


//SIGNATURE SECTION
app.post('/images/v1/references/id_de_referinta/signature', upload.single('image'), async (req,res) => {
   const file = req.file;
   try {
      const response = await uploadImage(file.buffer, file.originalname, "signature");
      res.send(response);
   }
   catch(err) {
      res.send(err);
   }
})

app.get('/images/v1/references/id_de_referinta/signature', async (req,res) =>{
   try{
      const response = await showImages("signature");
      res.send(response);
   } catch (err) {
      res.send(err);
   }
})

app.delete('/images/v1/references/id_de_referinta/signature/delete/:Folder/:initialName', async(req,res) => {
   try{
      const Key = req.params.Folder+"/"+req.params.initialName;
      await deleteImage(Key);
      res.send("Image deleted");
   }catch(err){
      res.send(err);
   }
})
//END OF SIGNATURE SECTION

//AVATAR SECTION
app.post('/images/v1/references/id_de_referinta/avatar', upload.single('image'), async (req,res) => {
   const file = req.file;
   try {
      const response = await uploadImage(file.buffer, file.originalname, "avatar");
      res.send(response);
   }
   catch(err) {
      res.send(err);
   }
})

app.get('/images/v1/references/id_de_referinta/avatar', async (req,res) =>{
   try{
      const response = await showImages("avatar");
      res.send(response);
   } catch (err) {
      res.send(err);
   }
})

app.delete('/images/v1/references/id_de_referinta/avatar/delete/:Folder/:initialName', async(req,res) => {
   try{
      const Key = req.params.Folder+"/"+req.params.initialName;
      await deleteImage(Key);
      res.send("Image deleted");
   }catch(err){
      res.send(err);
   }
})
//END OF AVATAR SECTION

//front page route
app.get('/', (req,res) => {
   res.render('page');
})

app.listen('3000', () => {
   console.log('Server is serving on port 3000');
})