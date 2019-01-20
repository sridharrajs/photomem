/**
 * Created by sridharrajs on 1/20/19.
 */

let express = require('express');

let app = express.Router();

let AwsS3 = require('aws-sdk/clients/s3');
const pretty = require('prettysize');

const s3 = new AwsS3({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: process.env.S3_REGION
});

function listFolders(req, res) {
  s3.listObjectsV2({
    Bucket: process.env.S3_BUCKET_NAME,
    MaxKeys: 20,
    Delimiter: '/',
  }, (err, data) => {
    if (err) {
      return res.status(500).send({
        errors: {
          msg: 'Error when listing folders'
        }
      });
    }

    return res.status(200).send({
      folders: data.CommonPrefixes.map(item => {
        return {
          folder_name: item.Prefix
        };
      })
    });
  });
}

function getSignedURL(req, res) {
  // var url = s3.getSignedUrl('getObject', {
  //   Bucket: process.env.S3_BUCKET_NAME,
  //   Key: "screenshots/Selection_005.png" //path of the file including folder
  // });
}

function listFiles(req, res) {
  let folderName = req.query.folder_name;
  if (!folderName) {
    return res.status(400).send({
      error: {
        msg: 'Invalid folder name'
      }
    });
  }

  if (!folderName.includes('/')) {
    folderName = folderName + '/';
  }

  s3.listObjectsV2({
    Bucket: process.env.S3_BUCKET_NAME,
    MaxKeys: 20,
    Delimiter: '/',
    Prefix: folderName
  }, (err, data) => {
    if (err) {
      return res.status(500).send({
        errors: {
          msg: 'Error when listing files'
        }
      });
    }

    return res.status(200).send({
      files: data.Contents.map(item => {
        return {
          key: item.Key,
          size: pretty(item.Size),
          is_folder: item.Key[item.Key.length - 1] === '/'
        };
      })
    });

  });

}

app.get('/folders', listFolders);
app.get('/files', listFiles);

module.exports = app;