/**
    Author: Kyle Dick
    HWU ID: H00301592
    Email: kd41@hw.ac.uk
    Creation Date: 15/03/2022
    Last Edit: 15/03/2022
*/

/**
 * Class represents a record of data.
 */
class Record{
    constructor(data, i){
        //console.log(i)
        this.data = data;
        //console.log(this.data);

        // div holds svg and buttons
        this.div = d3.select("#container")
            .append("div")
            .attr("class", "record")
            .attr("id", this.data.iso_code + "Container");
        
        this.CreateButtons();
    }

    /**
     * Creates the buttons to switch between charts
     */
    CreateButtons() {
        let chartTypes = ["bar", "line", "pie"];

        // add a button for each type
        for(let i = 0; i < 3; i++){
            this.div
                .append("button")
                .attr("class", "chartButton")
                .attr("id", this.data.iso_code + "_" + chartTypes[i])
                .style("background", () => {
                    return `./assets/${chartTypes[i]}.png`;
                });
        }
    }
}

export { Record };