let regiones_list = [];
let comunas_list = [];
let food_options = [];

fetch('../static/json/chileData.json')
    .then(response => response.json())
    .then(chile_json => {

      // then we load all regions and comunas available from JSON file into "regiones_list" and "comunas_list"
      for (let i = 0; i < chile_json.length; i++) {
        regiones_list.push(chile_json[i]['region_number'] + ' ' + chile_json[i]['region']);
        let provincias = chile_json[i]['provincias'];
        let region_comunas = [];
        for (let j = 0; j < provincias.length; j++) {
          let comunas = provincias[j]['comunas'];
          for (let k = 0; k < comunas.length; k++) {
            region_comunas.push(comunas[k]['name']);
          }
        }
        comunas_list.push(region_comunas);
      }

    })

fetch('../static/json/foodTypes.json')
    .then(response => response.json())
    .then(response => response[0]["types"])
    .then(food_types => {

      // all food types are loaded and saved in "food_options" array
      for (let i = 0; i < food_types.length; i++) {
        food_options.push(food_types[i]);
      }
    })


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

  // validate if both region and comuna are valid
  let region_comuna_valid = validate_region_comuna(region, comuna);
  console.log('Region-Comuna: ', region_comuna_valid)

  // validate sector
  let sector_valid = validate_sector(sector);
  console.log('Sector: ', sector_valid);

  // validate nombre
  let nombre_valid = validate_nombre(nombre);
  console.log('Nombre: ', nombre_valid);

  // validate email
  let email_valid = validate_email(email);
  console.log('Email: ', email_valid);

  // validate celular
  let celular_valid = validate_celular(celular);
  console.log('Celular: ', celular_valid);

  // validate redes_sociales
  let redes_sociales_valid = validate_redes_sociales(redes_sociales);
  console.log('Redes Sociales: ', redes_sociales_valid);

  // validate hora_inicio_termino
  let hora_inicio_termino_valid = validate_hora_inicio_termino(fecha_inicio, fecha_termino);
  console.log('Horas Inicio y Término: ', hora_inicio_termino_valid);

  // validate descripcion
  let descripcion_valid = validate_descripcion(descripcion);
  console.log('Descripcion: ', descripcion_valid);

  // validate tipo
  let tipo_valid = validate_tipo(tipo_comida);
  console.log('Tipo: ', tipo_valid);

  // validate fotos
  let fotos_valid = validate_fotos(fotos);
  console.log('Fotos: ', fotos_valid);

  // form is valid if every component is valid by itself
  let is_valid = region_comuna_valid &&
      sector_valid &&
      nombre_valid &&
      email_valid &&
      celular_valid &&
      redes_sociales_valid &&
      hora_inicio_termino_valid &&
      descripcion_valid &&
      tipo_valid &&
      fotos_valid;

  if (is_valid) {
    let confirm_modal = document.querySelector('#confirm-modal');
    confirm_modal.toggle();
  }

}

function validate_region_comuna(region, comuna) {
  // values provided by user are drawn from elements
  let region_value = region.value;
  let comuna_value = comuna.value;

  // first check is whether "region_value" is a valid value among all regions available
  if (!(0 <= region_value && region_value < regiones_list.length)) {
    return false;
  }
  console.log(regiones_list[region_value]);
  console.log(comunas_list[region_value][comuna_value]);
  // second check is whether "comuna_value" is a valid value among all comunas available for picked region
  return (0 <= comuna_value && comuna_value < comunas_list[region_value].length);
}

function validate_sector(sector) {
  // Given its optional, only validation is its maximum length of 100 characters
  let sector_value = sector.value;
  console.log(sector_value)
  return (sector_value.length <= 100);
}

function validate_nombre(nombre) {
  // Its mandatory, requires a min-length of 3 characters and a maximum of 200
  let nombre_value = nombre.value;
  console.log(nombre_value);
  return (3 <= nombre_value.length && nombre_value.length <= 200);
}

function validate_email(email) {
  // Its mandatory, requires to have email standard format i. e. user@provider.something
  // "mail_format" is a RegEx that should match all allowed emails
  let mail_format = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  let email_value = email.value;
  console.log(email_value);
  return mail_format.test(email_value);
}

function validate_celular(celular) {
  // Its optional, but when provided, it must have correct format
  // "celular_format" admits chilean numbers i.e. +569xxxxxxxx
  let celular_format = /^\+(?:[0-9] ?){10}[0-9]$/;
  let celular_value = celular.value;
  console.log(celular_value);
  if (celular_value === "") {
    return true;
  }
  return celular_format.test(celular_value);
}

function validate_redes_sociales(redes_sociales) {
  // Its optional, given the many formats it can take, we'll check that there are at most 5 redes_sociales
  if (redes_sociales === []) {
    // when no red_social was passed in form
    return true;
  }
  return redes_sociales.length <= 5;
}

function validate_hora_inicio_termino(fecha_inicio, fecha_termino) {
  // Mandatory, special format of AAAA-MM-DD HH:mm
  // also termino must be after inicio in order to add up
  let fecha_inicio_value = fecha_inicio.value;
  let fecha_termino_value = fecha_termino.value;

  return true;
}

function validate_descripcion(descripcion) {
  // Its optional and has no boundary in terms of length
  let descripcion_value = descripcion.value;
  console.log(descripcion_value)
  return true;
}

function validate_tipo(tipo_comida) {
  // Mandatory, tipo must be among options presented
  let tipo_value = tipo_comida.value;
  console.log(tipo_value);
  return (0 <= tipo_value && tipo_value < food_options.length)
}

function validate_fotos(fotos) {
  // Mandatory, at least 1 no more than 5
  // also some extensions will be required
  let foto_ok = true;
  if (fotos.length === 0) {
    // no foto was uploaded
    return false;
  }
  // picture extensions allowed
  let allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;
  for (let foto of fotos) {
    let foto_value = foto.value;
    console.log(foto_value);
    foto_ok = foto_ok && (allowedExtensions.test(foto_value));
  }
  return foto_ok;
}