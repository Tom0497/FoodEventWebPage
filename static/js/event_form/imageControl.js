import {queryId} from "./utils.js";
import {isBetween, isPicExtValid, isRequired, showError, showSuccess} from "./checkUtils.js";


/**
 * Elements that dynamically change when certain events are triggered
 *    imageButton        --> button that adds one more input field for images
 *    imageButtonWarning --> space where a warning message is displayed when maximum image count is reached
 *    imageGroupDiv      --> div where input for images are added in document
 * @type {HTMLElement|InputFields|HTMLFormElement}
 */
let imageButton = queryId('add-img-btn'),
    imageButtonWarning = queryId('add-img-btn-warning'),
    imageGroupDiv = queryId('pictures-group')


/**
 * Class for close buttons in add image part of form
 * @type {string}
 */
const buttonCloseClass = 'btn-close-img'


/**
 * Count for img inputs element with name equals "foto-comida", min 1 at all times
 * @type {number}
 */
let imageCount = 1


/**
 * Listener that handles deletion of input elements when close button is clicked
 */
imageGroupDiv.addEventListener('click', (event) => {
  // element that triggered the event and its classList
  let targetElement = event.target
  let targetElementClasses = targetElement.classList

  // proceed only if "targetElement" is an element which contains "buttonCloseClass" within its classList
  if (targetElementClasses.contains(buttonCloseClass) && imageCount > 1) {
    // by design is known that parent element of input group is 2 levels up the document tree
    const parentInputGroup = targetElement.parentElement.parentElement

    // the element is removed from DOM tree and element count is updated
    parentInputGroup.remove()
    imageCount--;

    // warning is deleted since boundary is no longer reached
    imageButtonWarning.classList.add('d-none')
  }
})


/**
 * Listener that handles the insertion of input group for images into document form
 */
imageButton.addEventListener('click', (event) => {
  event.preventDefault()
  // if less than 5 img inputs elements, then another one can be added
  if (imageCount < 5) {
    let newInputDiv = document.createElement('div')
    newInputDiv.className = 'input-group my-1'
    newInputDiv.innerHTML = `
            <input class="form-control" type="file" name="foto-comida" aria-describedby="pictureHelp">
            <span class="input-group-text">
              <button type="button" class="btn-close ${buttonCloseClass}" aria-label="Close"></button>
            </span>
            <small class="invalid-feedback"></small>`
    imageGroupDiv.appendChild(newInputDiv)

    // after adding element count is updated
    imageCount++;
  } else {
    // alert the user that only a maximum of 5 images can be passed through the form
    imageButtonWarning.classList.remove('d-none');
  }
})


/**
 * Checks if all inputs from a NodeList are images and respect
 * boundaries in terms of its sizes and file extensions.
 * <br>
 * @param imagesInputList{NodeListOf<HTMLInputElement>} - list of input elements from a form
 * @returns {boolean} - true if all inputs are image with expected boundaries
 */
export const checkImages = (imagesInputList) => {
  let valid = true

  imagesInputList.forEach((imageInput) => {
    valid &&= checkImage(imageInput)
  })
  return valid
}


/**
 * Given a form's input element with type file, checks if its input
 * is an image, its size and its file extension.
 * <br>
 * @param imageInput{HTMLInputElement} - an input from a form
 * @returns {boolean} - true if input contains an image with expected boundaries
 */
const checkImage = (imageInput) => {
  let valid = false
  const
      minSize = 5000,
      maxSize = 2000000;

  if (imageInput.files.length === 0) {
    showError(imageInput, 'Debe subir una imagen.')
  } else {
    const
        image = imageInput.files[0],
        imageName = image.name,
        imageSize = image.size
    console.log({image, imageName, imageSize})

    if (!isRequired(imageName)) {
      showError(imageInput, 'El nombre del archivo no puede ser vacío.')
    } else if (!isPicExtValid(imageName)) {
      showError(imageInput, 'Extensión del archivo debe ser (.jpg .jpeg .png).')
    } else if (!isBetween(imageSize, minSize, maxSize)) {
      showError(imageInput, `El tamaño del archivo debe estar entre ${minSize / 1000} KB y ${maxSize / 1000000} MB.`)
    } else {
      showSuccess(imageInput)
      valid = true
    }
  }
  return valid
}

