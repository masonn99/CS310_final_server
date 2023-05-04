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
    const listParams = {
      Bucket: s3_bucket_name,
      MaxKeys: maxKeys,
      StartAfter: startAfter
    };
    const data = await s3.send(new ListObjectsV2Command(listParams));
    let assets = [];
    if (data.KeyCount > 0) {
      assets = data.Contents.map(item => {
        return {
          key: item.Key,
          size: item.Size,
          lastModified: item.LastModified
        };
      });
    }
    const response = {
      message: "Success",
      data: assets,
    };
    if (data.IsTruncated && data.NextContinuationToken) {
      response.nextPage = `${req.baseUrl}/bucket?startafter=${encodeURIComponent(data.Contents[data.Contents.length - 1].Key)}`;
    }
    res.json(response);


    //
    // TODO: remember, 12 at a time...  Do not try to cache them here, instead 
    // request them 12 at a time from S3
    //
    // AWS:
    //   https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_s3_code_examples.html
    //   https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/listobjectsv2command.html
    //   https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/
    //
    

  }//try
  catch (err) {
    res.status(400).json({
      "message": err.message,
      "data": []
    });
  }//catch

}//get
