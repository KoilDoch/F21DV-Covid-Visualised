/**
    Author: Kyle Dick
    HWU ID: H00301592
    Email: kd41@hw.ac.uk
    Creation Date: 15/03/2022
    Laste Edit: 15/03/2022
*/
import { Record } from "./js/Record.js";
const dataURL = `https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/latest/owid-covid-latest.csv`;

d3.csv(dataURL, (data) => {
    new Record(data);
});