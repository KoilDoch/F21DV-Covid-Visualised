/**
    Author: Kyle Dick
    HWU ID: H00301592
    Email: kd41@hw.ac.uk
    Creation Date: 15/03/2022
    Last Edit: 15/03/2022
*/
import { BarChart } from "./js/BarChart.js";

// location of the data
const dataURL = `https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/latest/owid-covid-latest.csv`;
const gridLayout = 4;

// create the container for the records
d3.select("body")
    .append("div")
    .attr("id", "container")
    .style("grid-template-columns", "repeat("+gridLayout+", 1fr)");

// create a new bar chart
let barChart = BarChart().CreateChart(
    dataURL,
    d3.select('body')
);

window.updateBar = (category) => {
    barChart.update(category);
}
