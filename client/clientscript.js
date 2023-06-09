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

searchByDate.addEventListener('click', () => {
  console.log('clicked search by date')

  var fromDate = document.getElementById('fromDate')
  var toDate = document.getElementById('toDate')

  // console.log(fromDate.value)
  // console.log(convertToMySQLDateTime(fromDate.value))

  if (!fromDate.value || !toDate.value) {
    console.log('No date input')
    return
  }

  const dRange = {
    fromDate: convertToMySQLDateTime(fromDate.value),
    toDate: convertToMySQLDateTime(toDate.value),
  }

  fetch('http://localhost:8080/byDate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dRange),
  })
    .then((response) => response.json())
    .then((data) => {
      createAssetTable(data)
      setStatusViewText('Status View')
    })
    .catch((error) => {
      console.error(error)
    })
})

searchBySize.addEventListener('click', () => {
  console.log('clicked search by size')

  var fromSize = document.getElementById('fromSize')
  var toSize = document.getElementById('toSize')

  if (!fromSize.value || !toSize.value) {
    console.log('No size input')
    return
  }

  const sRange = {
    fromSize: fromSize.value * 1000, // 1024 is correct but 1000 makes the math easier for end-users
    toSize: toSize.value * 1000,
  }

  fetch('http://localhost:8080/bySize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sRange),
  })
    .then((response) => response.json())
    .then((data) => {
      createAssetTable(data)
      setStatusViewText('Status View')
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
      resetTable(tableBody)

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
      createAssetTable(data)
      setStatusViewText('Status View')
    })
    .catch((error) => {
      console.error(error)
    })
})

uploadButton.addEventListener('click', async () => {
  console.log('upload image clicked')
  setUploadSpanText('')

  var textField = document.getElementById('userid')
  if (!textField.value) {
    setUploadSpanText('Empty user id!')
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

  if (!file) {
    setUploadSpanText('No file selected!')
    return
  }

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
    if (!reader.result) {
      // user likely deleted the file after choose the file but before clicking 'upload'
      setUploadSpanText('Image cannot be found!')
      return
    }

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
    .then((response) => response.json())
    .then((result) => {
      const text = `${result.message}! ID: ${result.assetid}`
      setStatViewText(text)
    })
    .catch((error) => {
      setStatViewText(error)
    })
}

// add or update user
addUserButton.addEventListener('click', async () => {
  // get data from text boxes
  const ids = ['userEmail', 'userLastName', 'userFirstName', 'userBucketFolder']

  // return early if user left any field empty
  if (ids.some((elem) => document.getElementById(elem).value.length === 0)) {
    setUserSpanText('User info fields cannot be empty.')
    return
  }

  const userData = {
    email: document.getElementById(ids[0]).value,
    lastname: document.getElementById(ids[1]).value,
    firstname: document.getElementById(ids[2]).value,
    bucketfolder: document.getElementById(ids[3]).value,
  }

  // call /user with this data
  fetch('http://localhost:8080/user', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  })
    .then((response) => response.json())
    .then((result) => {
      console.log('PUT request successful:', result)
      const text = `${result.message} user "${userData.email}" successfully!`
      setUserSpanText(text)

      // clear text boxes
      for (let idx = 0; idx < ids.length; ++idx) {
        document.getElementById(ids[idx]).value = ''
      }
    })
    .catch((error) => {
      console.error('Error making PUT request:', error)
    })
})

geocodeButton.addEventListener('click', async () => {
  setStatViewText('')
  const apiKey = 'AIzaSyAr_wqIM1sFyl2oJnF1YvAhbkZmD8OoSuA' // <-- see GeocodeAPIKey.txt
  let location = getGeocodeText()

  // support "near me" queries (assume Evanston)
  location = location.replace(/\bnear me\b/gi, 'near Evanston')

  const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    location,
  )}&key=${apiKey}`

  const response = await fetch(geocodeUrl)
  const data = await response.json()
  if (data.status === 'OK') {
    const geometry = data.results[0].geometry

    // todo: look into why 'bounds' doesn't always exist (sometimes it is viewport)
    // one way to trigger this is to search for 'sdf'
    const boundsField = geometry.bounds ? 'bounds' : 'viewport'

    const northeast = geometry[boundsField].northeast
    const southwest = geometry[boundsField].southwest
    const northeastText = 'Northeast bounds: ' + JSON.stringify(northeast)
    const southwestText = 'Southwest bounds: ' + JSON.stringify(southwest)
    setNortheastSpanText(northeastText)
    setSouthwestSpanText(southwestText)

    geocodeImages(northeast, southwest)
    setStatusViewText(`Status View (filtering for ${location})`)
  } else {
    // get message (error or status) and set text
    const text = data.error_message ? data.error_message : data.status
    setNortheastSpanText(text)
    // this span is not needed for errors
    setSouthwestSpanText('')
  }
})

document
  .getElementById('geocodeInput')
  .addEventListener('keyup', function (event) {
    // set enter key on geocode input box to trigger click event
    event.preventDefault()
    if (event.key === 'Enter') {
      document.getElementById('geocodeButton').click()
    }
  })

function setUserSpanText(text) {
  document.getElementById('addUserSpan').textContent = text
}

function getGeocodeText() {
  return document.getElementById('geocodeInput').value
}

function setNortheastSpanText(text) {
  document.getElementById('northeastSpan').textContent = text
}

function setSouthwestSpanText(text) {
  document.getElementById('southwestSpan').textContent = text
}

function resetTable(tableBody) {
  const rows = tableBody.getElementsByTagName('tr')
  if (rows.length > 1) {
    console.log('resetting table')
    for (let i = rows.length - 1; i > 0; i--) {
      tableBody.removeChild(rows[i])
    }
  }
}

function geocodeImages(northeast, southwest) {
  const url = `http://localhost:8080/geocode/${northeast.lat}/${northeast.lng}/${southwest.lat}/${southwest.lng}`
  fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => {
      createAssetTable(data)
    })
}

function createAssetTable(data) {
  var tableBody = document.getElementById('assetT')

  //reset table if occupied
  resetTable(tableBody)

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
}

function setStatusViewText(text) {
  document.getElementById('StatusView').textContent = text
}

function setUploadSpanText(text) {
  document.getElementById('uploadSpan').textContent = text
}

function setStatViewText(text) {
  document.getElementById('statView').textContent = text
}
