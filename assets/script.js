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

  Array.prototype.sMap = function (callback) {
    return this.map(callback).join('')
  }

  const getRow = (item, header) => {
    return header.map(h => item[h] !== undefined ? item[h] : '')
  }

  const getBody = (data, header) => {
    return Array.isArray(data)
      ? data.map(item => getRow(item, header))
      : [getRow(data, header)]
  }

  const getHeader = (data) => {
    return Array.isArray(data)
      ? [...new Set(data.reduce((dict, item) => ([ ...dict, ...Object.keys(item) ]), []))]
      : Object.keys(data)
  }

  const getPlainText = (header, body) => {
    let plainText = ''
    if (inputWithHeader.checked) {
      plainText += `${header.join(',')}\r\n`
    }    
    plainText += `${body.map(b => b.join(',')).join('\r\n')}`
    return plainText
  }

  const converterCsv = (data) => {
    csvHeader = getHeader(data)
    csvBody = getBody(data, csvHeader)
    csvPlainText = getPlainText(csvHeader, csvBody)
  }

  const renderResult = () => {
    const tableHead = inputWithHeader.checked ? `<thead><tr>${csvHeader.sMap(h => `<th>${h}</th>`)}</tr><thead>` : ''
    const tableBody = `<tbody>${csvBody.sMap(b => `<tr>${b.sMap(i => `<td>${i}</td>`)}</tr>`)}</tbody>`
    const tableResult = `<table class="table table-sm">${tableHead}${tableBody}</table>`
    tableResultWrapper.innerHTML = tableResult
    plainTextResult.innerHTML = csvPlainText
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
      renderResult()
      resultSuccessWrapper.classList.remove('d-none')
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

  const toggleVisibilityContent = (options) => {
    const { btnActive, containerActive, btnInactive, containerInactive } = options

    btnInactive.classList.remove('btn-primary')
    btnInactive.classList.add('btn-outline-primary')

    btnActive.classList.remove('btn-outline-primary')
    btnActive.classList.add('btn-primary')

    containerInactive.classList.add('d-none')
    containerActive.classList.remove('d-none')
  }

  const handleShowTable = (e) => {
    toggleVisibilityContent({ btnActive: btnShowTable, containerActive: tableResultWrapper, btnInactive: btnShowPlainText, containerInactive: plainTextResult })
  }

  const handleShowPlainText = (e) => {
    toggleVisibilityContent({ btnActive: btnShowPlainText, containerActive: plainTextResult, btnInactive: btnShowTable, containerInactive: tableResultWrapper })
  }

  formJson.addEventListener('submit', handleSubmit)
  btnClear.addEventListener('click', handleClear)
  btnDownload.addEventListener('click', handleDownload)
  btnShowTable.addEventListener('click', handleShowTable)
  btnShowPlainText.addEventListener('click', handleShowPlainText)
}