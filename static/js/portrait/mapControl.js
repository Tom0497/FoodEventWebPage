import {getComunasXY, getEventsOfComuna, getImageCountPerComuna, queryId, stringAreSimilar} from "../utils.js"

/**
 * Page base URL to construct absolute paths.
 * @type {string}
 */
const baseURL = window.location.origin

/**
 * Events list page URL.
 * @type {string}
 */
const eventPageURL = `${baseURL}/templates/eventList.html`

/**
 * HTMLDiv require by leaflet to display map.
 * @type {HTMLElement|InputFields|HTMLFormElement}
 */
let mapDiv = queryId('map')
mapDiv.style.height = '400px'  // set mapDiv height in order to be displayed


/**
 *
 * @return {Promise<void>}
 */
const mapControl = async () => {
  const [comunasCoordinates, imagesPerComuna] = await Promise.all([getComunasXY(), getImageCountPerComuna()])
  console.log({imagesPerComuna})

  let map = createMap(mapDiv)
  let markers = createMarkers(map, comunasCoordinates, imagesPerComuna)

  console.log({markers})
}


/**
 * Create and add markers to map.
 * <br>
 * For every comuna where at least one event has been reported, a marker is created and added
 * with a title reporting comuna name and total number of images for all comuna events.
 * <br>
 * @param map - Leaflet map where markers will be added.
 * @param comunasCoordinates{Array<Object>} - Array of coordinates for Chile's comunas.
 * @param imagesPerComuna{Array<Array<string, number>>} - Array of tuple with comuna and number of images.
 * @return {*[]} - List of markers created per comuna.
 */
const createMarkers = (map, comunasCoordinates, imagesPerComuna) => {
  let markers = []  // markers array
  imagesPerComuna.forEach(
      ([comunaName, imageCount]) => {
        const {lng, lat} = comunasCoordinates.find(comunaXY => stringAreSimilar(comunaName, comunaXY.name))
        const imageWord = (imageCount > 1) ? 'imágenes' : 'imagen'
        const markerTitle = `${comunaName}: ${imageCount} ${imageWord}`

        markers.push(  // save markers
            L.marker([lat, lng], {
              title: markerTitle,
              riseOnHover: true,
              comuna: comunaName
            }).addTo(map).on('click', handleMarkerClick)
        )
      }
  )

  return markers
}


/**
 * Callback function that handles click in map marker.
 * <br>
 * @param e{Event} - Event that triggered handler.
 */
const handleMarkerClick = async (e) => {
  let marker = e.target  // marker object that triggered event
  const markerComuna = marker.options.comuna  // comuna represented by marker

  const {data: events} = await getEventsOfComuna(markerComuna)  // fetch events data from comuna
  const popUpInnerHTML = constructPopOpInnerHTML(events)  // construct popup innerhtml

  // construct popup, bind it to marker and open it
  marker.bindPopup(popUpInnerHTML, {
    maxWidth: 400,
    maxHeight: 300,
    keepInView: true
  }).openPopup()
}


/**
 * Construct PopUp innerHTML from an array of events data.
 * <br>
 * @param eventsData{Array<Object>} - data of events in a given comuna.
 * @return {string} - innerHTML to be added as a PopUp content.
 */
const constructPopOpInnerHTML = (eventsData) => {
  let popUpInnerHTML = ''
  eventsData.forEach(
      (event, idx) => {
        const {  // destructure event data
          'event-id': eventId,
          'dia-hora-inicio': startDate,
          'sector': sector,
          'comuna': comuna,
          'tipo-comida': foodType,
          'foto-comida': images
        } = event

        popUpInnerHTML += `
          <div class="card border-primary m-3 lead">
            <div class="card-header fw-bold">${comuna} - ${idx + 1}</div>
            <div class="card-body">
        `  // every event is a card, comuna as title, number as a lookup identifier

        images.forEach(  // every image from event is displayed with maximum width fixed
            (image) => {
              const
                  imageBasePath = image['basepath'],
                  imageFileName = image['image-path']
              const imageFullPath = `${baseURL}/${imageBasePath}/${imageFileName}`

              popUpInnerHTML += `
                <img src="${imageFullPath}" class="img-fluid" alt="foto de evento">
              `
            }
        )

        popUpInnerHTML += `
            </div>
            <ul class="list-group list-group-flush p-3">
              <li class="list-group-item"><span class="fw-bold">Sector</span><br> ${sector}</li>
              <li class="list-group-item"><span class="fw-bold">Tipo de comida</span><br> ${foodType}</li>
              <li class="list-group-item"><span class="fw-bold">Dia y hora de inicio</span><br> ${startDate}</li>
            </ul>
            <a class="btn btn-success" target="_blank" href="${eventPageURL}?event-id=${eventId}">
              <span class="text-white fw-bold">Ver Evento</span>
            </a>
          </div>
        `  // food type, sector and open date complete card body, also a link to full event visualization
      }
  )

  return popUpInnerHTML
}


/**
 * Create leaflet map using a HTMLDiv as a container.
 * <br>
 * @param mapDiv{HTMLElement} - Div where leaflet map is displayed.
 * @return {*} - Leaflet map object.
 */
const createMap = (mapDiv) => {
  // create map centered in Santiago de Chile
  let map = L.map(mapDiv).setView([-33.4500000, -70.6666667], 4)
  // use street type of map
  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZW5nMW5lZXJ0cnNhIiwiYSI6ImNrem93bHdyaDA1N3YycG9hcHBtMTNiZHMifQ.ipX_Agw92oFO_lYkzNJtvw'
  }).addTo(map)

  return map
}


/**
 * Call async function that controls map.
 */
mapControl().then()
