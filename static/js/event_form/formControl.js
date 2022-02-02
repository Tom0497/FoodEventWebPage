/**
 * formControl.js:
 *    form validation for event form, as a first check on user input before sending to
 *    server for server-validation and database update.
 */

import {
  debounce,
  defaultDates,
  getFoodTypes,
  getFormModals,
  getRegionsAndComunas,
  getSocialNetworks,
  queryId,
  queryName,
  submitForm
} from "./utils.js"
import {regionAndComunasSelect} from "./regionSelector.js"
import {foodTypesSelect} from "./foodTypeSelector.js"
import {
  checkComuna,
  checkDescription,
  checkEmail,
  checkEndDate,
  checkFoodType,
  checkName,
  checkOpenDate,
  checkPhone,
  checkRegion,
  checkSector
} from "./inputCheck.js"
import "./imageControl.js"
import {checkImages} from "./imageControl.js"
import {checkSocialNetworks, socialNetworkSelect} from "./socialNetworkControl.js"
import {showError, showSuccess} from "./checkUtils.js";

/**
 * Modals used or confirmation and success messages when submitting form.
 */
let [confirmationModal, successModal] = getFormModals()

/**
 * Button to confirm data submitting
 * @type {HTMLElement|InputFields|HTMLFormElement}
 */
let sendButton = queryId('send-confirm-btn')

/**
 * Query every single input field from document form
 * @type {HTMLElement|InputFields|HTMLFormElement}
 */
let eventForm = queryId('formulario'),
    eventRegion = queryId('region'),
    eventComuna = queryId('comuna'),
    eventSector = queryId('sector'),
    contactName = queryId('nombre'),
    contactEmail = queryId('email'),
    contactPhone = queryId('celular'),
    eventOpenDate = queryId('dia-hora-inicio'),
    eventCloseDate = queryId('dia-hora-termino'),
    eventDescription = queryId('descripcion-evento'),
    eventFoodType = queryId('tipo-comida')

/**
 * Query image input list
 * @type {NodeListOf<HTMLElement|InputFields>}
 */
let eventImages = queryName('foto-comida')

/**
 * Query social networks input list
 * @type {NodeListOf<HTMLElement|InputFields>}
 */
let contactSocialNetworks = queryName('red-social')


Promise.all([getRegionsAndComunas(), getFoodTypes(), getSocialNetworks()]).then(response => {
  let
      [[validRegions,
        validComunas],
        validFoodTypes,
        socialNetworks] = response

  // display regions and comunas options
  regionAndComunasSelect(validRegions, validComunas)
  // social networks options and control
  socialNetworkSelect(socialNetworks)
  // display food types options
  foodTypesSelect(validFoodTypes)
  // pre-fill datetime fields with default values
  defaultDates(eventOpenDate, eventCloseDate)
  // activate instant single input validation
  activateInstantInputValidation(validRegions, validComunas, validFoodTypes)

  // validate form before submittting
  eventForm.addEventListener('submit', (event) => {
    // prevent the form from submitting
    event.preventDefault();

    // validate every input
    // const isFormValid = validateForm(validRegions, validComunas, validFoodTypes)
    const isFormValid = true

    // submit to the server if the form is valid
    if (isFormValid) {
      confirmationModal.show()

      sendButton.addEventListener('click', (_) => {
        let serverValid = true

        submitForm(eventForm).then(
            response => serverValid = handleServerResponse(response)
        ).then(_ => {
          confirmationModal.hide()
          if (serverValid) {
            successModal.show()
          }
        })
      })
    }
  })
})


const validateForm = (validRegions, validComunas, validFoodTypes) => {
  // validate region
  const isRegionValid = checkRegion(eventRegion, validRegions)
  // validate comuna only if region is valid
  const isComunaValid = isRegionValid ? checkComuna(eventComuna, eventRegion, validComunas, validRegions) : false

  // all other inputs are mutually independent
  const
      isSectorValid = checkSector(eventSector),
      isNameValid = checkName(contactName),
      isEmailValid = checkEmail(contactEmail),
      isPhoneValid = checkPhone(contactPhone),
      isOpenDateValid = checkOpenDate(eventOpenDate),
      isEndDateValid = checkEndDate(eventCloseDate, eventOpenDate),
      isDescriptionValid = checkDescription(eventDescription),
      isFoodTypeValid = checkFoodType(eventFoodType, validFoodTypes),
      areImagesValid = checkImages(eventImages),
      areSocialNetworksValid = checkSocialNetworks(contactSocialNetworks)

  // valid form only if all inputs are valid
  return isRegionValid &&
      isComunaValid &&
      isSectorValid &&
      isNameValid &&
      isEmailValid &&
      isPhoneValid &&
      isOpenDateValid &&
      isEndDateValid &&
      isDescriptionValid &&
      isFoodTypeValid &&
      areImagesValid &&
      areSocialNetworksValid
}


/**
 *
 * @param serverResponse{Object}
 * @return {boolean}
 */
const handleServerResponse = (serverResponse) => {
  let serverValid = true

  console.log('Data submitted to server')
  console.log(serverResponse)

  Object.entries(serverResponse).forEach(
      ([elementName, [valid, comment]]) => {
        let element = queryId(elementName)
        if (!valid) {
          showError(element, comment)
        } else {
          showSuccess(element)
        }
        serverValid &&= valid
      }
  )

  return serverValid
}


const activateInstantInputValidation = (validRegions, validComunas, validFoodTypes) => {
  eventForm.addEventListener('input', debounce((event) => {
    // switch between single input fields
    switch (event.target.name) {
      case 'region':
        checkRegion(eventRegion, validRegions)
        checkComuna(eventComuna, eventRegion, validComunas, validRegions)
        break
      case 'comuna':
        checkComuna(eventComuna, eventRegion, validComunas, validRegions)
        break
      case 'sector':
        checkSector(eventSector)
        break
      case 'nombre':
        checkName(contactName)
        break
      case 'email':
        checkEmail(contactEmail)
        break
      case 'celular':
        checkPhone(contactPhone)
        break
      case 'dia-hora-inicio':
        checkOpenDate(eventOpenDate)
        break
      case 'dia-hora-termino':
        checkOpenDate(eventOpenDate)
        checkEndDate(eventCloseDate, eventOpenDate)
        break
      case 'descripcion-evento':
        checkDescription(eventDescription)
        break
      case 'tipo-comida':
        checkFoodType(eventFoodType, validFoodTypes)
        break
      case 'red-social':
        checkSocialNetworks(contactSocialNetworks)
        break
      case 'foto-comida':
        checkImages(eventImages)
        break
    }
  }))
}