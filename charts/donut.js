// Set dimensions
const width = 600,
      height = 400,
      margin = 40;

const radius = Math.min(width, height) / 2 - margin;

// Append SVG
const svgDonut = d3.select("#donut")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", `translate(${width / 2}, ${height / 2})`);

// Color scale
const color = d3.scaleOrdinal()
  .range(["#1f77b4", "#ff7f0e", "#2ca02c"]); // blue, orange, green

const tooltip = d3.select("body")
  .append("div")
  .style("position", "absolute")
  .style("background", "#fff")
  .style("padding", "6px 10px")
  .style("border", "1px solid #ccc")
  .style("border-radius", "4px")
  .style("font-size", "12px")
  .style("pointer-events", "none")
  .style("opacity", 0);

// Load CSV data
d3.csv("Data/Ex5_TV_energy_Allsizes_byScreenType.csv").then(data => {
  
    // Convert numeric values
    data.forEach(d => {
        d.Mean = +d["Mean(Labelled energy consumption (kWh/year))"];
    });

    const total = d3.sum(data, d => d.Mean);

    // Pie generator
    const pie = d3.pie()
        .sort(null)
        .value(d => d.Mean);

    // Arc generator
    const arc = d3.arc()
        .innerRadius(radius * 0.5) // donut hole
        .outerRadius(radius * 0.9);

    // Draw slices
    svgDonut.selectAll("path")
        .data(pie(data))
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.Screen_Tech))
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .on("mouseover", function (event, d) {
        d3.select(this)
            .transition().duration(200)
            .attr("transform", `translate(${arc.centroid(d)}) scale(1.05) translate(${-arc.centroid(d)[0]}, ${-arc.centroid(d)[1]})`);

        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`
            <strong>${d.data.Screen_Tech}</strong><br>
            Value: ${d.data.Mean.toFixed(1)} kWh/year<br>
            Share: ${((d.data.Mean / total) * 100).toFixed(1)}%
        `)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
        })
        .on("mousemove", function (event) {
        tooltip
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function (event, d) {
        d3.select(this)
            .transition().duration(200)
            .attr("transform", "translate(0,0)");

        tooltip.transition().duration(200).style("opacity", 0);
        });

    // Label positions
    const labelArc = d3.arc()
        .innerRadius(radius * 0.7)
        .outerRadius(radius * 0.7);

    // Add labels
    svgDonut.selectAll("text")
        .data(pie(data))
        .enter()
        .append("text")
        .text(d => `${Math.round((d.data.Mean / d3.sum(data, d => d.Mean)) * 100)}%`)
        .attr("transform", d => `translate(${labelArc.centroid(d)})`)
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "white");

    // Add legend
    const legend = d3.select("#donut svg")
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height - 20})`);

    const legendItems = legend.selectAll(".legend-item")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(${i * 120 - (data.length - 1) * 60}, 0)`);

    // Legend colored squares
    legendItems.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", d => color(d.Screen_Tech));

    // Legend text
    legendItems.append("text")
        .attr("x", 25)
        .attr("y", 14)
        .text(d => d.Screen_Tech)
        .style("font-size", "12px");
});