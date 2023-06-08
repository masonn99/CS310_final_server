const dbConnection = require('./database.js')

async function getImagesFromGeocode(latNE, longNE, latSW, longSW) {
    return new Promise((resolve, reject) => {
        // get images within geocode's rect
        const sql = `select * from assets
                     where locationlat <= ?
                     and locationlat >= ?
                     and locationlong <= ?
                     and locationlong >= ?`
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
        const latNE  = parseFloat(req.params.latNE);
        const longNE = parseFloat(req.params.longNE);
        const latSW  = parseFloat(req.params.latSW);
        const longSW = parseFloat(req.params.longSW);
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
