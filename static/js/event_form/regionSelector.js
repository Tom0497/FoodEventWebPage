import {queryId} from './utils.js'


/**
 * Creates two selects for a form using valid options of regions and comunas
 * passed as arrays in parameters.
 * <br>
 * @param validRegions{Array<string>} - list of valid regions names
 * @param validComunas{Array<Array<string>>} - list of valid comunas for every region
 */
export const regionAndComunasSelect = (validRegions, validComunas) => {
  // select elements for regions and comunas
  let regionSelect = queryId('region')
  let comunaSelect = queryId('comuna')

  // string for regions options, default first
  let regionOptions = '<option selected hidden value="">Seleccione una Región</option>'

  // add all other regions options
  validRegions.forEach(
      (region, idx) => regionOptions += `<option value="${idx}">${region}</option>`
  )

  // then add all region options to innerHTML of region select
  regionSelect.innerHTML = regionOptions

  regionSelect.addEventListener('change', (_) => {
    // display comunas input if region's been selected
    comunaSelect.parentElement.classList.remove('d-none')

    // string for comunas options, default first
    let comunasOptions = '<option selected hidden value="">Seleccione una Comuna</option>'

    // region value id selected by user
    const regionSelected = parseInt(regionSelect.value)

    // then we load all comunas available from selected region
    validComunas[regionSelected].forEach(
        (comuna, idx) => comunasOptions += `<option value="${idx}">${comuna}</option>`
    )

    // then add comunas options to innerHTML of comunas select
    comunaSelect.innerHTML = comunasOptions
  })
}