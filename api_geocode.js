const dbConnection = require('./database.js')

async function getImagesFromGeocode(latNE, longNE, latSW, longSW) {
    return new Promise((resolve, reject) => {
        // get images within geocode's rect
        const sql = `select assets.assetid, assets.userid, assets.assetname, assets.bucketkey,
         metadata.filesize, metadata.reswidth, metadata.resheight,
         metadata.locationlat, metadata.locationlong, metadata.datecreated
         from assets, metadata
         where metadata.assetid = assets.assetid
         and locationlat <= ?
         and locationlat >= ?
         and locationlong <= ?
         and locationlong >= ?;`;
        dbConnection.query(sql, [latNE, latSW, longNE, longSW], (error, results, fields) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

exports.geocode_images = async (req, res) => {
    console.log('call to /geocode...');
    try {
        let latNE  = parseFloat(req.params.latNE);
        let longNE = parseFloat(req.params.longNE);
        let latSW  = parseFloat(req.params.latSW);
        let longSW = parseFloat(req.params.longSW);
        if (longSW > longNE) {
            // overflowed prime meridian, adjust to raw magnitude:
            // - (180 - n) - 180 = -360 + n
            longSW -= 360;
            console.assert(longNE > longSW);
        }
        // note: probably need similar type of check for hemispheres, too

        const result = await getImagesFromGeocode(latNE, longNE, latSW, longSW);

        res.status(200).json({
            'message': 'success',
            'data': result
        });
    } catch (err) {
        console.log(`geocode() failed: ${err}`);
        res.status(500).json({
            message: 'Geocode server error',
            data: []
        });
    }
}
