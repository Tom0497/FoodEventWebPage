import {DateTime} from "../../vendor/luxon/luxon.min.js"


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
 * @param jsonPath{string} - path to JSON file
 * @returns {Promise<any>} - fetch promise response
 */
export const fetchJSON = async (jsonPath) => {
  const response = await fetch(jsonPath);
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
  const regionesJSON = await fetchJSON('../static/json/chileData.json')
  let regionsOutput = []
  let comunasOutput = []

  // then we load all regions and comunas available from JSON file into "regiones_list" and "comunas_list"
  for (const region of regionesJSON) {
    regionsOutput.push(`${region['region_number']} ${region['region']}`)
    const provincias = region['provincias']
    let regionComunas = []
    for (const provincia of provincias) {
      const comunas = provincia['comunas']
      for (const comuna of comunas) {
        regionComunas.push(comuna['name'])
      }
    }
    comunasOutput.push(regionComunas);
  }

  return [regionsOutput, comunasOutput];
}


/**
 * Async function to fetch food types from JSON file.
 * <br>
 * @returns {Promise<*[]>} - Array of food types as a Promise.
 */
export const getFoodTypes = async () => {
  const foodTypesJSON = await fetchJSON('../static/json/foodTypes.json')
  let foodTypes = []

  // all food types are loaded and saved in "food_options" array
  for (const food_type of foodTypesJSON) {
    foodTypes.push(food_type);
  }

  return foodTypes
}


/**
 * Async function to fetch social networks metadata from JSON file.
 * <br>
 * @returns {Promise<*[]>} - Array of social networks names as a Promise.
 */
export const getSocialNetworks = async () => {
  const socialNetworksJSON = await fetchJSON('../static/json/socialNetworks.json')
  let socialNetworks = []

  for (const socialNetwork of socialNetworksJSON) {
    socialNetworks.push(socialNetwork["network_name"])
  }

  return socialNetworks
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