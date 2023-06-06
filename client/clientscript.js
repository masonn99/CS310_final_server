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
  console.log('clicked asset')
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

uploadButton.addEventListener('click', async () => {
  console.log('upload image clicked')

  var textField = document.getElementById('userid')
  if (textField.value === null) {
    console.log('empty user id')
    return
  }

  //Init img data
  const imgData = {
    data: '',
    assetname: '',
    datecreated: '0000-00-00 00:00:00',
    filesize: null,
    reswidth: null,
    resheight: null,
    locationlat: null,
    locationlong: null,
  }

  var fileInput = document.getElementById('imageInput')
  var file = fileInput.files[0]

  imgData.assetname = file.name
  imgData.datecreated = formatDate(file.lastModifiedDate)
  imgData.filesize = file.size

  await getImageSize(file)
    .then((size) => {
      imgData.reswidth = size.width
      imgData.resheight = size.height
    })
    .catch((error) => {
      console.error(error)
    })

  await getImageCoordinates(file)
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
  fetch('http://localhost:8080/image/' + userid, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Add any additional headers required by your API
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

// add or update user
addUserButton.addEventListener('click', async () => {
    // get data from text boxes
    const ids = ['userEmail', 'userLastName', 'userFirstName', 'userBucketFolder'];

    // return early if user left any field empty
    if (ids.some((elem) => document.getElementById(elem).value.length === 0)) {
        alert('User info fields cannot be empty');
        return;
    }

    const userData = {
        email: document.getElementById(ids[0]).value,
        lastname: document.getElementById(ids[1]).value,
        firstname: document.getElementById(ids[2]).value,
        bucketfolder: document.getElementById(ids[3]).value
    };

    // call /user with this data
    fetch('http://localhost:8080/user', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
        .then(response => response.json())
        .then(result => {
            console.log('PUT request successful:', result);
            alert(result.message + ' user successfully!');

            // clear text boxes
            for (let idx = 0; idx < ids.length; ++idx) {
                document.getElementById(ids[idx]).value = '';
            }
        })
        .catch(error => {
            console.error('Error making PUT request:', error);
        });
})
