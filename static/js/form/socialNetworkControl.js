import {queryId, capitalizeString} from "../utils.js"
import {isRequired, showError, showSuccess} from "./checkUtils.js";

/**
 * Elements that dynamically change when certain events are triggered
 *    snSelect   --> button that adds one more input field for images
 *    snDiv      --> space where a warning message is displayed when maximum image count is reached
 * @type {HTMLElement|InputFields|HTMLFormElement}
 */
let snSelect = queryId('red-social-select'),
    snDiv = queryId('redes-sociales')

/**
 * array to store social networks input fields already displayed
 * @type {string[]}
 */
let snAddedInputs = []

/**
 * class of close button for social network input field
 * @type {string}
 */
const btnCloseClass = 'btn-close-sn'

/**
 * Create a selector of social networks from an array, then
 * create input field for URL or ID of selected social network.
 * <br>
 * @param socialNetworks{Array<string>} - list of valid social networks
 */
export const socialNetworkSelect = (socialNetworks) => {
  // default display value of sn selector
  let snOptions = '<option selected hidden value="">¿Tienes redes sociales?</option>\n';

  // load all sn available from JSON file and add them to "snOptions"
  socialNetworks.forEach(
      (socialNetworkName) => {
        const optionName = capitalizeString(socialNetworkName)
        snOptions += `<option value="${socialNetworkName}">${optionName}</option>`
      }
  )

  // then add all sn options to innerHTML of SN select
  snSelect.innerHTML = snOptions

  /**
   * listener that handles the insertion of input group for sn into document form
   */
  snSelect.addEventListener('change', (_) => {
    // starting from sn id other parameters necessary for input group creation are determined
    const snSelected = snSelect.value
    const snName = snSelected.charAt(0).toUpperCase() + snSelected.slice(1)
    const snAddonId = `${snSelected}-addon`
    const snInputId = `${snSelected}-input`

    // element is added only if it hasn't already
    if (!snAddedInputs.includes(snInputId)) {
      let newSnDiv = document.createElement('div')

      newSnDiv.className = "input-group my-1"
      newSnDiv.id = `${snInputId}`
      newSnDiv.innerHTML = `
          <span class="input-group-text" id="${snAddonId}">${snName}</span>
          <input type="text" class="form-control" placeholder="URL" aria-label="Username"
                 aria-describedby="${snAddonId}" name="red-social" id="${snSelected}" value="https://">
          <span class="input-group-text">
            <button type="button" class="btn-close ${btnCloseClass}" aria-label="Close"></button>
          </span>
          <small class="invalid-feedback"></small>`

      snDiv.appendChild(newSnDiv)
      snAddedInputs.push(snInputId)
    }
    snSelect.value = ""
  })

  /**
   * listener that handles deletion of input elements when close button is clicked
   */
  snDiv.addEventListener('click', (event) => {
    // element that triggered the event and its classList
    let targetElement = event.target
    let targetElementClasses = targetElement.classList

    // proceed only if "targetElement" is an element which contains "btnCloseClass" within its classList
    if (targetElementClasses.contains(btnCloseClass)) {
      // by design is known that parent element of input group is 2 levels up the document tree
      const inputGroup = targetElement.parentElement.parentElement
      const inputGroupId = inputGroup.id
      const inputGroupIdIdx = snAddedInputs.indexOf(inputGroupId)

      // id must be deleted from added input group array
      snAddedInputs.splice(inputGroupIdIdx, 1)

      // the element is removed from DOM tree and element count is updated
      inputGroup.remove()
    }
  })
}

/**
 * Check social networks URLs or IDs given as input from user.
 * <br>
 * @param socialNetworksInputList{NodeListOf<HTMLInputElement>} - list of inputs for every social network
 * @returns {boolean} - if URLs or IDs are valid
 */
export const checkSocialNetworks = (socialNetworksInputList) => {
  let valid = true

  socialNetworksInputList.forEach((socialNetwork) => {
    valid &&= checkSocialNetwork(socialNetwork)
  })
  return valid
}

/**
 * Check if user input is a valid social network URL.
 * <br>
 * @param socialNetworkInput{HTMLInputElement} - input element with user input
 */
const checkSocialNetwork = (socialNetworkInput) => {
  let valid = false
  const [socialNetwork, socialNetworkLink] = discoverSocialNetwork(socialNetworkInput)
  const
      socialNetworkValue = socialNetworkInput.value,
      [validURL, message] = parseAndCheckURL(socialNetworkValue, socialNetworkLink)

  console.log(`${socialNetwork}: ${socialNetworkValue}`)

  if (!isRequired(socialNetworkValue)) {
    showError(socialNetworkInput, 'Debe ingresar una URL.')
  } else if(!validURL) {
    showError(socialNetworkInput, message)
  } else {
    showSuccess(socialNetworkInput)
    valid = true
  }
  return valid
}

/**
 * Check if a string is a valid HTTP URL that contains a specific pathname.
 * <br>
 * @param urlString{string} - URL as a string to be checked.
 * @param basePath{string} - string expected to be in pathname of URL.
 * @return {[boolean,string]} - whether URl is valid.
 */
const parseAndCheckURL = (urlString, basePath) => {
  let valid = false,
      message = ''

  try {
    // try to construct URL object
    const url = new URL(urlString)

    // check hypertext protocol, base url, user path
    const
        protocolValid = ['https:', 'http:'].includes(url.protocol),
        basePathValid = basePath !== 'otra' ? url.hostname.includes(basePath) : true,
        userValid = !['/', ''].includes(url.pathname)

    // messages according to error
    if (!protocolValid) message = 'URL debe comenzar con https:// o http://'
    else if (!basePathValid) message = 'URL no se corresponde con la red social seleccionada'
    else if (!userValid) message = `URL no contiene path (https://www.${basePath}.com/path)`

    valid = protocolValid && basePathValid && userValid
  } catch (error) {
    // URL object couldn't be constructed
    console.log(error)
    message = `URL proporcionada no es válida (Ejemplo: https://www.${basePath}.com/user1234).`
  }

  return [valid, message]
}


/**
 * Given an HTML input element determine which social network was expected.
 * <br>
 * @param socialNetworkInput{HTMLInputElement} - input element with user input
 */
const discoverSocialNetwork = (socialNetworkInput) => {
  const socialNetwork = socialNetworkInput.id
  const socialNetworkLink = `${socialNetwork}.com`

  return [socialNetwork, socialNetworkLink]
}