window.addEventListener('load', (event) => {
  // elements that dynamically change when certain events are triggered
  //  * img_btn             --> button that adds one more input field for images
  //  * img_btn_warning     --> space where a warning message is displayed when maximum image count is reached
  //  * images_group_div    --> div where input for images are added in document
  let img_btn = document.querySelector('#add-img-btn');
  let img_btn_warning = document.querySelector('#add-img-btn-warning');
  let images_group_div = document.querySelector('#pictures-group');

  // class for close buttons in add image part of form
  const btn_close_class = 'btn-close-img';
  // count for img inputs element with said class, 1 at document load
  let img_count = 1;

  // listener that handles deletion of input elements when close button is clicked
  images_group_div.addEventListener('click', (event) => {
    // element that triggered the event and its classList
    let target_element = event.target;
    let target_element_classes = target_element.classList;

    // proceed only if "target_element" is an element which contains "btn_close_class" within its classList
    if (target_element_classes.contains(btn_close_class)) {
      // by design is known that parent element of input group is 2 levels up the document tree
      let parent_input_group = target_element.parentNode.parentNode;

      // the element is removed from DOM tree and element count is updated
      parent_input_group.remove();
      img_count--;

      // warning is deleted since boundary is no longer reached
      img_btn_warning.classList.add('d-none');
    }
  })

  //listener that handles the insertion of input group for images into document form
  img_btn.addEventListener('click', (event) => {
    // if less than 5 img inputs elements, then another one can be added
    if (img_count < 5) {
      images_group_div.innerHTML +=
          '<div class="input-group my-1">\n' +
          '            <input class="form-control" type="file" id="formFile" name="foto-comida"\n' +
          '                   aria-describedby="pictureHelp">\n' +
          '            <span class="input-group-text">\n' +
          `              <button type="button" class="btn-close ${btn_close_class}" aria-label="Close"></button>\n` +
          '            </span>\n' +
          '</div>';

      // after adding element count is updated
      img_count++;
    } else {
      // alert the user that only a maximum of 5 images can be passed through the form
      img_btn_warning.classList.remove('d-none');
    }
  })

})