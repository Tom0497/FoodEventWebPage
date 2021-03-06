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
} from "../utils.js"
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
 * Modals used for confirmation and success messages when submitting form.
 */
let [confirmationModal, successModal] = getFormModals()

/**
 * Button to confirm data submitting.
 * @type {HTMLElement|InputFields|HTMLFormElement}
 */
let sendButton = queryId('send-confirm-btn')

/**
 * Query every single input field from document form.
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
 * Query image input list.
 * @type {NodeListOf<HTMLElement|InputFields>}
 */
let eventImages = queryName('foto-comida')

/**
 * Query social networks input list.
 * @type {NodeListOf<HTMLElement|InputFields>}
 */
let contactSocialNetworks = queryName('red-social')


/**
 * Control form input and form submitting to server.
 * <br>
 * @return {Promise<void>}
 */
const handleForm = async () => {
  const  // fetch data from server to construct selects
      [[validRegions, validComunas],
        validFoodTypes,
        socialNetworks] = await Promise.all([getRegionsAndComunas(), getFoodTypes(), getSocialNetworks()])

  regionAndComunasSelect(validRegions, validComunas)  // display regions and comunas options
  socialNetworkSelect(socialNetworks)  // social networks options and control
  foodTypesSelect(validFoodTypes)  // display food types options
  defaultDates(eventOpenDate, eventCloseDate)  // pre-fill datetime fields with default values
  activateInstantInputValidation(validRegions, validComunas, validFoodTypes)  // activate instant single input validation

  /**
   * Form validity client-side and server-side.
   * @type {boolean}
   */
  let isFormValid = false

  /**
   * Listener to validate form client-side before submitting to server.
   */
  eventForm.addEventListener('submit', (event) => {

    event.preventDefault()  // prevent the form from automatically submitting
    isFormValid = validateForm(validRegions, validComunas, validFoodTypes)  // validate every input client-side

    if (isFormValid) confirmationModal.show()  // submit to the server if the form is client-side valid
  })

  /**
   * Listener to submit form to server and handle its response.
   */
  sendButton.addEventListener('click', (_) => {
    if (isFormValid)  // submit form to server only if is valid client-side
      handleSubmitForm(eventForm).then(
          response => isFormValid = response  // check form validity server-side
      )
  })
}


/**
 * Perform form submit to server and handle its response.
 * <br>
 * @param eventForm{HTMLFormElement} - element containing form data.
 * @return {Promise<boolean>} - whether server validated and saved data submitted.
 */
const handleSubmitForm = async (eventForm) => {
  const [serverOK, response] = await submitForm(eventForm)
  const serverValid = handleServerResponse(response)

  if (!serverValid) {
    confirmationModal.hide()
    return false
  }
  while (!serverOK)
    [serverOK, _] = await submitForm(eventForm)

  successModal.show()
  return true
}


/**
 * Validate client-side form and its user input before submitting to server.
 * <br>
 * @param {Array<string>} validRegions - possible values for eventRegion select.
 * @param {Array<Array<string>>} validComunas - possible values for eventComuna select.
 * @param {Array<string>} validFoodTypes - valid food types inputs.
 * @return {boolean} - whether form is valid client-side.
 */
const validateForm = (validRegions, validComunas, validFoodTypes) => {
  // validate every input
  const
      isRegionValid = checkRegion(eventRegion, validRegions),
      isComunaValid = checkComuna(eventComuna, eventRegion, validComunas, validRegions),
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
 * Handle response from server to POST form data.
 * <br>
 * @param serverResponse{Object} - JSON containing server response by input field.
 * @return {boolean} - whether server determined submitted data valid.
 */
const handleServerResponse = (serverResponse) => {
  let serverValid = true

  console.log('Data submitted to server')
  console.log(serverResponse)

  // visit every single input element of response from server
  Object.entries(serverResponse).forEach(
      ([elementName, [valid, message]]) => {
        if (!['foto-comida', 'red-social'].includes(elementName)) {
          let element = queryId(elementName)

          if (!valid) showError(element, message)
          else showSuccess(element)

          serverValid &&= valid
        }
      }
  )

  // handle response for images submitted
  const [imagesValid, imageResponses] = serverResponse['foto-comida']
  imageResponses.forEach(
      ([imageValid, message], idx) => {
        if (!imageValid) showError(eventImages[idx], message)
        else showSuccess(eventImages[idx])
      }
  )
  serverValid &&= imagesValid

  // handle response for social networks submitted
  const [socialNetworksValid, socialNetworksResponses] = serverResponse['red-social']
  socialNetworksResponses.forEach(
      ([socialNetworkValid, message], idx) => {
        if (!socialNetworkValid) showError(contactSocialNetworks[idx], message)
        else showSuccess(contactSocialNetworks[idx])
      }
  )
  serverValid &&= socialNetworksValid

  return serverValid
}


/**
 * Validate user input as it's being typed within input element.
 * <br>
 * @param {Array<string>} validRegions - possible values for eventRegion select.
 * @param {Array<Array<string>>} validComunas - possible values for eventComuna select.
 * @param {Array<string>} validFoodTypes - valid food types inputs.
 */
const activateInstantInputValidation = (validRegions, validComunas, validFoodTypes) => {
  eventForm.addEventListener('input', debounce((event) => {
    // switch between input fields based on their name
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


/**
 * Call async function that controls form.
 */
handleForm().then()
