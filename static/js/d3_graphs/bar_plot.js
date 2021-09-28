function bar_plot() {
  // set the dimensions and margins of the graph
  const margin = {top: 10, right: 30, bottom: 20, left: 50},
      width = 460 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  const svg = d3.select("#bar-chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  let data = [
    {
      "group": "Enero",
      "manana": "2",
      "mediodia": "8",
      "tarde": "10"
    },
    {
      "group": "Febrero",
      "manana": "3",
      "mediodia": "4",
      "tarde": "6"
    },
    {
      "group": "Marzo",
      "manana": "5",
      "mediodia": "7",
      "tarde": "12"
    },
    {
      "group": "Abril",
      "manana": "4",
      "mediodia": "6",
      "tarde": "12"
    },
    {
      "group": "Mayo",
      "manana": "5",
      "mediodia": "10",
      "tarde": "15"
    },
    {
      "group": "Junio",
      "manana": "8",
      "mediodia": "5",
      "tarde": "14"
    },
    {
      "group": "Julio",
      "manana": "3",
      "mediodia": "14",
      "tarde": "6"
    }
  ];

  // List of subgroups = header of the csv files = soil condition here
  const subgroups = ["manana", "mediodia", "tarde"];
  console.log(subgroups);

  // List of groups = species here = value of the first column called group -> I show them on the X axis
  const groups = data.map(d => d.group);

  console.log(groups);

  // Add X axis
  const x = d3.scaleBand()
      .domain(groups)
      .range([0, width])
      .padding([0.2]);
  svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickSize(0));

  // Add Y axis
  const y = d3.scaleLinear()
      .domain([0, 20])
      .range([height, 0]);
  svg.append("g")
      .call(d3.axisLeft(y));

  // Another scale for subgroup position?
  const xSubgroup = d3.scaleBand()
      .domain(subgroups)
      .range([0, x.bandwidth()])
      .padding([0.05]);

  // color palette = one color per subgroup
  const color = d3.scaleOrdinal()
      .domain(subgroups)
      .range(['#e41a1c', '#377eb8', '#4daf4a']);

  // Show the bars
  svg.append("g")
      .selectAll("g")
      // Enter in data = loop group per group
      .data(data)
      .join("g")
      .attr("transform", d => `translate(${x(d.group)}, 0)`)
      .selectAll("rect")
      .data(function (d) {
        return subgroups.map(function (key) {
          return {key: key, value: d[key]};
        });
      })
      .join("rect")
      .attr("x", d => xSubgroup(d.key))
      .attr("y", d => y(d.value))
      .attr("width", xSubgroup.bandwidth())
      .attr("height", d => height - y(d.value))
      .attr("fill", d => color(d.key));

}