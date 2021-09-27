fetch('../static/json/foodTypes.json')
    .then(response => response.json())
    .then(response => response[0]["types"])
    .then(food_types => {
      let food_type = document.querySelector('#tipo-comida');
      let food_options = '';

      // default display value of food type selector
      food_options += '<option disabled selected hidden value="">Seleccione un tipo</option>';

      // then all food types are loaded and added as options to "food_type" select
      for (let i = 0; i < food_types.length; i++) {
        food_options += `<option value="${i}">${food_types[i]}</option>`;
      }

      food_type.innerHTML = food_options;
    })