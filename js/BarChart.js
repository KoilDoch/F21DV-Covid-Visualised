/**
    Author: Kyle Dick
    HWU ID: H00301592
    Email: kd41@hw.ac.uk
    Creation Date: 15/03/2022
    Last Edit: 16/03/2022
*/

export function BarChart() {
    let obj = {}        
    let data = []
    let svg, category;
    // set the dimensions and margins of the graph 
    const margin = {top: 60, right: 30, bottom: 70, left: 60}; 
    let width;
    const height = 400 - margin.top - margin.bottom;
    // get colours
    let colors = d3.scaleOrdinal().domain(data).range(["red","blue","green"])
    let xScale, yScale;

    obj.createChart = (out, url) => {
        obj.setData(url, out);
    }

    obj.createDropDown = () => {
        let categories = []
        for(let cat in data[0]) {
            categories.push(cat);
        }
        categories = categories.slice(4)

        let dropdown = d3.select('#header')
                        .append('select')
                        .attr('class', 'dropBtn')
                        .text('Sort By')
                        .attr('class', 'buttonText');

        let options = dropdown.selectAll('option')
            .data(categories)
            .enter()
            .append("option")
            .attr('class', 'dropResult');

        options.text(d => {return d})
            .attr('value',d => {
                console.log('updating');
                category = d;
                return 'updateBar(d)';
            });
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

    // set the data to be used for this chart
    obj.setData = (url, out) => {
        d3.csv(url, (d,i) => {
            if(d.continent.length > 0){
                data.push(d);
            }
            
        }).then( () => {
            
            obj.setOutput(out);
            obj.setScales(category);
            obj.createDropDown();
        })
    }

    // set the scales to be used for the chart
    obj.setScales = (category) => {
        //******* X AXIS ********//
        xScale = d3.scaleBand()
            .domain(data.map( (d) => {
                return d.location;
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

        //******* Y AXIS ********//
        // get y scale using largest value in the specified category
        yScale = d3.scaleLinear()
            .domain([0, d3.max(data, (d) => {
                return +d[category]
            }
            )])
            .range([height,0]);

        let yAxis = d3.axisLeft(yScale);
        svg.append('g')
            .attr('class', 'yAxis')
            .attr('transform', `translate(${margin.left},0)`)
            .call(yAxis);
    }

    obj.update = (category) => {
        let ref = svg.selectAll('rect')
            .data(data)

        xScale.domain(data.map(d => d.location));

        d3.select("#bottomAxis")
            .call(d3.axisBottom(xScale));
        d3.select("#topAxis")
            .call(d3.axisTop(xScale));

            ref.join(
            enter => {
                enter.append('rect')
                    .on('mouseover', obj.displayVal)
                    .on('mouseout', obj.hideValue)
                    .merge(ref)
                    .attr('x', (d) => { 
                        return xScale(d.location) + 2
                    })
                    .attr('y', d => { 
                        return yScale(d[category])
                    })
                    .attr("width", xScale.bandwidth()-4) 
                    .transition()
                    .duration(1000)
                    .attr("height", function(d) { 
                        return height - yScale(+d[category]);
                    });
            },
            update => {
                update.transition() 
                    .duration(1000) 
                    .attr('x', (d,i) => { 
                        return xScale(i)
                    })
                    .attr('y', d => { 
                        return yScale(d[category])
                    })
                    .attr("width", xScale.bandwidth()) 
                    .attr("height", function(d) { 
                        return height - yScale(d[category]);
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

    // displays the value when hovering over the bar
    obj.displayValue = (d, i) => {
        //display the value
        svg.append("text") 
            .attr('class', 'val')  
            .attr('x', function() { 
                return x(i.group); 
            }) 
            .attr('y', function() { 
                return y(i.value) - 15; 
            }) 
            .text( function(d) { return '$' + i.value; } ); // Value of the text 
    }

    // hide the value of the text when not hovering
    obj.hideValue = () => {
        d3.selectAll(".val").remove();
    }

    return obj;
}
