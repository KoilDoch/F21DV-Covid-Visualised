/**
    Author: Kyle Dick
    HWU ID: H00301592
    Email: kd41@hw.ac.uk
    Last Edit: 21/03/2022
*/
import { DataMap } from "./DataMap.js";

/**
 * An object which represents a bar chart
 * 
 * SetData(data, out)
 *      This function calls the dataMap to set up the data into a format usable by the chart.
 *      Utilises a then() to wait for the data to finish setting, then calls the remaining 'set up' functions
 *      @param data - the source of this charts data (unfiltered)
 *      @param out - the area of the page to display this chart
 * 
 * SetOutput(out)
 *      This function creates a new svg to display the chart, removing any previous displays of itself before doing so.
 *      Measurements for the chart display are set in here relative to the 'out' objects dimensions
 *      @param out - the area of the page to display this chart
 * 
 * CreateDropDown()
 *      Creates a drop down select menu from which the user can change the data shown within this current dataset.
 *      Utilises the dataMap function FilterData(x,y) to reflect this change in the data
 * 
 * SetScales()
 *      Setup the scales required for the chart
 *      @param axisDrawn - is the axis drawn previously or not, used to decide whether append is neccessary
 *      
 * Update()
 *      Function used to update the chart when a change is made to the data, or the data is set for the first time.
 *      Contains the join call and its associated enter, update and exit calls
 * 
 * DisplayValue()
 *      Hover function for the bars, displays a value when hovered
 *      @param d - the mouse event
 *      @param i - data associated 
 *
 * HideValue()
 *      Hover function for the bars, removes a displayed value
 */
export function BarChart() {
    let obj = {};
    let dataMap = DataMap();        // object from which the data is sourced
    let svg, xScale, yScale, width;
    // set the dimensions and margins of the graph 
    const margin = {top: 60, right: 30, bottom: 70, left: 90};
    const height = 400 - margin.top - margin.bottom;

    obj.SetData = (data, out) => {
        console.log('Changing Chart Dataset...');
        dataMap.SetData(data).then(() => {
            console.log("Datamap Set!");
            obj.SetOutput(out);
            obj.CreateDropDown();
            obj.SetScales(1);
            obj.Update();
        });
    }

    // chooses where the output should be
    obj.SetOutput = (out) => {
        // remove the current chart to change output
        d3.select('#currentDisplay').remove();
        width = dataMap.GetDataMap().length * 10; 
        console.log(`width: ${width}%`);

        svg = out.append('svg')
                .attr('width', `${width}%`)
                .attr('height', height + margin.left + margin.right)
                .attr('margin', 'auto')
                .attr('id', 'currentDisplay');
    }

    /**
     * Creates a drop down select menu from which the user can change the data shown within this current dataset.
     * Utilises the dataMap function FilterData(x,y) to reflect this change in the data
     */
    obj.CreateDropDown = () => {
        console.log('Creating Dropdown...')

        // add a select element to the header element
        let dropdown = d3.select('#header')
                        .append('select')
                        .attr('id', 'dropDown')
                        .on('change', () => {
                            // on a change of selection, change data to reflect
                            console.log('Changing Currently Shown Data...')

                            // get data from the node value
                            let newCategory = d3.select("#dropDown").node().value;
                            console.log(`Changing to ${newCategory}`);

                            // filter the data then update the chart
                            dataMap.FilterData('location', newCategory);
                            obj.Update();
                        });

        // add options to the drop down using the categories
        dropdown.selectAll('option')
            .data(dataMap.GetCategories())
            .enter()
            .append("option")
                .attr('value', d => {return d})
                .text(d => {return d});

        console.log('Dropdown created!');
    }

    //************** AXES ******************//

    /**
     * Setup the scales required for the chart
     * @param axisDrawn - is the axis drawn previously or not, used to decide whether append is neccessary
     */
    obj.SetScales = (axisDrawn) => {
        console.log('setting scales...');

        let data = dataMap.GetDataMap();
        
        // get the boundaries of the y axis
        let extent = d3.extent(data, d => {
            return +d.value;
        })
        
        // banded scale due to ordinal nature of x
        xScale = d3.scaleBand()
            .domain(data.map( (d) => {
                return d.key;
            }))
            // scale to the size of the output
            .range([margin.left, width]);

        // Y scale and axis
        // get y scale using largest value in the specified category
        yScale = d3.scaleLinear()
            .domain([0, extent[1]])
            // scale to size of the output
            .range([height,0]);


        // append or select depending on if the axis already exists
        let xAxis, yAxis;
        if(axisDrawn){
            xAxis = svg.append('g')
                .attr('class', 'xAxis')
                .attr('transform', `translate(0, ${height})`);

            yAxis = svg.append('g')
            .attr('class', 'yAxis')
            .attr('transform', `translate(${margin.left},0)`)
        } else {
            xAxis = d3.select('.xAxis');
            yAxis = d3.select('.yAxis');
        }

        // transition the appearances of each axis
        xAxis.transition()
            .duration(1000)
            .ease(d3.easePoly)
            .call(d3.axisBottom(xScale))
            .selectAll('text')
            .style('font-size', '8px')
            .attr('y', 0)
            .attr('x', 50)
            .attr('transform', 'rotate(90)');

        yAxis.transition()
            .duration(1000)
            .ease(d3.easePoly)
            .call(d3.axisLeft(yScale))
            
            
        console.log('Scales Created!');
    }

    //************* DRAWING AND UPDATE *************//
    /**
    *   Function used to update the chart when a change is made to the data, or the data is set for the first time.
    *   Contains the join call and its associated enter, update and exit calls
    */
    obj.Update = () => {
        // get the data and set the scales (already drawn)
        let data = dataMap.GetDataMap();
        obj.SetScales(0);

        // create a reference to all the existing rect (if any)
        let ref = svg.selectAll('rect')
            .data(data);

        // decide what to do with the data for each entry
        ref.join(
            // new rect required
            enter => {
                enter.append('rect')
                    // attach events to show values
                    .on('mouseover', DisplayValue)
                    .on('mouseout', HideValue)
                    .merge(ref)
                    .attr('x', (d) => {
                        if(d.key == 'Afghanistan')
                            console.log('in enter!');
                        // offset the name slightly
                        return xScale(d.key);
                    })
                    .attr("width", xScale.bandwidth()) 
                    .attr('y', yScale(0))
                    // grow the bars upwards
                    .transition()
                    .duration(1000)
                    .attr('y', d => { 
                        return yScale(+d.value)
                    })
                    .attr("height", function(d) { 
                        // offset the height from out height
                        return height - yScale(+d.value);
                    });
            },
            // rect exists, requires update
            update => {
                // shrink/grow to required height
                update.transition() 
                    .duration(1000) 
                    // without this, will not appear at the correct height
                    .attr('y', d => { 
                        if(d.key == 'Afghanistan')
                            console.log('in update!');
                        return yScale(+d.value)
                    })
                    .attr("height", function(d) { 
                        return height - yScale(+d.value);
                    });
            },
            // rect no longer needed
            exit => {
                // fade out over half a second, then remove
                exit.transition()
                    .duration(1000)
                    .style("opacity",0)
                    .remove();
            }
        );
    }

    //************* EVENTS *************//

    /**
     * Hover function for the bars, displays a value when hovered
     * @param d - the mouse event
     * @param i - data associated 
     */
    let DisplayValue = (d,i) => {
        //display the value
        svg.append("text") 
            .attr('class', 'val')  
            .attr('x', function() { 
                return xScale(i.key);
            }) 
            .attr('y', function() { 
                return yScale(i.value) - 5;
            }) 
            .text( function(d) { return +i.value; } )
            .style('color', 'red'); // Value of the text 
    }

    /**
     * Hover function for the bars, removes a displayed value
     */
    let HideValue = () => {
        d3.selectAll(".val").remove();
    }

    return obj;
}
