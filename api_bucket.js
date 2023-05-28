//
// app.get('/bucket?startafter=bucketkey', async (req, res) => {...});
//
// Retrieves the contents of the S3 bucket and returns the 
// information about each asset to the client. Note that it
// returns 12 at a time, use startafter query parameter to pass
// the last bucketkey and get the next set of 12, and so on.
//
const { ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { s3, s3_bucket_name, s3_region_name } = require('./aws.js');

exports.get_bucket = async (req, res) => {
  console.log("call to /bucket...");

  try {
    const maxKeys = 12;
    let startAfter = req.query.startafter || '';
    //let assets = [];
    let response = {};

    
      const listParams = {
        Bucket: s3_bucket_name,
        MaxKeys: maxKeys,
        StartAfter: startAfter
      };
      const data = await s3.send(new ListObjectsV2Command(listParams))

      response = {
        message: "success",
        data: data['Contents'],
      };

      if (data.IsTruncated && data.NextContinuationToken) {
        startAfter = data.Contents[data.Contents.length - 1].Key;
        response.nextPage = `${req.baseUrl}/bucket?startafter=${encodeURIComponent(startAfter)}`;
      }

     
    res.json(response);
  } catch (err) {
    res.status(400).json({
      "message": err.message,
      "data": []
    });
  }
};


