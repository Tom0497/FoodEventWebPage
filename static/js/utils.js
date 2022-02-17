import {DateTime} from "../vendor/luxon/luxon.min.js"
import {stringSimilarity} from "../vendor/stringSimilarity/string-similarity.js";


/**
 * Shorthand for document.querySelector. Accepts CSS selector as
 * a string param. If more than one element matches selector, first
 * occurrence is returned.
 * <br>
 * Note that querySelector is static, i.e doesn't self-update its response.
 * <br>
 * @param userQuery{string} - CSS query string
 * @returns {*} - Element or Node from document
 */
export const query = (userQuery) => document.querySelector(userQuery)


/**
 * Shorthand for document.querySelectorAll. Accepts CSS selector as
 * a string param. Return all matches of selector as a NodeList. Use
 * instead of query when more than one match is expected.
 * <br>
 * Note that querySelectorAll is static, i.e doesn't self-update its response.
 * <br>
 * @param userQuery{string} - CSS query string
 * @returns {NodeListOf<*>} - List of Elements or Nodes from document
 */
export const queryAll = (userQuery) => document.querySelectorAll(userQuery)


/**
 * Input, select or textarea elements used in forms.
 * @typedef {(HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement)} InputFields
 */

/**
 * Bootstrap modal element.
 * @typedef {Pe} BootstrapModal
 */


/**
 * Shorthand for document.getElementsByName. Returns in a list all elements
 * in document that have attribute name=nameStr. Unlike querySelectors, it
 * self-updates its response as document changes.
 * <br>
 * @param nameStr{string} - string of attribute name of element
 * @returns {NodeListOf<HTMLElement|InputFields>} - List of Elements from document with name equals nameStr
 */
export const queryName = (nameStr) => document.getElementsByName(nameStr)


/**
 * Shorthand for document.getElementById. Returns an Element whose id equals idStr.
 * Unlike querySelectors, it self-updates its response as document changes.
 * <br>
 * @param idStr{string} - string which represents Element's id
 * @returns {HTMLElement|InputFields|HTMLFormElement} - HTMLElement whose id is idStr
 */
export const queryId = (idStr) => document.getElementById(idStr)


/**
 * Async function to fetch a JSON file with a specified path passed as a string param.
 * <br>
 * @param params{Object} - path to JSON file
 * @returns {Promise<any>} - fetch promise response
 */
export const fetchDataAPI = async (params) => {
  const
      baseURL = window.location.origin,
      cgiScriptURL = 'dataAPI.py'
  const
      requestURL = `${baseURL}/cgi-bin/${cgiScriptURL}`

  let url = new URL(requestURL)
  url.search = new URLSearchParams(params).toString()

  const response = await fetch(url.toString());
  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }
  return await response.json();
}


/**
 * Async function to fetch regions and comunas from JSON file.
 * <br>
 * @returns {Promise<*[][]>} - An array for regions and one for comunas, as a Promise.
 */
export const getRegionsAndComunas = async () => {
  const params = {
    type: 'regions-comunas'
  }
  const chileDataJSON = await fetchDataAPI(params)

  const
      regiones = chileDataJSON['regions'],
      comunas = chileDataJSON['comunas']

  return [regiones, comunas]
}


/**
 * Async function to fetch food types from JSON file.
 * <br>
 * @returns {Promise<*[]>} - Array of food types as a Promise.
 */
export const getFoodTypes = async () => {
  const params = {
    type: 'food-types'
  }
  return await fetchDataAPI(params)
}


/**
 * Async function to fetch social networks metadata from JSON file.
 * <br>
 * @returns {Promise<*[]>} - Array of social networks names as a Promise.
 */
export const getSocialNetworks = async () => {
  const params = {
    type: 'social-networks'
  }
  return await fetchDataAPI(params)
}


/**
 * Defines default dates of start and end using current datetime as start,
 * and adding 3 hours to define end datetime.
 * <br>
 * @param startDateElement{HTMLInputElement} - input element of a form
 * @param endDateElement{HTMLInputElement} - input element of a form
 */
export const defaultDates = (startDateElement, endDateElement) => {
  const dateFormat = 'yyyy-LL-dd HH:mm'

  // start and end dates are defined, the former as the current time, the later adds 3 hours
  const startDate = DateTime.now()
  const endDate = startDate.plus({hours: 3})

  const startDateStr = startDate.toFormat(dateFormat)
  const endDateStr = endDate.toFormat(dateFormat)

  startDateElement.value = startDateStr
  endDateElement.value = endDateStr
}


/**
 * Debounce technique for better use of system resources
 * <br>
 * @param fn - function to which apply debounce
 * @param delay - waiting time before reapplying function
 * @returns {(function(...[*]=): void)|*} - callback function which either runs original func or resets timer
 */
export const debounce = (fn, delay = 500) => {
  let timeoutId
  return (...args) => {
    // cancel the previous timer
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    // setup a new timer
    timeoutId = setTimeout(() => {
      fn.apply(null, args)
    }, delay)
  }
}


/**
 * Construct bootstrap modals used in form page.
 * <br>
 * @return {[BootstrapModal,BootstrapModal]} - confirmation and success modals
 */
export const getFormModals = () => {
  // get divs to use as modals in form
  let confirmationModalDiv = queryId('form-confirmation'),
      successModalDiv = queryId('form-success')

  // create bootstrap modals then return them
  let confirmationModal =
          new bootstrap.Modal(confirmationModalDiv, {
            backdrop: 'static',
            keyboard: false
          }),
      successModal =
          new bootstrap.Modal(successModalDiv, {
            backdrop: 'static',
            keyboard: false
          })

  return [confirmationModal, successModal]
}


/**
 * Handle form submitting to python CGI script
 * <br>
 * @param form{HTMLFormElement} - form with user input data
 * @return {Promise<any>} - CGI script response to form submit
 */
export const submitForm = async (form) => {
  const response = await fetch('../../cgi-bin/register_event.py', {
    method: 'post',
    body: new FormData(form),
  })
  if (!response.ok) {
    const message = `An error has occured: ${response.status}`
    throw new Error(message)
  }

  return await response.json()
}


/**
 * Capitalize a string.
 * <br>
 * @param variable{string} - string to be capitalized.
 * @return {string} - capitalized string.
 */
export const capitalizeString = (variable) => variable.charAt(0).toUpperCase() + variable.slice(1)


/**
 * Compare if two string are similar enough based on a minimum score.
 * <br>
 * The underlying function computes a similarity score based on the
 * Sorensen-Dice coefficient, which range from 0 to 1. A minimum value
 * for this similarity score is set in order to define two strings as
 * similar enough.
 * <br>
 * @param str1{string} - A string to be compared.
 * @param str2{string} - Another string to be compared.
 * @return {boolean} - whether strings are similar enough.
 */
export const stringAreSimilar = (str1, str2) => {
  const minSimilarityScore = .8 // minimum similarity score
  const  // normalize words (i.e. remove accents and diacritics)
      str1Normalized = str1.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
      str2Normalized = str2.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  const similarityScore = stringSimilarity(str1Normalized, str2Normalized)  // compute similarity score (case insensitive)

  return similarityScore > minSimilarityScore
}


/**
 * Async function to fetch food types from JSON file.
 * <br>
 * @param limit{Number} - Number of events to retrieve.
 * @returns {Promise<*[]>} - Array of food types as a Promise.
 */
export const getLastEvents = async (limit) => {
  const params = {
    type: 'events',
    limit: limit.toString()
  }

  return await fetchDataAPI(params)
}

/**
 * Async function to fetch food types from JSON file.
 * <br>
 * @returns {Promise<*[]>} - Array of food types as a Promise.
 */
export const getEvents = async (limit, offset) => {
  const params = {
    type: 'events'
  }
  if (limit) params.limit = limit
  if (offset) params.offset = offset

  return await fetchDataAPI(params)
}


export const getImageCountPerComuna = async () => {
  const params = {
    type: 'comunas-images'
  }

  return await fetchDataAPI(params)
}


/**
 * Get comunas latitude and longitude for leaflet map.
 * <br>
 * @return {Promise<any>}
 */
export const getComunasXY = async () => {
  const baseURL = window.location.origin
  const jsonPath = `${baseURL}/static/json/chile.json`
  const comunasXYJSON = await fetch(jsonPath)

  return await comunasXYJSON.json()
}


/**
 * Get all images event related to a
 * @param comuna{string}
 */
export const getEventsOfComuna = async (comuna) => {
  const params = {
    type: 'events-comuna',
    comuna: comuna
  }

  return await fetchDataAPI(params)
}