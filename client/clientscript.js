//API handlers

stats.addEventListener('click', () => {
  console.log('clicked stat')
  fetch(
    'http://localhost:8080/stats',
    (headers = {
      'Content-Type': 'application/json',
    }),
  )
    .then((response) => response.json())
    .then((data) => {
      // console.log(data)
      var paragraph = document.getElementById('statView')
      paragraph.innerHTML = ''
      paragraph.textContent += 'Message ' + data['message']
      paragraph.textContent += ' | Status ' + data['s3_status']
      paragraph.textContent += ' | db_Users ' + data['db_numUsers']
      paragraph.textContent += ' | db_Assets ' + data['db_numAssets']
    })
    .catch((error) => {
      console.error(error)
    })
})

users.addEventListener('click', () => {
  console.log('clicked user')
  fetch(
    'http://localhost:8080/users',
    (headers = {
      'Content-Type': 'application/json',
    }),
  )
    .then((response) => response.json())
    .then((data) => {
      var tableBody = document.getElementById('userT')

      var rows = tableBody.getElementsByTagName('tr')

      //reset table if occupied
      if (rows.length > 1) {
        console.log('resetting table')
        for (var i = rows.length - 1; i > 0; i--) {
          tableBody.removeChild(rows[i])
        }
      }

      // Iterate over the JSON data
      data['data'].forEach(function (item) {
        // Create a new row
        var row = document.createElement('tr')

        // Insert cells with values
        Object.values(item).forEach(function (value) {
          var cell = document.createElement('td')
          cell.textContent = value
          row.appendChild(cell)
        })

        // Append row to the table body
        tableBody.appendChild(row)
      })
    })
    .catch((error) => {
      console.error(error)
    })
})

assets.addEventListener('click', () => {
  console.log('clicked user')
  fetch(
    'http://localhost:8080/assets',
    (headers = {
      'Content-Type': 'application/json',
    }),
  )
    .then((response) => response.json())
    .then((data) => {
      var tableBody = document.getElementById('assetT')

      var rows = tableBody.getElementsByTagName('tr')

      //reset table if occupied
      if (rows.length > 1) {
        console.log('resetting table')
        for (var i = rows.length - 1; i > 0; i--) {
          tableBody.removeChild(rows[i])
        }
      }

      // console.log(data['data'])

      data['data'].forEach(function (item) {
        // Create a new row
        var row = document.createElement('tr')

        // Insert cells with values
        Object.values(item).forEach(function (value) {
          var cell = document.createElement('td')
          cell.textContent = value
          row.appendChild(cell)
        })

        // Append row to the table body
        tableBody.appendChild(row)
      })
    })
    .catch((error) => {
      console.error(error)
    })
})

uploadButton.addEventListener('click', function () {
  console.log('upload image clicked')
  var textField = document.getElementById('userid')
  if (textField.value === null) {
    console.log('empty user id')
    return
  }

  var fileInput = document.getElementById('imageInput')
  var file = fileInput.files[0]

  //Init img data
  var imgData = {
    data: '',
    assetname: file.name,
    datecreated: formatDate(file.lastModifiedDate),
    filesize: file.size,
    reswidth: null,
    resheight: null,
    locationlat: 0,
    locationlong: 0,
  }

  getImageSize(file)
    .then((size) => {
      imgData.reswidth = size.width
      imgData.resheight = size.height
    })
    .catch((error) => {
      console.error(error)
    })

  getImageCoordinates(file)
    .then((coordinates) => {
      imgData.locationlat = coordinates.latitude
      imgData.locationlong = coordinates.longitude
    })
    .catch((error) => {
      //No GPS coordinates or other errors
      console.error(error)
    })

  var reader = new FileReader()
  reader.onloadend = function () {
    var base64String = reader.result.split(',')[1] // Extract the Base64 string (remove the prefix)
    // Send the Base64 string to the REST API
    imgData.data = base64String
    sendImage(imgData, textField.value)
  }

  reader.readAsDataURL(file)
})

//Using random test data
function sendImage(imgData, userid) {
  
  console.log(imgData)
  
  fetch('http://localhost:8080/image/' + userid, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(imgData),
  })
    .then((response) => {
      console.log(response)
      //do sth with the response
      var paragraph = document.getElementById('statView')
      paragraph.innerHTML = 'Message ' + response['status']
    })
    .catch((error) => {
      console.log(error)
    })
}
