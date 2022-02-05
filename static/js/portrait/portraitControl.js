import {getLastEvents, queryId} from "./utils.js"

let tableBody = queryId('table-body')


getLastEvents().then(response => {
  const lastEvents = response
  console.log({lastEvents})

  lastEvents.forEach(
      (eventData) => {
        const
            startDate = eventData['dia-hora-inicio'],
            endDate = eventData['dia-hora-termino'],
            comuna = eventData['comuna'],
            sector = eventData['sector'],
            foodType = eventData['tipo-comida'],
            description = eventData['descripcion-evento'],
            images = eventData['foto-comida']

        const
            imageBasePath = images[0]['basepath'],
            imageFileName = images[0]['image-path']
        const imageFullPath = `../${imageBasePath}/${imageFileName}`

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
  )
})