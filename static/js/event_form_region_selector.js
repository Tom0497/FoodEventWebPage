fetch('../static/json/chileData.json')
    .then(response => response.json())
    .then(chile_json => {
      let region = document.querySelector('#region');
      let comuna = document.querySelector('#comuna');
      let region_options = '';
      let region_display;

      // default display value of region selector
      region_options += '<option disabled selected hidden value="">Seleccione una Región</option>';

      // then we load all regions available from JSON file
      for (let i = 0; i < chile_json.length; i++) {
        region_display = chile_json[i]['region_number'] + ' ' + chile_json[i]['region'];
        region_options += '<option value="' + i + '">' + region_display + '</option>';
      }

      // then add all region options to innerHTML of region select
      region.innerHTML = region_options;
      // default display value of town selector when region hasn't been selected
      comuna.innerHTML = '<option disabled selected hidden value="">Seleccione una Región</option>';

      region.addEventListener('change', (event) => {
        let comunas_options = '';
        let comunas;

        // region value id selected by user
        const region_selected = parseInt(region.value);
        // query all provinces in said region
        const provincias = chile_json[region_selected]['provincias'];

        // default display value of town selector
        comunas_options += '<option disabled selected hidden value="">Seleccione una Comuna</option>';

        // then we load all towns available from every province in selected region
        for (let i = 0; i < provincias.length; i++) {
          comunas = provincias[i]['comunas'];
          for (let j = 0; j < comunas.length; j++) {
            comunas_options += '<option value="' + j + '">' + comunas[j]['name'] + '</option>';
          }
        }

        // then add all towns options to innerHTML of town select
        comuna.innerHTML = comunas_options;

      })

    })