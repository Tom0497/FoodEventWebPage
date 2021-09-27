fetch('../static/json/socialNetworks.json')
    .then(response => response.json())
    .then(snet_json => {
      // fetch JSON file with relevant info regarding social networks (sn for abbr.) for form

      //  * sn_select --> select element which will contain all sn options
      //  * sn_div    --> div element where sn text input are displayed
      let sn_select = document.querySelector('#red-social');
      let sn_div = document.querySelector('#redes-sociales');

      // * sn_list         --> array whose index are value for select and have a respected sn associated with it
      // * sn_added_inputs --> array with values that indicate which sn input group has already been added to document
      // * sn_options      --> String that holds all options of select before passing it to element
      // * btn_close_class --> class name for close button in sn text input
      let sn_list = [];
      let sn_added_inputs = [];
      let sn_options = '';
      const btn_close_class = 'btn-close-sn';

      // default display value of sn selector
      sn_options += '<option disabled selected hidden value="">¿Tienes redes sociales?</option>\n';

      // load all sn available from JSON file and save them in "sn_list" and add them to "sn_options"
      for (let i = 0; i < snet_json.length; i++) {
        sn_list[i] = snet_json[i]['network_name'];
        sn_options += `<option value="${i}"> ${sn_list[i]} </option>\n`;
      }

      // then add all sn options to innerHTML of SN select
      sn_select.innerHTML = sn_options;

      // listener that handles the insertion of input group for sn into document form
      sn_select.addEventListener('change', (event) => {
        // starting from sn id other parameters necessary for input group creation are determined
        let sn_idx = parseInt(sn_select.value);
        let sn_name = sn_list[sn_idx];
        let sn_name_lc = sn_name.toLowerCase();
        let sn_name_post = `${sn_name_lc}_link`;
        let sn_addon_id = `${sn_name_lc}_addon`;

        // element is added only if it hasn't already
        if (!sn_added_inputs.includes(sn_name_post)) {
          sn_div.innerHTML +=
              `<div class="input-group my-1" id="${sn_name_post}">\n` +
              `  <span class="input-group-text" id="${sn_addon_id}">${sn_name}</span>\n` +
              '  <input type="text" class="form-control" placeholder="ID o URL" aria-label="Username"\n' +
              `         aria-describedby="${sn_addon_id}" name="${sn_name_post}">\n` +
              '  <span class="input-group-text">\n' +
              `    <button type="button" class="btn-close ${btn_close_class}" aria-label="Close"></button>\n` +
              '  </span>\n' +
              '</div>';

          sn_added_inputs.push(sn_name_post);
        }
      })

      // listener that handles deletion of input elements when close button is clicked
      sn_div.addEventListener('click', (event) => {
        // element that triggered the event and its classList
        let target_element = event.target;
        let target_element_classes = target_element.classList;

        // proceed only if "target_element" is an element which contains "btn_close_class" within its classList
        if (target_element_classes.contains(btn_close_class)) {
          // by design is known that parent element of input group is 2 levels up the document tree
          let parent_input_group = target_element.parentNode.parentNode;
          let parent_ig_id = parent_input_group.id;
          let parent_ig_id_idx = sn_added_inputs.indexOf(parent_ig_id);

          // id must be deleted from added input group array
          sn_added_inputs.splice(parent_ig_id_idx, 1);

          // the element is removed from DOM tree and element count is updated
          parent_input_group.remove();
        }
      })

    })