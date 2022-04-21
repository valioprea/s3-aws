require('dotenv').config();
const AWS = require('aws-sdk');
const { resize } = require('jimp');
const Jimp = require('jimp');

module.exports.testFunction = (req,res) => {
   console.log("testing, attention");
   return new Promise((resolve, reject) => {
      let a =1;
      if(a>0){
         console.log(b);
         return resolve(1);
      } else {
         return reject(0);
      }
   });
}

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
module.exports.uploadImage = async (data, fileName, category) => {
// s3client.listBuckets(function(err, data) {
//    if (err) {
//      console.log("Error", err);
//    } else {
//      console.log("SUUUUCCCCESSSSS BA", data.Buckets);
//    }
//  });

   switch (category) {
      case 'image':
         fileName = "imagine/"+fileName;
         break;
      case 'signature':
         fileName = 'signature/'+fileName;
         break;
      case 'avatar':
         fileName = 'avatar/'+fileName;
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
                  // resizeImage(data.Location, fileName);
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
module.exports.showImages = async (category) => {

   switch (category) {
      case 'image':
         Prefix = "imagine/";
         break;
      case 'signature':
         Prefix = 'signature/';
         break;
      case 'avatar':
         Prefix = 'avatar/';
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
            resolve(data);
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

