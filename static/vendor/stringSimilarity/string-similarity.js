/**
 * Calculate similarity between two strings.
 * <br>
 * @param {string} str1 First string to match
 * @param {string} str2 Second string to match
 * @param {number} [substringLength=2] Optional. Length of substring to be used in calculating similarity. Default 2.
 * @param {boolean} [caseSensitive=false] Optional. Whether you want to consider case in string matching. Default false;
 * @returns Number between 0 and 1, with 0 being a low match score.
 */
export const stringSimilarity = function (str1, str2, substringLength, caseSensitive) {
  if (substringLength === void 0)
    substringLength = 2
  if (caseSensitive === void 0)
    caseSensitive = false
  if (!caseSensitive) {
    str1 = str1.toLowerCase()
    str2 = str2.toLowerCase()
  }
  if (str1.length < substringLength || str2.length < substringLength)
    return 0
  let map = new Map()
  for (let i = 0; i < str1.length - (substringLength - 1); i++) {
    let substr1 = str1.substr(i, substringLength)
    map.set(substr1, map.has(substr1) ? map.get(substr1) + 1 : 1)
  }
  let match = 0
  for (let j = 0; j < str2.length - (substringLength - 1); j++) {
    let substr2 = str2.substr(j, substringLength)
    let count = map.has(substr2) ? map.get(substr2) : 0
    if (count > 0) {
      map.set(substr2, count - 1)
      match++
    }
  }
  return (match * 2) / (str1.length + str2.length - ((substringLength - 1) * 2))
}

//# sourceMappingURL=string-similarity.js.map