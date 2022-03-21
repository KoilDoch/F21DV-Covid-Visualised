/**
    Author: Kyle Dick
    HWU ID: H00301592
    Email: kd41@hw.ac.uk
    Last Edit: 21/03/2022
*/

/**
 * This function creates an object which manages the data used for the charts.
 * It takes the raw data from a URL and creates an object from it, giving only relevant data to the charts.
 * 
 * Async SetData(dataURL)
 *      Takes the data from a url and puts it into a 'raw' list.
 *      Afterwords calls SetCategories to get the headers.
 *      
 * SetCategories()
 *      returns the properties of the objects in the list
 *      Afterwards calls FilterData(x , y) on the location and first category
 * 
 * GetCategories()
 *      Getter function for categories variable
 * 
 * FilterData(x , y)
 *      x and y represent the respective categories for each axis
 *      This function filters according to them and creates a new dictionary
 *          key: x value
 *          value: y value
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
    let timeframe = '2022-02-08';

    /**
     *  Async SetData(dataURL)
     *      Takes the data from a url and puts it into a 'raw' list.
     *      Afterwords calls SetCategories to get the headers.
     */
    obj.SetData = async (dataURL) => {
        // must be returned as a promise
        return new Promise((resolve) => {
            console.log('Getting Data...');

            // get the data from url and push it into the raw array
            d3.csv(dataURL, (d) => {
                dataRaw.push(d);
            }).then(() => {
                console.log('Data Recieved!');
                obj.SetCategories();

                // call the resolve function to return to caller of SetData
                resolve(categories);
            })
        });
    }

    /**
     * SetCategories()
     *      returns the properties of the objects in the list
     *      Afterwards calls FilterData(x , y) on the location and first category
     */
    obj.SetCategories = () => {
        console.log('Setting Categories...');

        // get list of categories for this dataset
        for(let cat in dataRaw[0]) {
            categories.push(cat);
        }

        // the first 4 of the dataset are identifiers so remove
        // these charts just uses the location as identifier
        categories = categories.slice(4);
        console.log('Categories Set!');

        // filter by location, using the first category
        obj.FilterData('location', categories[0]);
    }

    /**
     * GetCategories()
     *      Getter function for categories variable
     */
    obj.GetCategories = () => {
        return categories;
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
    * GetDataMap()
    *      Getter function for dataMap variable
    */
    obj.GetDataMap = () => {
        return dataMap;
    }

    return obj;
}