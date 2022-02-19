import {getEventCountByMonthAndDayTime, getEventCountByType, getEventCountPerDay, queryId} from "../utils.js"

/**
 * IDs of divs used for charts.
 * @type {string}
 */
const
    lineChartId = 'line-chart',
    pieChartId = 'pie-chart',
    barChartId = 'bar-chart'


/**
 * Div for line chart.
 * @type {HTMLElement|InputFields|HTMLFormElement}
 */
let lineChartDiv = queryId(lineChartId)
lineChartDiv.style.width = '500px'  // set height in order to be displayed

/**
 * Div for pie chart.
 * @type {HTMLElement|InputFields|HTMLFormElement}
 */
let pieChartDiv = queryId(pieChartId)
pieChartDiv.style.width = '500px'  // set height in order to be displayed

/**
 * Div for bar chart.
 * @type {HTMLElement|InputFields|HTMLFormElement}
 */
let barChartDiv = queryId(barChartId)
barChartDiv.style.width = '500px'  // set height in order to be displayed


/**
 * Generate line chart asynchronously, fetching data with AJAX.
 * <br>
 * @return {Promise<void>}
 */
const lineChart = async () => {
  const data = await getEventCountPerDay()
  console.log({data})

  let dates = [],
      counts = []
  data.forEach(
      ([dayStr, count]) => {
        dates.push(dayStr)
        counts.push(count)
      }
  )

  const chart = Highcharts.chart(lineChartId, {
    chart: {
      type: 'line'
    },
    title: {
      text: 'Cantidad de eventos por día'
    },
    subtitle: {
      text: 'Utilizando como referencia la fecha de inicio del evento.'
    },
    xAxis: {
      categories: dates
    },
    yAxis: {
      title: {
        text: 'Cantidad de eventos'
      }
    },
    series: [{
      name: '',
      data: counts
    }]
  })
}


/**
 * Generate pie chart asynchronously, fetching data with AJAX.
 * <br>
 * @return {Promise<void>}
 */
const pieChart = async () => {
  const data = await getEventCountByType()
  console.log({data})

  let chartSeries = {
    name: 'Tipo de comida',
    colorByPoint: true,
    data: []
  }
  data.forEach(
      ([foodType, count]) => chartSeries.data.push({
        name: foodType,
        y: count
      })
  )


  const chart = Highcharts.chart(pieChartId, {
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      type: 'pie'
    },
    title: {
      text: 'Cantidad de eventos por tipo de comida.'
    },
    tooltip: {
      pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
    },
    accessibility: {
      point: {
        valueSuffix: '%'
      }
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.1f} %'
        }
      }
    },
    series: [chartSeries]
  })
}


/**
 * Generate bar chart asynchronously, fetching data with AJAX.
 * <br>
 * @return {Promise<void>}
 */
const barChart = async () => {
  const data = await getEventCountByMonthAndDayTime()
  const {months, early, midday, evening} = data
  console.log({data})

  Highcharts.chart(barChartId, {
    chart: {
      type: 'column'
    },
    title: {
      text: 'Cantidad de eventos por mes'
    },
    subtitle: {
      text: 'Agrupados por horario de inicio en: mañana, mediodía y tarde.'
    },
    xAxis: {
      categories: months,
      crosshair: true
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Cantidad de eventos'
      }
    },
    tooltip: {
      headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
      pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
          '<td style="padding:0"><b>{point.y:.0f} eventos</b></td></tr>',
      footerFormat: '</table>',
      shared: true,
      useHTML: true
    },
    plotOptions: {
      column: {
        pointPadding: 0.2,
        borderWidth: 0
      }
    },
    series: [{
      name: 'Mañana',
      data: early

    }, {
      name: 'Mediodía',
      data: midday

    }, {
      name: 'Tarde',
      data: evening
    }]
  })

}


/**
 * Simultaneously call async functions that fetch data with AJAX and construct charts.
 */
Promise
    .all([lineChart(), pieChart(), barChart()])
    .then()
