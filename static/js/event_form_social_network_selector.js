fetch('../static/json/socialNetworks.json')
    .then(response => response.json())
    .then(snet_json => {
      let soc_net = document.querySelector('#red-social');
      let sn_options = '';

      // default display value of SN selector
      sn_options += '<option disabled selected hidden value="">¿Tienes redes sociales?</option>';

      // then we load all SN available from JSON file
      for (let i = 0; i < snet_json.length; i++) {
        sn_options += '<option value="' + i + '">' + snet_json[i]['network_name'] + '</option>';
      }

      // then add all SN options to innerHTML of SN select
      soc_net.innerHTML = sn_options;

      soc_net.addEventListener('change', (event) => {
        // which SN was selected
        let soc_net_sel = parseInt(soc_net.value);
        let sn_input_id = '#sn_input_' + soc_net_sel;

        let sn_input = document.querySelector(sn_input_id);

        sn_input.classList.remove('d-none');

      })

    })