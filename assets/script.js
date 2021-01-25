window.onload = function () {
  const formJson = document.querySelector('#formJson')
  const inputJson = document.querySelector('#inputJson')
  const inputWithHeader = document.querySelector('#inputWithHeader')
  const btnClear = document.querySelector('#btnClear')
  const btnDownload = document.querySelector('#btnDownload')
  const inputFilename = document.querySelector('#input-filename')
  const tableResultWrapper = document.querySelector('#table-result-wrapper')
  const resultSuccessWrapper = document.querySelector('#result-success-wrapper')
  const resultFailedWrapper = document.querySelector('#result-failed-wrapper')
  const plainTextResult = document.querySelector('#plain-text-result')
  const btnShowTable = document.querySelector('#btn-show-table')
  const btnShowPlainText = document.querySelector('#btn-show-plain-text')

  let csvHeader = []
  let csvBody = []
  let csvPlainText = ''

  const getRow = (item, header) => {
    const row = []
    header.forEach(h => {
      row.push(item[h] !== undefined ? item[h] : '')
    })
    return row
  }

  const getBody = (data, header) => {
    const body = []
    if (Array.isArray(data)) {
      data.forEach(item => {
        body.push(getRow(item, header))
      })
    } else {
      body.push(getRow(data, header))
    }
    return body
  }

  const getPlainText = (header, body) => {
    let plainText = ''

    if (inputWithHeader.checked) {
      plainText += `${header.join(',')}\r\n`
    }
    
    plainText += `${body.map(b => b.join(',')).join('\r\n')}`

    return plainText
  }

  const getHeader = (data) => {
    let header  = []
    if (Array.isArray(data)) {
      data.forEach((item) => {
        const keys = Object.keys(item)
        header = [...new Set([...header, ...keys])]
      })
    } else {
      header = Object.keys(data)
    }
    return header
  }

  const renderResult = () => {
    const tableHead = inputWithHeader.checked ? `<thead><tr>${csvHeader.map(h => `<th>${h}</th>`).join('')}</tr><thead>` : ''
    const tableBody = `<tbody>${csvBody.map(b => `<tr>${b.map(i => `<td>${i}</td>`).join('')}</tr>`).join('')}</tbody>`
    const tableResult = `<table class="table table-sm">${tableHead}${tableBody}</table>`
    tableResultWrapper.innerHTML = tableResult
    plainTextResult.innerHTML = csvPlainText
  }

  const converterCsv = (data) => {
    csvHeader = getHeader(data)
    csvBody = getBody(data, csvHeader)
    csvPlainText = getPlainText(csvHeader, csvBody)
    renderResult()
    resultSuccessWrapper.classList.remove('d-none')
  }

  const handleClear = (e, exceptJsonValue) => {
    if (!exceptJsonValue) {
      inputJson.value = ''
    }
    inputJson.classList.remove('is-invalid')
    tableResultWrapper.innerHTML = ''
    resultSuccessWrapper.classList.add('d-none')
    resultFailedWrapper.classList.add('d-none')
    csvHeader = []
    csvBody = []
    csvPlainText = ''
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    let data = {}
    try {
      data = JSON.parse(inputJson.value)
    } catch (err) {
      inputJson.classList.add('is-invalid')
      return
    }

    try {
      handleClear(e, true)
      converterCsv(data)
    } catch (err) {
      resultSuccessWrapper.classList.add('d-none')
      resultFailedWrapper.classList.remove('d-none')
      console.error(err)
      return
    }
  }

  const handleDownload = (e) => {
    const filename = inputFilename.value ? `${inputFilename.value}.csv` : 'json2csv.csv'
    const blob = new Blob([csvPlainText])
    const url = window.URL.createObjectURL(blob, { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleShowTable = (e) => {
    btnShowTable.classList.remove('btn-outline-primary')
    btnShowTable.classList.add('btn-primary')

    btnShowPlainText.classList.remove('btn-primary')
    btnShowPlainText.classList.add('btn-outline-primary')

    plainTextResult.classList.add('d-none')
    tableResultWrapper.classList.remove('d-none')
  }

  const handleShowPlainText = (e) => {
    btnShowTable.classList.remove('btn-primary')
    btnShowTable.classList.add('btn-outline-primary')

    btnShowPlainText.classList.remove('btn-outline-primary')
    btnShowPlainText.classList.add('btn-primary')

    tableResultWrapper.classList.add('d-none')
    plainTextResult.classList.remove('d-none')
  }

  formJson.addEventListener('submit', handleSubmit)
  btnClear.addEventListener('click', handleClear)
  btnDownload.addEventListener('click', handleDownload)
  btnShowTable.addEventListener('click', handleShowTable)
  btnShowPlainText.addEventListener('click', handleShowPlainText)
}