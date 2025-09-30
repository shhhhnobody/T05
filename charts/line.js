// Set dimensions
const lineWidth = 600,
    lineHeight = 400,
    lineMargin = {top: 50, right: 50, bottom: 60, left: 70};

// Append SVG
const svgLine = d3.select("#line")
  .append("svg")
  .attr("width", lineWidth)
  .attr("height", lineHeight)
  .append("g")
  .attr("transform", `translate(${lineMargin.left},${lineMargin.top})`);

const innerWidthL = lineWidth - lineMargin.left - lineMargin.right;
const innerHeightL = lineHeight - lineMargin.top - lineMargin.bottom;

// Load CSV
//d3.csv("data/Ex5_ARE_Spot_Prices(nomissingvalue).csv").then(data => {
d3.csv("data/Ex5_ARE_Spot_Prices.csv").then(data => {
  data.forEach(d => {
    d.Year = +d.Year;
    
    // Convert to numbers, keep null if missing
    d.Queensland = d["Queensland ($ per megawatt hour)"] ? +d["Queensland ($ per megawatt hour)"] : null;
    d.NSW       = d["New South Wales ($ per megawatt hour)"] ? +d["New South Wales ($ per megawatt hour)"] : null;
    d.Victoria  = d["Victoria ($ per megawatt hour)"] ? +d["Victoria ($ per megawatt hour)"] : null;
    d.SA        = d["South Australia ($ per megawatt hour)"] ? +d["South Australia ($ per megawatt hour)"] : null;
    d.Tasmania  = d["Tasmania ($ per megawatt hour)"] ? +d["Tasmania ($ per megawatt hour)"] : null;
    d.Snowy     = d["Snowy ($ per megawatt hour)"] ? +d["Snowy ($ per megawatt hour)"] : null;

    // Collect row values (excluding nulls)
    let rowVals = [d.Queensland, d.NSW, d.Victoria, d.SA, d.Tasmania, d.Snowy].filter(v => v != null);

    // Compute median of available values
    rowVals.sort((a, b) => a - b);
    let median;
    if (rowVals.length % 2 === 1) {
      median = rowVals[Math.floor(rowVals.length / 2)];
    } else {
      let mid = rowVals.length / 2;
      median = (rowVals[mid - 1] + rowVals[mid]) / 2;
    }

    // Replace missing with median
    ["Queensland", "NSW", "Victoria", "SA", "Tasmania", "Snowy"].forEach(key => {
      if (d[key] == null) d[key] = median;
    });

    // Recompute Avg (ignoring Tas & Snowy, using filled values)
    d.Avg = d3.mean([d.Queensland, d.NSW, d.Victoria, d.SA]);
  });

  // Scales
  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.Year))
    .range([0, innerWidthL]);

  const y = d3.scaleLinear()
    .domain([
      0,
      d3.max(data, d => Math.max(
        d.Queensland, d.NSW, d.Victoria, d.SA, d.Tasmania, d.Snowy
      ))
    ]).nice()
    .range([innerHeightL, 0]);

  // Axes
  svgLine.append("g")
    .attr("transform", `translate(0,${innerHeightL})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d"))); // show full year

  svgLine.append("g")
    .call(d3.axisLeft(y));

  // Compute min/max per year (across all states)
  const areaData = data.map(d => {
    const values = [d.Queensland, d.NSW, d.Victoria, d.SA, d.Tasmania, d.Snowy];
    return {
      Year: d.Year,
      min: d3.min(values),
      max: d3.max(values)
    };
  });

  // Grey band (min-max area)
  const area = d3.area()
    .x(d => x(d.Year))
    .y0(d => y(d.min))
    .y1(d => y(d.max));

  svgLine.append("path")
    .datum(areaData)
    .attr("fill", "#ccc")
    .attr("opacity", 0.4)
    .attr("d", area);

  // Line generator for Avg
  const lineGen = d3.line()
    .x(d => x(d.Year))
    .y(d => y(d.Avg));

  // Draw Avg line
  svgLine.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", lineGen);

  // Label for Avg line
  svgLine.append("text")
    .datum(data[data.length - 1])
    .attr("x", x(data[data.length - 1].Year) + 5)
    .attr("y", y(data[data.length - 1].Avg))
    .attr("fill", "steelblue")
    .attr("font-size", "12px")
    .text("Average Price (ex Tas & Snowy)");

  // Axis labels
  svgLine.append("text")
    .attr("x", innerWidthL / 2)
    .attr("y", innerHeightL + lineMargin.bottom - 15)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Year");

  svgLine.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -innerHeightL / 2)
    .attr("y", -lineMargin.left + 20)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Price ($/MWh)");
});
