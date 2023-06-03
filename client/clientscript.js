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
  var fileInput = document.getElementById('imageInput')
  var file = fileInput.files[0]

  var reader = new FileReader()
  var textField = document.getElementById('userid')

  if (textField.value === null) {
    console.log('empty user id')
    return
  }

  reader.onloadend = function () {
    var base64String = reader.result.split(',')[1] // Extract the Base64 string (remove the prefix)

    // Send the Base64 string to the REST API

    sendImage(base64String, textField.value)
  }

  reader.readAsDataURL(file)
})

//Using random test data
function sendImage(base64String, userid) {
  fetch('http://localhost:8080/image/' + userid, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: base64String,
      assetname: 'ANp',
      datecreated: '0000-00-00 00:00:00',
      filesize: 30,
      reswidth: 300,
      resheight: 300,
      locationlat: 0,
      locationlong: 0,
    }),
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
