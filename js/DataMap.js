/**
    Author: Kyle Dick
    HWU ID: H00301592
    Email: kd41@hw.ac.uk
    Last Edit: 21/03/2022
*/

import { BarChart } from "./BarChart.js";
import { LineChart } from "./LineChart.js";

/**
 * This function creates an object which manages the data used for the charts.
 * It takes the raw data from a URL and creates an object from it, giving only relevant data to the charts.
 * 
 * SetData(dataURL, out)
 *      Takes the data from a url and puts it into a 'raw' list.
 *      @param {the dataset to be used} dataURL
 *      @param {the area to display the chart} out
 *      Afterwords calls functions to set up components based on this data
 *      
 * SetCategories()
 *      returns the properties of the objects in the list
 *      Afterwards calls FilterData(x , y) on the location and first category
 *
 * Creates a chart from the dataset
 *      @param {Where to display the chart} out 
 *   
 * FilterData(x , y)
 *      x and y represent the respective categories for each axis
 *      This function filters according to them and creates a new dictionary
 *          key: x value
 *          value: y value
 * 
 * GetCategories()
 *      Getter function for categories variable
 * 
 * GetDataMap()
 *      Getter function for dataMap variable
 * 
 * @returns Datamap object
 */
export function DataMap() {
    let obj = {};           // used to return a usable object
    let dataRaw = [];       // the unfiltered data
    let categories = [];    // the list of possible categories to filter by
    let dataMap = [];       // the filtered data
    let locations = [];
    let timeframe = '2022-02-08';
    let chart, x, y;

    const ChartType = {
        BAR: 'bar',
        LINE: 'line'
    }

    /**
     *  SetData(dataURL)
     *      Takes the data from a url and puts it into a 'raw' list.
     *      Afterwords calls functions to set up components based on this data
     */
    obj.SetData = (dataURL, out) => {
            console.log('Getting Data...');
            // get the data from url and push it into the raw array
            d3.csv(dataURL, (d) => {
                dataRaw.push(d);
            }).then(() => { 
                console.log('Data Recieved!');

                // get the categories of the data
                obj.SetCategories();
                // create an interactive element from data
                obj.CreateYDropDown();
                // create a visual representation of the data
                obj.CreateChart(out);
            })
    }

    /**
     * SetCategories()
     *      returns the properties of the objects in the list
     *      Afterwards calls FilterData(x , y) on the location and first category
     */
    obj.SetCategories = () => {
        console.log('Setting Categories...');

        // temporary pin the x always on location
        x = 'location';

        // get list of categories for this dataset
        for(let cat in dataRaw[0]) {
            categories.push(cat);
        }

        // the first 4 of the dataset are identifiers so remove
        // these charts just uses the location as identifier
        categories = categories.slice(4);

        // set the current y to the first category
        y = categories[0];

        console.log('Categories Set!');

        // filter by location, using the first category
        obj.FilterData('location', categories[0]);
    }

    /**
     * Creates a drop down select menu from which the user can change the data shown within this current dataset.
     * Utilises the dataMap function FilterData(x,y) to reflect this change in the data
     */
     obj.CreateYDropDown = () => {
        console.log('Creating Dropdown...');

        // geta reference to the header element
        let header = d3.select('#header');

        // add a select element to the header element
        let dropdown = header.append('select')
                        .attr('id', 'dropDown')
                        .on('change', SetY);

        // add options to the drop down using the categories
        dropdown.selectAll('option')
            .data(categories)
            .enter()
            .append("option")
                .attr('value', d => {return d})
                .text(d => {return d});

        // add a title to the chart
        header.append('div')
                        .attr('class', 'title')
                        .text('Showing ' + x + " against " + y);

        console.log('Dropdown created!');
    }

    function SetY() {
        // on a change of selection, change data to reflect
        console.log('Changing Currently Shown Data...')

        // get data from the node value
        let y = d3.select("#dropDown").node().value;
        console.log(`Changing to ${y}`);

        // change the title of the chart
        d3.select('.title')
            .text('Showing ' + x + " against " + y);

        // filter the data then update the chart
        obj.FilterData(x, y);

        // update the chart
        chart.Update(dataMap);
    }

    /**
     * Creates a chart from the dataset
     * @param {Where to display the chart} out 
     */
     obj.CreateChart = (out) => {
        // create a new chart
        // chart = BarChart();
        // chart.CreateBarChart(dataMap, out);

        chart = LineChart();
        chart.CreateLineChart(dataMap, out)
    }

    /**
    * FilterData(x , y)
    *      x and y represent the respective categories for each axis
    *      This function filters according to them and creates a new dictionary
    *          key: x value
    *          value: y value
    */
     obj.FilterData = (x , y) => {
        console.log('Filtering Data...');

        // create a dictionary with key: x, value: y, with an initial empty array
        dataMap = dataRaw.reduce((out, d) => {
            // callback function

            // only allow if neither is undefined
            if(d[x] && d[y]) {
                out.push({
                    key: d[x],
                    value: d[y]
                });
            }

            // return
            return out;
        }, []);
        
        console.log(`Data Filtered: x[${x}] y[${y}]`);
    }

    /**
     * GetCategories()
     *      Getter function for categories variable
     */
    obj.GetCategories = () => {
        return categories;
    }

    /**
    * GetDataMap()
    *      Getter function for dataMap variable
    */
    obj.GetDataMap = () => {
        return dataMap;
    }

    return obj;
}