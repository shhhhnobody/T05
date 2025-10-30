// Set dimensions
const barWidth = 600,
    barHeight = 400,
    barMargin = {top: 40, right: 20, bottom: 80, left: 60};

// Append SVG
const svgBar = d3.select("#bar")
.append("svg")
.attr("width", barWidth)
.attr("height", barHeight)
.append("g")
.attr("transform", `translate(${barMargin.left}, ${barMargin.top})`);

const innerWidth = barWidth - barMargin.left - barMargin.right;
const innerHeight = barHeight - barMargin.top - barMargin.bottom;

// Tooltip
const barTooltip = d3.select("body")
.append("div")
.style("position", "absolute")
.style("background", "#fff")
.style("padding", "6px 10px")
.style("border", "1px solid #ccc")
.style("border-radius", "4px")
.style("font-size", "12px")
.style("pointer-events", "none")
.style("opacity", 0);

// Load CSV
d3.csv("data/Ex5_TV_energy_55inchtv_byScreenType.csv").then(data => {

data.forEach(d => {
    d.Mean = +d["Mean(Labelled energy consumption (kWh/year))"];
});

// Color scale
const color = d3.scaleOrdinal()
    .domain(data.map(d => d.Screen_Tech))
    .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);

// Scales
const x = d3.scaleBand()
    .domain(data.map(d => d.Screen_Tech))
    .range([0, innerWidth])
    .padding(0.3);

const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.Mean)]).nice()
    .range([innerHeight, 0]);

// X-axis
svgBar.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x));

// X-axis label
svgBar.append("text")
    .attr("x", innerWidth / 2)
    .attr("y", innerHeight + barMargin.bottom - 40)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Screen Technology");

// Y-axis
svgBar.append("g")
    .call(d3.axisLeft(y));

// Y-axis label
svgBar.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -innerHeight / 2)
    .attr("y", -barMargin.left + 15)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Mean Energy Consumption (kWh/year)");

// Bars
svgBar.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.Screen_Tech))
    .attr("y", d => y(d.Mean))
    .attr("width", x.bandwidth())
    .attr("height", d => innerHeight - y(d.Mean))
    .attr("fill", d => color(d.Screen_Tech))
    .on("mouseover", function (event, d) {
    d3.select(this).transition().duration(200).attr("fill", d3.rgb(color(d.Screen_Tech)).darker(1));
    barTooltip.transition().duration(200).style("opacity", 1);
    barTooltip.html(`
        <strong>${d.Screen_Tech}</strong><br>
        ${d.Mean.toFixed(1)} kWh/year
    `)
    .style("left", (event.pageX + 10) + "px")
    .style("top", (event.pageY - 28) + "px");
    })
    .on("mousemove", function (event) {
    barTooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function (event, d) {
    d3.select(this).transition().duration(200).attr("fill", color(d.Screen_Tech));
    barTooltip.transition().duration(200).style("opacity", 0);
    });

// Legend at bottom
const legend = d3.select("#bar svg")
    .append("g")
    .attr("transform", `translate(${barWidth / 2}, ${barHeight - 20})`);

const legendItems = legend.selectAll(".legend-item")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "legend-item")
    .attr("transform", (d, i) => `translate(${i * 120 - (data.length - 1) * 60}, 0)`);

legendItems.append("rect")
    .attr("width", 18)
    .attr("height", 18)
    .attr("fill", d => color(d.Screen_Tech));

legendItems.append("text")
    .attr("x", 25)
    .attr("y", 14)
    .text(d => d.Screen_Tech)
    .style("font-size", "12px");
});
