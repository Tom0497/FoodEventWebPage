function circular_plot() {
  // set the dimensions and margins of the graph
  const width = 450,
      height = 450,
      margin = 40;

  // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
  const radius = Math.min(width, height) / 2 - margin;

  // append the svg object to the div called 'my_dataviz'
  const svg = d3.select("#circular-graph")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

  // Create dummy data
  const data = {chilena: 13, casera: 12, italiana: 11, vegetariana: 12, otro: 4}

  // set the color scale
  const color = d3.scaleOrdinal()
      .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56"])

  // Compute the position of each group on the pie:
  const pie = d3.pie()
      .value(function (d) {
        return d[1]
      })
  const data_ready = pie(Object.entries(data))

  // shape helper to build arcs:
  const arcGenerator = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);

  // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
  svg
      .selectAll('mySlices')
      .data(data_ready)
      .join('path')
      .attr('d', arcGenerator)
      .attr('fill', function (d) {
        return (color(d.data[1]))
      })
      .attr("stroke", "black")
      .style("stroke-width", "4px")
      .style("opacity", 0.7);

  // Now add the annotation. Use the centroid method to get the best coordinates
  svg
      .selectAll('mySlices')
      .data(data_ready)
      .join('text')
      .text(function (d) {
        return d.data[0] + ` [${d.data[1]}]`
      })
      .attr("transform", function (d) {
        return `translate(${arcGenerator.centroid(d)})`
      })
      .style("text-anchor", "middle")
      .style("font-size", 17)

}