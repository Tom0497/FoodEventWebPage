import {getLastEvents, queryId} from "../utils.js"

/**
 * Page base URL to construct absolute paths.
 * @type {string}
 */
const baseURL = window.location.origin

/**
 * Div element representing body of a table.
 * @type {HTMLElement}
 */
let tableBody = queryId('table-body')


/**
 * Display portrait table fetching most current data.
 * <br>
 * @return {Promise<boolean>} - Flag to indicate correct execution.
 */
const showPortrait = async () => {
  const  // fetch last five events reported
      {count: eventCount, data: lastEvents} = await getLastEvents(5)
  console.log({eventCount, lastEvents})

  lastEvents.forEach(  //  display each event inside a table
      (eventData) => addEventToTable(eventData)
  )
  return true
}


/**
 * Display event data in a table row.
 * <br>
 * @param eventData{Object} - Object containing data from an event.
 */
const addEventToTable = (eventData) => {
  const {  // destructure event data
    'dia-hora-inicio': startDate,
    'dia-hora-termino': endDate,
    'comuna': comuna,
    'sector': sector,
    'tipo-comida': foodType,
    'descripcion-evento': description,
    'foto-comida': images
  } = eventData

  const {  // destructure first image data
    'basepath': imageBasePath,
    'image-path': imageFileName
  } = images[0]

  const imageFullPath = `${baseURL}/${imageBasePath}/${imageFileName}`  // first image full path

  // add row to table html element
  tableBody.innerHTML += `  
    <tr class="align-middle">
      <td>${startDate}</td>
      <td>${endDate}</td>
      <td>${comuna}</td>
      <td>${sector}</td>
      <td>${foodType}: <br>${description}</td>
      <td>
        <img src="${imageFullPath}" class="img-fluid portrait-img" alt="imagen del evento">
      </td>
    </tr>
  `
}


/**
 * Call async function that controls portrait.
 */
showPortrait().then()
