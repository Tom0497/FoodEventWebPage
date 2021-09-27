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

  return false;
}
