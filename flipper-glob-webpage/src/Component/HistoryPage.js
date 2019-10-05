import React from 'react';

import * as moment from 'moment';
import * as timezone from 'moment-timezone';
import firebase from '../firebase.js';

export default class HistoryPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          history: [],
          // using moment library to set timezone to LA
          weekday: moment().weekday(),
          meal: "brunch"
        }
    }

    // called every second - will be used to log history
    tick() {
        //this.loadHistory();
    }
    // Automatically called by React everytime a component is mounted (loaded)
    // on to the webpage
    // Needed to load values from firebase after the page has been loaded
    componentDidMount() {
        this.loadHistory(moment().weekday(), "brunch");
        // // calls this.tick() every 1000 ms (every 1 second)
        // // sets up the clock function
        // this.intervalID = setInterval(() => this.tick(), 1000);
    }
      
    pullBreakfastHistory(day) {
        const database = firebase.database();
        let newHistory = [];
        database.ref('history').orderByChild("weekday").equalTo(day).on('value', (snapshot) => {
            let hist = snapshot.val();
            // Creates an array for each 5 minute interval over the 2 hours
            let sums = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            let numElements = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            // Loops through every element that has the same day as today
            for(let entry in hist) {
                if(hist[entry].meal === "breakfast") {
                    // Store entries into the array based on the time
                    if(hist[entry].hour === 7) {
                    sums[(hist[entry].minute - 30) / 5] += hist[entry].value;
                    ++numElements[(hist[entry].minute - 30) / 5];
                    }
                    else if(hist[entry].hour === 8) {
                    sums[hist[entry].minute/5 + 6] += hist[entry].value;
                    ++numElements[hist[entry].minute/5 + 6];
                    }
                    else {
                    sums[hist[entry].minute/5 + 18] += hist[entry].value;
                    ++numElements[hist[entry].minute/5 + 18];
                    }
                }
            }
            // Push elements into the newHistory array which will be used to update the website
            for(let i = 0; i < 24; ++i)
            {
                newHistory.push({
                    pastCount: sums[i] / numElements[i],
                    // Uses if statements to write the correct hour value
                    hour: (i < 6) ? 7 : (i < 18 ? 8 : 9),
                    minute: (i*5) % 60,
                });
            }
        });
        return newHistory;
    }
  
    pullBrunchHistory(day) {
        const database = firebase.database();
        let newHistory = [];
        database.ref('history').orderByChild("weekday").equalTo(day).on('value', (snapshot) => {
            let hist = snapshot.val();
            // Creates an array for each 5 minute interval over the 2 hours
            let sums = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            let numElements = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            // Loops through every element that has the same day as today
            for(let entry in hist) {
                if(hist[entry].meal === "brunch") {
                    // Store entries into the array based on the time
                    if(hist[entry].hour === 10) {
                    sums[(hist[entry].minute - 30) / 5] += hist[entry].value;
                    ++numElements[(hist[entry].minute - 30) / 5];
                    }
                    else if(hist[entry].hour === 11) {
                    sums[hist[entry].minute/5 + 6] += hist[entry].value;
                    ++numElements[hist[entry].minute/5 + 6];
                    }
                    else {
                    sums[hist[entry].minute/5 + 18] += hist[entry].value;
                    ++numElements[hist[entry].minute/5 + 18];
                    }
                }
            }
            // Push elements into the newHistory array which will be used to update the website
            for(let i = 0; i < 27; ++i)
            {
                newHistory.push({
                    pastCount: sums[i] / numElements[i],
                    // Uses if statements to write the correct hour value
                    hour: (i < 6) ? 10 : (i < 18 ? 11 : 12),
                    minute: (30 + i*5) % 60,
                });
            }
        });
        return newHistory;
    }
  
    pullLunchHistory(day) {
        const database = firebase.database();
        let newHistory = [];
        database.ref('history').orderByChild("weekday").equalTo(day).on('value', (snapshot) => {
            let hist = snapshot.val();
            // Lunch is only open for 1.75 hours, so we can have a shorter array
            let sums = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            let numElements = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            for(let entry in hist) {
                if(hist[entry].meal === "lunch") {
                    if(hist[entry].hour === 11) {
                    sums[(hist[entry].minute - 15) / 5] += hist[entry].value;
                    ++numElements[(hist[entry].minute - 15) / 5];
                    }
                    else {
                    sums[hist[entry].minute/5 + 9] += hist[entry].value;
                    ++numElements[hist[entry].minute/5 + 9];
                    }
                }
            }
            for(let i = 0; i < 21; ++i) {
                newHistory.push({
                    pastCount: sums[i] / numElements[i],
                    hour: (i < 9) ? 11 : 12,
                    minute: (i*5) % 60,
                });
            }
        });
        return newHistory;
    }
  
    // Similar code to pullBreakfastHistory()
    pullDinnerHistory(day) {
        const database = firebase.database();
        let newHistory = [];
        // CURRENTLY ONLY PULLS MONDAY DATA - FOR TESTING PURPOSES ONLY
        database.ref('history').orderByChild("weekday").equalTo(day).on('value', (snapshot) => {
            let hist = snapshot.val();
            let sums = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            let numElements = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            for(let entry in hist) {
                if(hist[entry].meal === "dinner") {
                    sums[((hist[entry].hour-17) * 12) + (hist[entry].minute/5)] += hist[entry].value;
                    ++numElements[((hist[entry].hour-17) * 12) + (hist[entry].minute/5)];
                }
            }
            for(let i = 0; i < 24; ++i) {
                newHistory.push({
                    pastCount: sums[i] / numElements[i],
                    hour: (i < 12) ? 17 : 18,
                    minute: (i*5) % 60,
                });
            }
        });
        return newHistory;
    }
  
    loadHistory(n, s) {
        console.log("loadHistory");
        // helpful site https://firebase.google.com/docs/database/admin/retrieve-data
        // .limitToFirst(n)  or .limitToLast(n)- only chooses certain n values
        // .orderByChild(" -- name of category -- ") sorts by that value 
        // Note: we might need to create multiple of the following calls to parse the data
        // It only allows one orderBy ise per function call
        // Or we'll just have to be smart about our limitTo calls and include smart if statements
        // Currently only pulls database values from the same weekday
        /*
        * Implementation: The following code pulls the history from previous days and averages
        *                 the values before putting it in the history
        * Current Limitations: Only looks at current hour, needs large history or is useless
        */
        let newHistory = [];
        let day = n;
        let meal = this.setMeal(n, s);
        if(meal === "dinner") {newHistory = this.pullDinnerHistory(day);}
        else if(meal === "lunch") {newHistory = this.pullLunchHistory(day);}
        else if(meal === "breakfast") {newHistory = this.pullBreakfastHistory(day);}
        else if(meal === "brunch") {newHistory = this.pullBrunchHistory(day);}
        
        this.setState({
            weekday: day,
            meal: meal,
            history: newHistory
        });
        this.forceUpdate();
    }

    setMeal(n, s) {
        console.log("setMeal " + s + " day: " + n);
        // setState() is the safer way to update state variables in js
        if((n !== 0 && n !== 6) && s === "brunch") {
            s = "breakfast";
        }
        else if((n === 0 || n === 6) && s === "breakfast") {
            s = "brunch";
        }
        console.log("new s " + s + " day: " + n);
        return s;
    }

render() {
    return (
        <div className='app'>
            <header>
                <div className='wrapper'>
                <h1>Flipper Glob</h1>
                </div>
            </header>
            <div className = {'nav-wrapper'}>
            <ul>
                <section className = {'nav-Bar'}>
                    <button onClick={() => this.loadHistory(0, "brunch")}>Sunday</button>
                    <button onClick={() => this.loadHistory(1, "breakfast")}>Monday</button>
                    <button onClick={() => this.loadHistory(2, "beakfast")}>Tuesday</button>
                    <button onClick={() => this.loadHistory(3, "breakfast")}>Wednesday</button>
                    <button onClick={() => this.loadHistory(4, "breakfast")}>Thursday</button>
                    <button onClick={() => this.loadHistory(5, "breakfast")}>Friday</button>
                    <button onClick={() => this.loadHistory(6, "brunch")}>Saturday</button>
                </section>
            </ul>
        </div>
            <div className='container'>
            <section className='display-count'>
                <h1>{this.state.weekday}</h1>
                <h1>{this.state.meal}</h1>
            </section>
            <section className='display-history'>
                <h1>History</h1>
                {this.state.history.map((element) => {
                    return (
                        <li>
                            <h4>Time: {element.hour === 12 ? 12: element.hour%12}:
                                {element.minute > 9 ? element.minute : '0'+element.minute} &nbsp;&nbsp;&nbsp;&nbsp; 
                                    Avg Pop: {Math.floor(element.pastCount)}
                            </h4>
                        </li>
                    )   
                })}
            </section>
            </div>
        </div>
        );
    }
}