require('dotenv').config();
const sharp = require('sharp');
const AWS = require('aws-sdk');

//Configure your aws!
const credentials = {
   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
   secretAccessKey: process.env.AWS_SECRET_KEY,
}
const s3Server = process.env.AWS_S3_SERVER || 'http://localhost:4566';
const bucketName = process.env.AWS_BUCKET_NAME;
const s3client = new AWS.S3({
   credentials,
   endpoint: s3Server,
   s3ForcePathStyle: true
})

// Create the parameters for calling createBucket
var bucketParams = {
   Bucket : bucketName
 };
 // call S3 to create the bucket
 s3client.createBucket(bucketParams, function(err, data) {
   if (err) {
     console.log("Error BUCKET", err);
   } else {
     console.log("Success BUCKET", data.Location);
   }
 });

// Function that uploads object
module.exports.uploadImage = async (data, fileName, category, refID) => {
   switch (category) {
      case 'image':
         fileName = refID+"/imagine/"+fileName;
         break;
      case 'signature':
         fileName = refID+'/signature/'+fileName;
         break;
      case 'avatar':
         fileName = refID+'/avatar/'+fileName;
         break;
      default:
         console.log("Switch problems");
   }

   return new Promise ((resolve,reject) => {
   let extn = fileName.split('.').pop();
   let contentType = "jpeg";
   extn = extn.toLowerCase();
   if(extn == 'png' || extn == 'jpg' || extn == 'jpeg' || extn == 'gif' ) {
      contentType = "image/" + extn;
      // fileName = "imagine/"+fileName;
            s3client.upload(
            {
               Bucket: bucketName,
               Key: fileName,
               Body: data,
               ContentType: contentType,
               ACL: 'public-read'
            },
            (err, data) => {
               if(err) {
                  reject(err);
               } else {
                  resolve(data.Location);
               }
            }
         )
   } else {
      console.log("File extension is not suitable");
      reject("Extension is not suitable");
      }
   })   
}

//Function that shows all images
module.exports.showImages = async (category, refID) => {

   switch (category) {
      case 'image':
         Prefix = refID+"/imagine/";
         break;
      case 'signature':
         Prefix = refID+'/signature/';
         break;
      case 'avatar':
         Prefix = refID+'/avatar/';
         break;
      default:
         console.log("Switch problems");
   }

   return new Promise((resolve, reject) => {
      bucketParams = {
         Bucket : bucketName,
         Prefix
       };
      s3client.listObjects(bucketParams, function(err,data) {
         if(err) {
            console.log("**ERROR**", err);
            reject(err);
         } else {
            console.log("Success", data);
            if(data.Contents.length <1 ){
               let defaultMessage = "No "+ category+ " could be found with your parameters";
               resolve(defaultMessage);
            } else {
               resolve(data);
            }
         }
      })
   })
}

//Function that deletes specific image
module.exports.deleteImage = async (myKey) => {
   return new Promise((resolve, reject)=> {
      const params = {
         Bucket: bucketName,
         Key:  myKey
      };
      s3client.deleteObject(params, (err,data) => {
         if (err) {
            console.log("We couldn't find that");
            reject(err);
         } else {
            console.log(data);
            resolve(data);
         }
      })
   })
}

//This function resizes in two different sizes the images
module.exports.obtainResized = async (files) => {
   let size1 = [];
   let size2 = [];
   return new Promise( async (resolve, reject) => {
      size1 = await callMe(files,150,1);
      size2 = await callMe(files,50,2);
      let a = [size1, size2]
      resolve(a);
   })
}
async function callMe(files,dimension,number) {
      let resized;
      let size = [];
      for( let i = 0; i< files.length; i++) {
         size[i] = Object.assign({}, files[i]);
         await sharp(size[i].buffer)
            .resize({ width: dimension, height: dimension, fit: 'fill'})
            .toBuffer()
            .then((data) => {resized = data })
            .catch((err => {console.log(err)}))
         size[i].buffer = resized;
         let stringN = number.toString();
         size[i].originalname = "size"+stringN+size[i].originalname;
      }
      return size;
}