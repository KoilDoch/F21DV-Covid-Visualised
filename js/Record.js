/**
    Author: Kyle Dick
    HWU ID: H00301592
    Email: kd41@hw.ac.uk
    Creation Date: 15/03/2022
    Laste Edit: 15/03/2022
*/
class Record{
    constructor(data){
        this.data = data;
        console.log(this.data);
        this.div = d3.select("#container")
            .append("div");
        
        this.CreateButtons();
    }

    CreateButtons() {
        this.div
            .attr("id", this.data.iso_code + "_Container");
        
        for(let i = 0; i < 3; i++){
            this.div
                .append("button");
        }
    }
}

export { Record };