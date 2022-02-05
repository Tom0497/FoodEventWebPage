import {capitalizeString, getEvents, queryId} from "./utils.js"

let tableBody = queryId('table-body'),
    pagination = queryId('pagination'),
    eventModalDiv = queryId('show-event'),
    eventModalBody = queryId('show-event-body'),
    singleImageModalDiv = queryId('single-image'),
    singleImageModalBodyDiv = queryId('single-image-body')

let eventModal =
        new bootstrap.Modal(eventModalDiv, {
          backdrop: 'static',
          keyboard: false
        }),
    singleImageModal =
        new bootstrap.Modal(singleImageModalDiv, {
          backdrop: 'static',
          keyboard: false
        })

getEvents().then(response => {
  const events = response
  console.log({events})

  const pageCount = Math.ceil(events.length / 5)
  let pages = []
  for (let pageNumber = 0; pageNumber < pageCount; pageNumber++) {
    const
        idxStart = pageNumber * 5,
        idxEnd = (pageNumber + 1) * 5
    const eventSlice = events.slice(idxStart, idxEnd)
    pages.push(eventSlice)

    pagination.innerHTML += `
      <li class="page-item"><a class="page-link" type="button">${pageNumber + 1}</a></li>
    `
  }

  if (pages.length === 0) return

  let currentPage = 0
  showPage(pages, currentPage)

  pagination.addEventListener('click', (e) => {
    e.preventDefault()
    let element = e.target
    let elementClassList = element.classList

    if (!elementClassList.contains('page-link')) return

    const selectedPage = parseInt(element.innerText) - 1
    if (selectedPage === currentPage) return

    showPage(pages, selectedPage)
    currentPage = selectedPage
  })

  tableBody.addEventListener('click', (e) => {
    e.preventDefault()
    const element = e.target
    const elementTag = element.tagName

    if (elementTag !== 'TD') return

    let rowElement = element.parentElement
    const selectedEventIdx = parseInt(rowElement.id.replace('row-', ''))
    console.log({currentPage, selectedEventIdx})
    showEventModal(pages[currentPage][selectedEventIdx])
  })

  eventModalBody.addEventListener('click', (e) => {
    const element = e.target
    const elementTag = element.tagName
    const elementClassList = element.classList

    if (elementTag !== 'IMG') return
    if(!elementClassList.contains('inside-modal')) return

    showImageModal(element)
  })

})


const showImageModal = (imageElement) => {
  const imageSrc = imageElement.src
  singleImageModalBodyDiv.innerHTML = `
    <img src="${imageSrc}" class="img-fluid event-list-img-clicked" alt="foto de evento">
  `

  singleImageModal.show()
}


const showEventModal = (eventData) => {
  const
      region = eventData['region'],
      startDate = eventData['dia-hora-inicio'],
      endDate = eventData['dia-hora-termino'],
      comuna = eventData['comuna'],
      sector = eventData['sector'],
      foodType = eventData['tipo-comida'],
      description = eventData['descripcion-evento'],
      images = eventData['foto-comida'],
      name = eventData['nombre'],
      email = eventData['email'],
      celular = eventData['celular'],
      socialNetworks = eventData['red-social']

  let socialNetworksList = ''
  socialNetworks.forEach(
      (socialNetwork) => {
        const
            socialNetworkName = capitalizeString(socialNetwork['social-network']),
            socialNetworkURL = socialNetwork['url']

        socialNetworksList += `
          <li>${socialNetworkName}: <a href="${socialNetworkURL}" target="_blank">Perfil</a></li>
        `
      }
  )

  let imagesList = ''
  images.forEach(
      (image) => {
        const
            imageBasePath = image['basepath'],
            imageFileName = image['image-path']
        const imageFullPath = `../${imageBasePath}/${imageFileName}`

        imagesList += `
          <img src="${imageFullPath}" class="img-fluid event-list-img inside-modal" alt="foto de evento">
        `
      }
  )


  eventModalBody.innerHTML = `
    <div class="container-fluid">
      <div class="row">
        <h4 class="mb-3">¿Dónde?</h4>
        <p><span class="fw-bold">Región:</span>${region}</p>
        <p><span class="fw-bold">Comuna:</span>${comuna}</p>
        <p><span class="fw-bold">Sector:</span>${sector}</p>
  
        <hr>
  
        <h4 class="mb-3">¿Quién Ofrece?</h4>
        <p><span class="fw-bold">Nombre:</span>${name}</p>
        <p><span class="fw-bold">Email:</span>${email}</p>
        <p><span class="fw-bold">Celular:</span>${celular}</p>
        <p><span class="fw-bold">Redes Sociales:</span>
        
        <ul>
          ${socialNetworksList}
        </ul>
  
        <hr>
  
        <h4 class="mb-3">¿Cuándo y qué se ofrece?</h4>
        <p><span class="fw-bold">Día y hora de inicio:</span>${startDate}</p>
        <p><span class="fw-bold">Día y hora de término:</span>${endDate}</p>
        <p><span class="fw-bold">Descripción:</span>${description}</p>
        <p><span class="fw-bold">Tipo:</span>${foodType}</p>
        
        <hr>
        
        <h4 class="mb-3">Imágenes</h4>
        <div class="col mx-auto">
          ${imagesList}
        </div>  
      </div>
    </div>
  `

  eventModal.show()
}


const showPage = (pages, pageNumber) => {
  let tableContent = ''
  pages[pageNumber].forEach(
      (eventData, idx) => {
        const
            startDate = eventData['dia-hora-inicio'],
            endDate = eventData['dia-hora-termino'],
            comuna = eventData['comuna'],
            sector = eventData['sector'],
            foodType = eventData['tipo-comida'],
            description = eventData['descripcion-evento'],
            images = eventData['foto-comida'],
            name = eventData['nombre']

        const
            imageBasePath = images[0]['basepath'],
            imageFileName = images[0]['image-path']
        const imageFullPath = `../${imageBasePath}/${imageFileName}`

        tableContent += `
          <tr class="align-middle" id="row-${idx}">
            <td>${startDate}</td>
            <td>${endDate}</td>
            <td>${comuna}</td>
            <td>${sector}</td>
            <td>${foodType}: <br>${description}</td>
            <td>${name}</td>
            <td>
              <img src="${imageFullPath}" class="img-fluid portrait-img" alt="empanadas">
            </td>
          </tr>
        `
      }
  )

  tableBody.innerHTML = tableContent
}