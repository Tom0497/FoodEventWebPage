function form_validator() {
  // Get survey responses elements from user
  // where section
  let region = document.getElementById('region');
  let comuna = document.getElementById('comuna');
  let sector = document.getElementById('sector');

  // who section
  let nombre = document.getElementById('nombre');
  let email = document.getElementById('email');
  let celular = document.getElementById('celular');
  let redes_sociales = [];

  // only social networks inputs that were created are considered
  const sn_ids = ['twitter_link', 'instagram_link', 'facebook_link', 'tiktok_link', 'otra_link'];
  for (let sn_id of sn_ids) {
    let sn_element = document.getElementById(sn_id);
    if (sn_element !== null) {
      redes_sociales.push(sn_element);
    }
  }

  // when and what section
  let fecha_inicio = document.getElementById('dia-hora-inicio');
  let fecha_termino = document.getElementById('dia-hora-termino');
  let descripcion = document.getElementById('descripcion-evento');
  let tipo_comida = document.getElementById('tipo-comida');
  let fotos = document.getElementsByName('foto-comida');

  let region_comuna_valid = validate_region_comuna(region, comuna);
  console.log(region_comuna_valid)
  return false;
}

function validate_region_comuna(region, comuna) {
  // values provided by user are drawn from elements
  let region_val = region.value;
  let comuna_val = comuna.value;

  fetch('../static/json/chileData.json')
      .then(response => response.json())
      .then(chile_json => {
        let regiones_list = [];
        let comunas_list = [];
        console.log(region_val);
        console.log(comuna_val);

        // then we load all regions available from JSON file into "regiones_list"
        for (let i = 0; i < chile_json.length; i++) {
          regiones_list.push(chile_json[i]['region_number'] + ' ' + chile_json[i]['region']);
        }

        // first check is whether "region_val" is a valid value among all regions available
        if (!(0 <= region_val < regiones_list.length)) {
          return false;
        }

        // then we need comunas in chosen region
        const provincias = chile_json[region_val]['provincias'];
        // then we load all comunas available from every province in selected region
        for (let i = 0; i < provincias.length; i++) {
          let comunas = provincias[i]['comunas'];
          for (let j = 0; j < comunas.length; j++) {
            comunas_list.push(comunas[j]['name']);
          }
        }

        // second check is whether "comuna_val" is a valid value among all comunas available
        return 0 <= comuna_val < comunas_list.length;
      })
  return false;
}