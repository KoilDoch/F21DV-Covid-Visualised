/**
    Author: Kyle Dick
    HWU ID: H00301592
    Email: kd41@hw.ac.uk
    Last Edit: 21/03/2022
*/

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
export function LineChart() {
    let obj = {};
    let data = [];
    let svg, xScale, yScale, width;
    // set the dimensions and margins of the graph 
    const margin = {top: 30, right: 15, bottom: 100, left: 70};
    const height = 400 - margin.top - margin.bottom;

    /**
     * Set the data to be used for this chart.
     * Call other functions to set up the components
     * @param {data to be used} dataSet 
     * @param {area to display chart} out 
     */
    obj.CreateLineChart = (dataSet, out) => {
        // set the data
        data = dataSet;

        // set where the chart is displayed
        obj.SetOutput(out);
        // initialise the scales
        obj.SetScales(true);
        // show starting data
        obj.Update(data);
    }

    /**
     * This function creates a new svg to display the chart, removing any previous displays of itself before doing so.
     *      Measurements for the chart display are set in here relative to the 'out' objects dimensions
     *      @param {the area of the page to display this chart } out
     */
    obj.SetOutput = (out) => {
        // remove the current chart to change output
        d3.select('#currentDisplay').remove();
        width = data.length * 10;

        svg = out.append('svg')
                .attr('preserveAspectRatio', 'xMinYMin meet')
                .attr('width', width)
                .attr('height', height + margin.top + margin.bottom)
                .attr('viewBox', `0 0 ${width} ${height + margin.top + margin.bottom}`)
                .attr('margin', 'auto')
                .attr('id', 'currentDisplay');
    }

    //************** AXES ******************//

    /**
     * Setup the scales required for the chart
     * @param axisDrawn - is the axis drawn previously or not, used to decide whether append is neccessary
     */
    obj.SetScales = (axisDrawn) => {
        console.log('setting scales...');
        
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
            .range([margin.left, 2000]);

        

        // Y scale and axis
        // get y scale using largest value in the specified category
        yScale = d3.scaleLinear()
            .domain([0, extent[1]])
            // scale to size of the output
            .range([height+margin.top,margin.top]);

        console.log('Scales Created!');
        console.log('Drawing Axes');

        // append or select depending on if the axis already exists
        let xAxis, yAxis;
        if(axisDrawn){
            
            xAxis = svg.append('g')
                .attr('class', 'xAxis')
                .attr('transform', `translate(0, ${height+margin.top})`);
            
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
            .call(d3.axisLeft(yScale));

        console.log('Axes Drawn!');
    }

    //************* DRAWING AND UPDATE *************//
    /**
    *   Function used to update the chart when a change is made to the data, or the data is set for the first time.
    *   Contains the join call and its associated enter, update and exit calls
    */
    obj.Update = (updateData) => {
        data = updateData;
        obj.SetScales(0);

        // create a reference to all the existing rect (if any)
        let ref = svg.selectAll('circle')
            .data(data);

        // decide what to do with the data for each entry
        ref.join(
            // new rect required
            enter => {
                enter.append('circle')
                    // attach events to show values
                    .on('mouseover', DisplayValue)
                    .on('mouseout', HideValue)
                    .merge(ref)
                    .attr('cx', (d) => {
                        return xScale(d.key);
                    })
                    .attr("r", '2') 
                    .style('fill', 'blue')
                    .attr('cy', yScale(0))
                    // grow the bars upwards
                    .transition()
                    .duration(1000)
                    .attr('cy', d => { 
                        return yScale(+d.value)
                    });
            },
            // rect exists, requires update
            update => {
                // shrink/grow to required height
                update.transition() 
                    .duration(1000) 
                    .attr('cx', (d) => {
                        return xScale(d.key);
                    })
                    // without this, will not appear at the correct height
                    .attr('cy', d => { 
                        return yScale(+d.value)
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
