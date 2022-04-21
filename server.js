const express = require('express');
const app = express();
const ejs = require('ejs');
const path = require('path');
// const testFunction = require('./aws-upload');
const {testFunction, uploadImage, showImages, deleteImage, resizeImage} = require('./aws-upload');
const Jimp = require('jimp');
const sharp = require('sharp');

const multer = require('multer');

const upload = multer({}); //in exemplu aveam in paranteze storage:storage
// const upload = multer({ dest: 'uploads/'});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//IMAGE SECTION
app.post('/images/v1/references/id_de_referinta/images', upload.array('image'), async (req,res) => {
   const files = req.files;

   // ALSO POSSIBLE WITH .THEN .CATCH BLOCK
   // uploadFile(file.buffer, file.originalname)
   // .then((response) => {
   //    console.log("a functionat menutzule")
   //    res.status(200).send(response);
   // })
   // .catch((err) => {
   //    res.status(400).send(err);
   // })
   
   
//    let a  = await Jimp.read(files[0].buffer)
//   .then(image => {
//     // Do stuff with the image.
//     console.log("da")
//     image.resize(150, 150).write("test.png");
//   })
//   .catch(err => {
//     // Handle an exception.
//     console.log(err);
//   });

   let size1 = [];
   let size2 = [];
   let resized1;
   let resized2;
   
   for (let j = 0; j< files.length; j++){
      size1[j] = Object.assign({}, files[j]);
      size2[j] = Object.assign({}, files[j]);
      
      await sharp(size1[j].buffer)
         .resize({ width: 150, height: 150, fit: 'fill'})
         .toBuffer()
         .then((data) => {resized1 = data })
         .catch((err => {console.log(err)}))
      size1[j].buffer = resized1;
      size1[j].originalname = "size1"+size1[j].originalname;

      await sharp(size2[j].buffer)
         .resize({ width: 50, height: 50, fit: 'fill'})
         .toBuffer()
         .then((data) => {resized2 = data})
         .catch((err => {console.log(err)}))   
      size2[j].buffer = resized2;
      size2[j].originalname = "size2"+size2[j].originalname;
   }

   try {
      let responseOriginal = [];
      let response1 = [];
      let response2 = [];
      for (let i = 0; i < files.length; i++){
         responseOriginal[i] = await uploadImage(files[i].buffer, files[i].originalname, "image");
         response1[i] = await uploadImage(size1[i].buffer, size1[i].originalname, "image");
         response2[i] = await uploadImage(size2[i].buffer, size2[i].originalname, "image");
         console.log(responseOriginal[i])
         console.log(response1[i])
         console.log(response2[i])
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