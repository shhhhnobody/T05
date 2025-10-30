const scatterMargin = { top: 30, right: 30, bottom: 50, left: 60 },
      scatterWidth = 600 - scatterMargin.left - scatterMargin.right,
      scatterHeight = 400 - scatterMargin.top - scatterMargin.bottom;

const scatterSvg = d3.select("#scatter")
  .append("svg")
    .attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)
    .attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom)
  .append("g")
    .attr("transform", `translate(${scatterMargin.left},${scatterMargin.top})`);

d3.csv("data/Ex5_TV_energy.csv").then(data => {
  // Convert numeric values
  data.forEach(d => {
    d.screensize = +d.screensize;
    d.energy_consumpt = +d.energy_consumpt;
    d.star2 = +d.star2;
    d.count = +d.count;
  });

  // X = star rating
  const x = d3.scaleLinear()
    .domain([d3.min(data, d => d.star2) - 0.5, d3.max(data, d => d.star2) + 0.5])
    .range([0, scatterWidth]);

  // Y = energy consumption
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.energy_consumpt) * 1.1])
    .range([scatterHeight, 0]);

  // Color by screen technology
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  // Circle size proportional to screen size
  const size = d3.scaleSqrt()
    .domain(d3.extent(data, d => d.screensize)) 
    .range([3, 15]);

  // X axis
  scatterSvg.append("g")
    .attr("transform", `translate(0,${scatterHeight})`)
    .call(d3.axisBottom(x));

  // Y axis
  scatterSvg.append("g")
    .call(d3.axisLeft(y));

  // Axis labels
  scatterSvg.append("text")
    .attr("x", scatterWidth / 2)
    .attr("y", scatterHeight + 40)
    .style("text-anchor", "middle")
    .text("Star Rating");

  scatterSvg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -scatterHeight / 2)
    .attr("y", -45)
    .style("text-anchor", "middle")
    .text("Energy Consumption (kWh)");

  // Scatter points
  scatterSvg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
      .attr("cx", d => x(d.star2))
      .attr("cy", d => y(d.energy_consumpt))
      .attr("r", 2)
      .style("fill", d => color(d.screen_tech))
      .style("opacity", 0.7);

  // Tooltip
  const tooltip = d3.select("body").append("div")
    .style("position", "absolute")
    .style("background", "white")
    .style("border", "1px solid #ccc")
    .style("padding", "5px")
    .style("font-size", "12px")
    .style("display", "none");

  scatterSvg.selectAll("circle")
    .on("mouseover", (event, d) => {
      tooltip.style("display", "block")
        .html(`
          <strong>Brand:</strong> ${d.brand}<br>
          <strong>Tech:</strong> ${d.screen_tech}<br>
          <strong>Size:</strong> ${d.screensize}"<br>
          <strong>Star Rating:</strong> ${d.star2}<br>
          <strong>Energy:</strong> ${d.energy_consumpt} kWh
        `);
    })
    .on("mousemove", event => {
      tooltip.style("left", (event.pageX + 10) + "px")
             .style("top", (event.pageY - 20) + "px");
    })
    .on("mouseout", () => tooltip.style("display", "none"));
});
