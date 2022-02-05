import {DateTime} from "../../vendor/luxon/luxon.min.js"

/**
 * string date format for luxon DateTime Object
 * @type {string}
 */
const LUXON_DATE_FORMAT = 'yyyy-LL-dd HH:mm'

/**
 * regular expressions for image extension, phone number and email
 * @type {RegExp}
 */
const
    IMAGES_EXT_REGEX = /(\.jpg|\.jpeg|\.png)$/i,
    PHONE_NUMBER_REGEX = /^\+(?:[0-9] ?){10}[0-9]$/,
    EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/


/**
 * @param {string} value - string to be evaluated
 * @returns {boolean} - true if value is empty string
 */
export const isRequired = (value) => {
  return value !== ''
}


/**
 * @param length {number} - number to be evaluated
 * @param min {number} - lower bound of range
 * @param max {number} - upper bound of range
 * @returns {boolean} - true if length is in range [min, max]
 */
export const isBetween = (length, min, max) => {
  return !(length < min || length > max)
}


/**
 * Checks if a phone number in string format matches the expected
 * format of a Chilean number i. e. +56 X XXXXXXXX ('+' sign and 11 numbers)
 * <br>
 * @param {string} celNumber - string representing a phone number
 * @returns {boolean} - true if celNumber matches pattern
 */
export const isCelValid = (celNumber) => {
  return PHONE_NUMBER_REGEX.test(celNumber);
}


/**
 * Checks if a filename represent an image by its extension.
 * Only some image extensions are allowed.
 * <br>
 * @param {string} picName - filename of image
 * @returns {boolean} - true if picName matches extensions allowed
 */
export const isPicExtValid = (picName) => {
  return IMAGES_EXT_REGEX.test(picName);
}


/**
 * Check if email is valid according to RFC 5322
 * <br>
 * @param {string} email - email in a string format
 * @returns {boolean} - true if email matches standard RFC 5322
 */
export const isEmailValid = (email) => {
  return EMAIL_REGEX.test(email)
}


/**
 * Checks if a string date is valid and matches format YYYY-MM-DD HH:mm
 * Uses luxon library for Date Handling.
 * <br>
 * @param {string} dateStr - date in string rep
 * @returns {boolean} - true if dateStr is valid and matches LUXON_DATE_FORMAT
 */
export const isDateValid = (dateStr) => {
  const parsedDate = DateTime.fromFormat(dateStr, LUXON_DATE_FORMAT)

  return parsedDate.isValid
}


/**
 * Compare two dates and checks if the first one is placed before
 * the second one, time-wise. Uses luxon library for Date handling.
 * <br>
 * @param {string} firstDateStr - date assumed to be before secondDateStr
 * @param {string} secondDateStr - date assumed to be after firstDateStr
 * @returns {boolean} - true if firstDateStr happens before firstDateStr
 */
export const areDatesOrdered = (firstDateStr, secondDateStr) => {
  const firstDate = DateTime.fromFormat(firstDateStr, LUXON_DATE_FORMAT)
  const secondDate = DateTime.fromFormat(secondDateStr, LUXON_DATE_FORMAT)

  return firstDate < secondDate
}


/**
 * Displays a message to user indicating an invalid input an a brief
 * explanation on what is wrong.
 * <br>
 * @param {HTMLElement} input - input element which contains an invalid input
 * @param {string} message - message to be displayed to user for correcting invalid input
 */
export const showError = (input, message) => {
  // get the form-field element
  const formField = input.parentElement;
  // add the error class
  input.classList.remove('is-valid');
  input.classList.add('is-invalid');

  // show the error message
  const error = formField.querySelector('small');
  error.textContent = message;
};


/**
 * Displays a message to user indicating that input is valid.
 * <br>
 * @param {HTMLElement} input - input element which contains a valid input
 */
export const showSuccess = (input) => {
  // get the form-field element
  const formField = input.parentElement;

  // remove the error class
  input.classList.remove('is-invalid');
  input.classList.add('is-valid');

  // hide the error message
  const error = formField.querySelector('small');
  error.textContent = '';
}