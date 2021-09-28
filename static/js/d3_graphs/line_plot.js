function line_plot() {
  // set the dimensions and margins of the graph
  const margin = {top: 10, right: 30, bottom: 30, left: 60},
      width = 460 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  const svg = d3.select("#line-graph")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  let data = [['lunes', 5],
    ['martes', 3],
    ['miercoles', 6],
    ['jueves', 9],
    ['viernes', 10],
    ['sabado', 13],
    ['domingo', 3]];

  // Add X axis --> it is a date format
  const x = d3.scalePoint()
      .domain(data.map(function (d) {
        return d[0];
      }))
      .range([0, width])
  svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x));

  // Add Y axis
  const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d[1])])
      .range([height, 0]);
  svg.append("g")
      .call(d3.axisLeft(y));

  // Add the line
  svg.append("path")
      .data([data])
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
          .x(function (d) {
            return x(d[0])
          })
          .y(function (d) {
            return y(d[1])
          })
      )

}

