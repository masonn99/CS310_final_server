function getImageSize(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = function (event) {
      const img = new Image()
      img.onload = function () {
        const size = {
          width: img.width,
          height: img.height,
        }
        resolve(size)
      }
      img.onerror = function () {
        reject(new Error('Failed to load image.'))
      }
      img.src = event.target.result
    }
    reader.onerror = function () {
      reject(new Error('Failed to read file.'))
    }
    reader.readAsDataURL(file)
  })
}

function getImageCoordinates(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = function (event) {
      const img = new Image()
      img.onload = function () {
        EXIF.getData(img, function () {
          const exifData = EXIF.getAllTags(this)
          const { GPSLatitude, GPSLongitude } = exifData
          if (GPSLatitude && GPSLongitude) {
            const latitude = convertDMSToDD(GPSLatitude)
            const longitude = convertDMSToDD(GPSLongitude)
            resolve({ latitude, longitude })
          } else {
            reject(new Error('No GPS coordinates found in the image.'))
          }
        })
      }
      img.onerror = function () {
        reject(new Error('Failed to load image.'))
      }
      img.src = event.target.result
    }
    reader.onerror = function () {
      reject(new Error('Failed to read file.'))
    }
    reader.readAsDataURL(file)
  })
}

// Helper function to convert GPS coordinates from DMS (Degrees, Minutes, Seconds) to DD (Decimal Degrees)
function convertDMSToDD(dmsArray) {
  const degrees = dmsArray[0].numerator / dmsArray[0].denominator
  const minutes = dmsArray[1].numerator / dmsArray[1].denominator / 60
  const seconds = dmsArray[2].numerator / dmsArray[2].denominator / 3600
  const dd = degrees + minutes + seconds
  return dd
}

function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}
