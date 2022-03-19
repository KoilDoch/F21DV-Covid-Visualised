/**
    Author: Kyle Dick
    HWU ID: H00301592
    Email: kd41@hw.ac.uk
    Creation Date: 15/03/2022
    Last Edit: 16/03/2022
*/

export function BarChart() {
    let obj = {};     
    let data = [];
    let dataMap = [];
    let categories = [];
    let svg, currCategory, xScale, yScale, width;
    // set the dimensions and margins of the graph 
    const margin = {top: 60, right: 30, bottom: 70, left: 60};
    const height = 400 - margin.top - margin.bottom;

    obj.CreateChart = (url, out) => {
        obj.setData(url);
        obj.setOutput(out);
    }

    // set the data to be used for this chart
    obj.setData = (url, category = '') => {
        d3.csv(url, (d) => {
            data.push(d);
        }).then( () => {
            // get the categories from the headers
            obj.GetCatergories();
            obj.filterData();
        })
    }

    // chooses where the output should be
    obj.setOutput = (out) => {
        // remove the current chart to change output
        d3.select('#currentDisplay').remove();
        width = data.length * 10 - margin.left - margin.right; 

        svg = out.append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.left + margin.right)
                .attr('margin', 'auto')
                .attr('id', 'currentDisplay');
    }

    // filter from data source what is to be shown
    obj.filterData = () => {
        dataMap = data.map((d) => {
            return {
                key: d.location,
                value: d[currCategory]
            }
        }); 

        obj.update();
    }
    
    obj.GetCatergories = () => {
        // get list of categories for this dataset
        categories = []
        for(let cat in data[0]) {
            categories.push(cat);
        }
        categories = categories.slice(4)
        currCategory = categories[0];

        obj.createDropDown();
    }

    

    // create drop down menu to change data shown
    obj.createDropDown = () => {
        let dropdown = d3.select('#header')
                        .append('select')
                        .attr('id', 'dropDown')
                        .on('change', () => {
                            currCategory = d3.select("#dropDown").node().value;
                            obj.filterData();
                        });

        dropdown.selectAll('option')
            .data(categories)
            .enter()
            .append("option")
                .attr('value', d => {return d})
                .text(d => {return d});
    }

    //************* DRAWING AND UPDATE *************//

    obj.update = () => {
        console.log(currCategory);
        console.log(dataMap);
        obj.setScales(currCategory);
        

        let ref = svg.selectAll('rect')
            .data(dataMap)

        xScale.domain(dataMap.map(d => d.key));

        d3.select("#bottomAxis")
            .call(d3.axisBottom(xScale));
        d3.select("#topAxis")
            .call(d3.axisTop(xScale));

            ref.join(
            enter => {
                enter.append('rect')
                    .on('mouseover', displayValue)
                    .on('mouseout', hideValue)
                    .merge(ref)
                    .attr('x', (d) => { 
                        return xScale(d.key) + 2
                    })
                    .attr('y', d => { 
                        console.log(yScale(0));
                        return yScale(+d.value)
                    })
                    .attr("width", xScale.bandwidth()-4) 
                    .transition()
                    .duration(1000)
                    .attr("height", function(d) { 
                        return height - yScale(+d.value);
                    });
            },
            update => {
                update.transition() 
                    .duration(1000) 
                    .attr('y', d => { 
                        return yScale(+d.value)
                    })
                    .attr("height", function(d) { 
                        console.log(d);
                        return height - yScale(+d.value);
                    });
            },
            exit => {
                exit.transition()
                    .duration(500)
                    .attr("x", width)
                    .style("opacity",0)
                    .remove();
            }
        );
    }

    //************** AXES ******************//
    obj.setScales = () => {
    // X scale and axis
    xScale = d3.scaleBand()
        .domain(dataMap.map( (d) => {
            return d.key;
        }))
        .range([margin.left, width]);

    svg.append('g')
        .attr('class', 'xAxis')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .style('font-size', '8px')
        .attr('y', 0)
        .attr('x', 50)
        .attr('transform', 'rotate(90)');

    // Y scale and axis
    // get y scale using largest value in the specified category
    yScale = d3.scaleLinear()
        .domain([0, d3.max(dataMap, (d) => {
            return +d.value
        }
        )])
        .range([height,0]);

    let yAxis = d3.axisLeft(yScale);
    svg.append('g')
        .attr('class', 'yAxis')
        .attr('transform', `translate(${margin.left},0)`)
        .call(yAxis);
    }

    //************* EVENTS *************//

    // displays the value when hovering over the bar
    let displayValue = (d,i) => {
        console.log(currCategory);
        //display the value
        svg.append("text") 
            .attr('class', 'val')  
            .attr('x', function() { 
                return xScale(i.key);
            }) 
            .attr('y', function() { 
                return yScale(i.value) - 5;
            }) 
            .text( function(d) { return +i.value; } ); // Value of the text 
    }

    // hide the value of the text when not hovering
    let hideValue = () => {
        d3.selectAll(".val").remove();
    }

    return obj;
}
