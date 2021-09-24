window.addEventListener('load', (event) => {
  let img_btn = document.querySelector('#add-img-btn');
  let pic_group = document.querySelector('#pictures-group');
  let img_count = 0;

  img_btn.addEventListener('click', (event) => {
    if (img_count < 5) {
      pic_group.innerHTML +=
          '<input class="form-control" type="file" id="formFile" name="foto-comida" aria-describedby="nameHelpFile">';
    }
  })
})