/**
 * formControl.js:
 *    form validation for event form, as a first check on user input before sending to
 *    server for server-validation and database update.
 */
import {debounce, defaultDates, getFoodTypes, getRegionsAndComunas, queryId, queryName} from "./utils.js"
import {regionAndComunasSelect} from "./regionSelector.js"
import {foodTypesSelect} from "./foodType.js"
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
import {checkImages} from "./imageControl.js";


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
let
    eventImages = queryName('foto-comida')


Promise.all([getRegionsAndComunas(), getFoodTypes()]).then(response => {
  let
      [[validRegions,
        validComunas],
        validFoodTypes] = response

  // display regions and comunas options
  regionAndComunasSelect(validRegions, validComunas)
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
    const isFormValid = validateForm(validRegions, validComunas, validFoodTypes)

    // submit to the server if the form is valid
    if (isFormValid) {
      eventForm.submit()
    }
  })
})


const validateForm = (validRegions, validComunas, validFoodTypes) => {
  // validate form inputs
  const
      isRegionValid = checkRegion(eventRegion, validRegions)

  const isComunaValid = isRegionValid ? checkComuna(eventComuna, eventRegion, validComunas) : false

  const
      isSectorValid = checkSector(eventSector),
      isNameValid = checkName(contactName),
      isEmailValid = checkEmail(contactEmail),
      isPhoneValid = checkPhone(contactPhone),
      isOpenDateValid = checkOpenDate(eventOpenDate),
      isEndDateValid = checkEndDate(eventCloseDate, eventOpenDate),
      isDescriptionValid = checkDescription(eventDescription),
      isFoodTypeValid = checkFoodType(eventFoodType, validFoodTypes),
      areImagesValid = checkImages(eventImages)

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
      areImagesValid
}


const activateInstantInputValidation = (validRegions, validComunas, validFoodTypes) => {
  eventForm.addEventListener('input', debounce((event) => {
    switch (event.target.id) {
      case 'region':
        checkRegion(eventRegion, validRegions)
        break
      case 'comuna':
        checkComuna(eventComuna, eventRegion, validComunas)
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
        checkEndDate(eventCloseDate, eventOpenDate)
        break
      case 'descripcion-evento':
        checkDescription(eventDescription)
        break
      case 'tipo-comida':
        checkFoodType(eventFoodType, validFoodTypes)
        break
    }
  }))
}