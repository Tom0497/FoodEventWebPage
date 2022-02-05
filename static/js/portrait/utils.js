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
 * Async function to fetch food types from JSON file.
 * <br>
 * @returns {Promise<*[]>} - Array of food types as a Promise.
 */
export const getLastEvents = async () => {
  return await fetchJSON('../../cgi-bin/last_events.py')
}