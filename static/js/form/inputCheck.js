import {
  areDatesOrdered,
  isBetween,
  isCelValid,
  isDateValid,
  isEmailValid,
  isRequired,
  showError,
  showSuccess
} from "./checkUtils.js"


/**
 * Checks if the value of region selected is valid, if not, a message is displayed to user
 * in order to fix mistake and get a valid input.
 * <br>
 * @param {HTMLSelectElement} eventRegion - select element from a form
 * @param {Array} validRegions - possible values for eventRegion select
 * @returns {boolean} - true if selected value is valid
 */
export const checkRegion = (eventRegion, validRegions) => {
  let valid = false
  const region = eventRegion.value
  console.log('region:', region)

  if (!isRequired(region)) {
    showError(eventRegion, 'Debe seleccionar una región.')
  } else if (!validRegions.includes(region)) {
    showError(eventRegion, 'La región seleccionada no es una opción válida.')
  } else {
    showSuccess(eventRegion)
    valid = true
  }
  return valid
}


/**
 * Checks if the value of comuna selected is valid, if not, a message is displayed to user
 * in order to fix mistake and get a valid input.
 * <br>
 * A selected valid region must be known prior to this check in order to select adequate comunas
 * array from array of all Chile comunas.
 * <br>
 * @param {HTMLSelectElement} eventComuna - select element from a form
 * @param {HTMLSelectElement} eventRegion - select element from a form
 * @param {Array<Array<string>>} validComunas - possible values for eventComuna select
 * @param {Array<string>} validRegions - possible values for eventRegion select
 * @returns {boolean} - true if selected value is valid
 */
export const checkComuna = (eventComuna,
                            eventRegion,
                            validComunas,
                            validRegions) => {
  let valid = false
  const
      region = eventRegion.value,
      comuna = eventComuna.value
  console.log('comuna:', comuna)

  if (!isRequired(comuna)) {
    showError(eventComuna, 'Debe seleccionar una comuna.')
  } else if (!checkRegion(eventRegion, validRegions)) {
    showError(eventComuna, 'Chequear región.')
  } else if (!validComunas[validRegions.indexOf(region)].includes(comuna)) {
    showError(eventComuna, 'La comuna seleccionada no es una opción válida.')
  } else {
    showSuccess(eventComuna)
    valid = true
  }
  return valid
}


/**
 * Checks if sector description is valid, as an optional value its only restriction
 * is its length, which must not surpass 100 characters.
 * <br>
 * @param {HTMLInputElement} eventSector - input element from a form
 * @returns {boolean} - true if input text is valid
 */
export const checkSector = (eventSector) => {
  let valid = false
  const
      sector = eventSector.value,
      minLen = 0,
      maxLen = 100
  console.log('sector:', sector)

  if (!isBetween(sector.length, minLen, maxLen)) {
    showError(eventSector, 'Largo máximo de caracteres excedido.')
  } else {
    showSuccess(eventSector)
    valid = true
  }
  return valid
}


/**
 * Checks if name is valid, its mandatory and its length must be
 * between 3 and 100 characters.
 * <br>
 * @param {HTMLInputElement} contactName - input element from a form
 * @returns {boolean} - true if contactName is a valid input
 */
export const checkName = (contactName) => {
  let valid = false
  const
      name = contactName.value,
      minLen = 3,
      maxLen = 200
  console.log('nombre:', name)

  if (!isRequired(name)) {
    showError(contactName, 'Debe ingresar un nombre de contacto.')
  } else if (!isBetween(name.length, minLen, maxLen)) {
    showError(contactName, 'Al menos 3 caracteres, máximo 200.')
  } else {
    showSuccess(contactName)
    valid = true
  }
  return valid
}


/**
 * Check if email within input element matches RFC 5322 standard.
 * <br>
 * @param {HTMLInputElement} contactEmail - input element from a form
 * @returns {boolean} - true if contactEmail is a valid email
 */
export const checkEmail = (contactEmail) => {
  let valid = false
  const email = contactEmail.value
  console.log('email:', email)

  if (!isRequired(email)) {
    showError(contactEmail, 'Debe ingresar un email.')
  } else if (!isEmailValid(email)) {
    showError(contactEmail, 'Formato de email no válido.')
  } else {
    showSuccess(contactEmail)
    valid = true
  }
  return valid
}


/**
 * Check if phone number within input element matches Chilean format
 * given by +XXXXXXXXXXX i. e. '+' sign and 11 numbers.
 * <br>
 * @param {HTMLInputElement} contactPhone - input element from a form
 * @returns {boolean} - true if contactPhone is a valid input
 */
export const checkPhone = (contactPhone) => {
  let valid = false
  const phoneNumber = contactPhone.value
  console.log('celular:', phoneNumber)

  if (!isRequired(phoneNumber)) {
    showSuccess(contactPhone)
    valid = true
  } else if (!isCelValid(phoneNumber)) {
    showError(contactPhone, 'Número de celular no válido, ver ejemplo.')
  } else {
    showSuccess(contactPhone)
    valid = true
  }
  return valid
}


/**
 * Checks if date within input element is valid and has expected format
 * which is YYYY-MM-DD HH:mm
 * <br>
 * @param {HTMLInputElement} eventOpenDate - input element from a form
 * @returns {boolean} - true if date has a valid format
 */
export const checkOpenDate = (eventOpenDate) => {
  let valid = false
  const openDate = eventOpenDate.value
  console.log('fecha-apertura:', openDate)

  if (!isRequired(openDate)) {
    showError(eventOpenDate, 'Debe ingresar la fecha de inicio del evento.')
  } else if (!isDateValid(openDate)) {
    showError(eventOpenDate, 'Formato incorrecto, ver ejemplo.')
  } else {
    showSuccess(eventOpenDate)
    valid = true
  }
  return valid
}


/**
 * Checks if endDate of an event is valid and has expected format, besides, this date is
 * compared with openDate to check if endDate happens after openDate in order to make sense.
 * <br>
 * @param {HTMLInputElement} eventEndDate - input element from a form
 * @param {HTMLInputElement} eventOpenDate - input element from a form
 * @returns {boolean} - true if both dates are valid and first happens before second one
 */
export const checkEndDate = (eventEndDate, eventOpenDate) => {
  let valid = false
  const
      endDate = eventEndDate.value,
      openDate = eventOpenDate.value
  console.log('fecha-cierre:', endDate)

  if (!isRequired(endDate)) {
    showError(eventEndDate, 'Debe ingresar la fecha de término del evento.')
  } else if (!isDateValid(endDate)) {
    showError(eventEndDate, 'Formato incorrecto, ver ejemplo.')
  } else if (!checkOpenDate(eventOpenDate)) {
    showError(eventEndDate, 'Chequear la fecha de inicio')
  } else if (!areDatesOrdered(openDate, endDate)) {
    showError(eventEndDate, 'El término debe ser después del inicio del evento.')
  } else {
    showSuccess(eventEndDate)
    valid = true
  }
  return valid
}


/**
 * Checks if event description is valid, as an optional input its only restriction is
 * its length which must not surpass 1000 characters.
 * <br>
 * @param {HTMLTextAreaElement} eventDescription - textarea element from a form
 * @returns {boolean} - true if text input is valid
 */
export const checkDescription = (eventDescription) => {
  let valid = false
  const
      description = eventDescription.value,
      minLen = 0,
      maxLen = 1000
  console.log('descripcion:', description)

  if (!isBetween(description.length, minLen, maxLen)) {
    showError(eventDescription, 'Largo máximo de caracteres excedido.')
  } else {
    showSuccess(eventDescription)
    valid = true
  }
  return valid
}


/**
 * Check if selected food type by user is valid using an array
 * of valid food types, in specific, checks if index is within
 * array boundaries.
 * <br>
 * @param {HTMLSelectElement} eventFoodType - select input element from a form
 * @param {Array<string>} validFoodTypes - valid food types inputs
 * @returns {boolean} - true if selected food type is valid
 */
export const checkFoodType = (eventFoodType, validFoodTypes) => {
  let valid = false
  const foodType = eventFoodType.value
  console.log('food-type:', foodType)

  if (!isRequired(foodType)) {
    showError(eventFoodType, 'Debe seleccionar un tipo de comida.')
  } else if (!validFoodTypes.includes(foodType)) {
    showError(eventFoodType, 'El tipo seleccionado no es válido.')
  } else {
    showSuccess(eventFoodType)
    valid = true
  }
  return valid
}
