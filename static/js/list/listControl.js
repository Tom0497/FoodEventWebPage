import {capitalizeString, getEventById, getEvents, queryId} from "../utils.js"

/**
 * Page base URL to construct absolute paths.
 * @type {string}
 */
const baseURL = window.location.origin

/**
 * Table rows per page, events per table page.
 * @type {number}
 */
const eventsPerPage = 5

/**
 * Query elements to show events, event modals and image modals.
 * @type {HTMLElement|InputFields|HTMLFormElement}
 */
let tableBody = queryId('table-body'),
    pagination = queryId('pagination'),
    eventModalDiv = queryId('show-event'),
    eventModalBody = queryId('show-event-body'),
    singleImageModalDiv = queryId('single-image'),
    singleImageModalBodyDiv = queryId('single-image-body')

/**
 * Bootstrap modals for single event and single image display.
 * @type {Pe}
 */
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


/**
 * Control event data modal display when called by URL param with ID.
 * <br>
 * @return {Promise<void>}
 */
const handleURLParams = async () => {
  const urlParams = new URLSearchParams(window.location.search)
  const eventId = parseInt(urlParams.get('event-id'))

  console.log({eventId})
  if (!eventId || isNaN(eventId)) return

  const {data: eventData} = await getEventById(eventId)
  if (!eventData) return

  showEventModal(eventData[0])
}


/**
 * Control event table, pagination and modals display.
 * @return {Promise<void>}
 */
const controlEventTable = async () => {
  let currentEvents
  const {count: eventCount, data: events} = await getEvents(eventsPerPage, 0)  // fetch events
  console.log({eventCount, events})
  currentEvents = events

  const pageCount = Math.ceil(eventCount / eventsPerPage)  // number of page for table
  for (let pageNumber = 0; pageNumber < pageCount; pageNumber++) {
    pagination.innerHTML += `
      <li class="page-item"><a class="page-link" type="button">${pageNumber + 1}</a></li>
    `
  }

  if (pageCount === 0) return  // if no events in db end script

  let currentPage = 0  // start at first page in table
  showPage(events)

  /**
   * Listener for clicks to change page.
   */
  pagination.addEventListener('click', (e) => {
    e.preventDefault()
    const element = e.target
    const elementClassList = element.classList

    if (!elementClassList.contains('page-link')) return

    const selectedPage = parseInt(element.innerText) - 1
    if (selectedPage === currentPage) return

    // if selected page is different from current, fetch data
    getEvents(eventsPerPage, eventsPerPage * selectedPage)
        .then(
            response => {
              const {count: eventCount, data: events} = response
              console.log({eventCount, events})
              currentEvents = events
              showPage(currentEvents)
              currentPage = selectedPage
            }
        )
  })

  /**
   * Listener for click on table row to activate single event modal display.
   */
  tableBody.addEventListener('click', (e) => {
    e.preventDefault()
    const element = e.target
    const elementTag = element.tagName

    if (elementTag !== 'TD') return

    let rowElement = element.parentElement
    const selectedEventIdx = parseInt(rowElement.id.replace('row-', ''))
    console.log({currentPage, selectedEventIdx})
    showEventModal(currentEvents[selectedEventIdx])
  })

  /**
   * Listener for click on image to active single image modal display.
   */
  eventModalBody.addEventListener('click', (e) => {
    const element = e.target
    const elementTag = element.tagName
    const elementClassList = element.classList

    if (elementTag !== 'IMG') return
    if (!elementClassList.contains('inside-modal')) return

    showImageModal(element)
  })
}


/**
 * Show single image modal when event image is clicked.
 * <br>
 * @param imageElement{HTMLImageElement} - Element of image clicked.
 */
const showImageModal = (imageElement) => {
  const imageSrc = imageElement.src  // path to image
  singleImageModalBodyDiv.innerHTML = `
    <img src="${imageSrc}" class="mx-auto img-fluid" alt="foto de evento">
  `
  singleImageModal.show()
}


/**
 * Display event modal given event data.
 * <br>
 * @param eventData{Object} - event data fetched from server.
 */
const showEventModal = (eventData) => {
  const  // destructure event data
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

  // construct list with informed social networks
  let socialNetworksList = ''
  socialNetworks.forEach(
      (socialNetwork) => {
        const
            socialNetworkName = capitalizeString(socialNetwork['social-network']),
            socialNetworkURL = socialNetwork['url']

        socialNetworksList += `
          <li>${socialNetworkName}: <a href="${socialNetworkURL}" target="_blank">${socialNetworkURL}</a></li>
        `
      }
  )

  // construct list with event images
  let imagesList = ''
  images.forEach(
      (image) => {
        const
            imageBasePath = image['basepath'],
            imageFileName = image['image-path']
        const imageFullPath = `${baseURL}/${imageBasePath}/${imageFileName}`

        imagesList += `
          <img src="${imageFullPath}" class="my-3 img-fluid event-list-img inside-modal" alt="foto de evento">
        `
      }
  )

  // add all event information into event modal
  eventModalBody.innerHTML = `
    <div class="container-fluid">
      <div class="row">
        <h4 class="mb-3">¿Dónde?</h4>
        <p><span class="fw-bold">Región: </span>${region}</p>
        <p><span class="fw-bold">Comuna: </span>${comuna}</p>
        <p><span class="fw-bold">Sector: </span>${sector}</p>
  
        <hr>
  
        <h4 class="mb-3">¿Quién Ofrece?</h4>
        <p><span class="fw-bold">Nombre: </span>${name}</p>
        <p><span class="fw-bold">Email: </span>${email}</p>
        <p><span class="fw-bold">Celular: </span>${celular}</p>
        <p><span class="fw-bold">Redes Sociales: </span>
        
        <ul>
          ${socialNetworksList}
        </ul>
  
        <hr>
  
        <h4 class="mb-3">¿Cuándo y qué se ofrece?</h4>
        <p><span class="fw-bold">Día y hora de inicio: </span>${startDate}</p>
        <p><span class="fw-bold">Día y hora de término: </span>${endDate}</p>
        <p><span class="fw-bold">Descripción: </span>${description}</p>
        <p><span class="fw-bold">Tipo: </span>${foodType}</p>
        
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


/**
 * Display table with fetched events from server.
 * <br>
 * @param events{Array<Object>}
 */
const showPage = (events) => {
  let tableContent = ''
  events.forEach(
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
        const imageFullPath = `${baseURL}/${imageBasePath}/${imageFileName}`

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


/**
 * Call async function that handle event call by url param.
 */
handleURLParams().then()


/**
 * Call async function that controls event list.
 */
controlEventTable().then()
