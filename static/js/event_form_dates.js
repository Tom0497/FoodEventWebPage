window.addEventListener('load', (event) => {
  let start_date_el = document.querySelector('#dia-hora-inicio');
  let end_date_el = document.querySelector('#dia-hora-termino');

  // both start and end dates are defined, the formar as the actual time, the later as the former plus 3 hours
  let s_date = new Date();
  let e_date = new Date();
  e_date.setHours(e_date.getHours() + 3);

  // check whether 0 prefix is needed for minutes, hours, days and months
  // minute prefix
  const s_prefix_min = (s_date.getMinutes() < 10) ? '0' : '';
  const e_prefix_min = (e_date.getMinutes() < 10) ? '0' : '';
  // hour prefix
  const s_prefix_hour = (s_date.getHours() < 10) ? '0' : '';
  const e_prefix_hour = (e_date.getHours() < 10) ? '0' : '';
  // day prefix
  const s_prefix_day = (s_date.getDate() < 10) ? '0' : '';
  const e_prefix_day = (e_date.getDate() < 10) ? '0' : '';
  // month prefix
  const s_prefix_month = ((s_date.getMonth() + 1) < 10) ? '0' : '';
  const e_prefix_month = (e_date.getMonth() < 10) ? '0' : '';

  // define parts of string who may require prefix
  const s_min = s_prefix_min + s_date.getMinutes();
  const s_hour = s_prefix_hour + s_date.getHours();
  const s_day = s_prefix_day + s_date.getDate();
  const s_month = s_prefix_month + (s_date.getMonth() + 1);

  const e_min = e_prefix_min + e_date.getMinutes();
  const e_hour = e_prefix_hour + e_date.getHours();
  const e_day = e_prefix_day + e_date.getDate();
  const e_month = e_prefix_month + (e_date.getMonth() + 1);

  // from Date object to String representation of dates
  let s_date_str = s_date.getFullYear() + '-'
      + s_month + '-'
      + s_day + ' '
      + s_hour + ':'
      + s_min;

  let e_date_str = e_date.getFullYear() + '-'
      + e_month + '-'
      + e_day + ' '
      + e_hour + ':'
      + e_min;

  // prefill dates from event form with calculated dates
  start_date_el.value = s_date_str;
  end_date_el.value = e_date_str;
})