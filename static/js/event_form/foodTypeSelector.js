import {queryId} from './utils.js'


/**
 * Creates a select element with options given by valid food types
 * passed as paramenter in array.
 * <br>
 * @param foodTypes{Array<string>} - list of valid food types
 */
export const foodTypesSelect = (foodTypes) => {
  // select element for food type
  let foodTypeSelect = queryId('tipo-comida')

  // string for food type options, default first
  let foodOptions = '<option selected hidden value="">Seleccione un tipo</option>'

  // all other food types options
  foodTypes.forEach(
      (foodType) => foodOptions += `<option value="${foodType}">${foodType}</option>`
  )

  // then add all food types options to innerHTML of food type select
  foodTypeSelect.innerHTML = foodOptions
}