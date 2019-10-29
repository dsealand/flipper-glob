import React from "react";

import * as moment from "moment";
import firebase from "../firebase.js";

import Chart from "chart.js";

export default class HistoryPage extends React.Component {
    // Creating the base for the chart
    chartRef = React.createRef();
    database = firebase.database();
    chart;
    constructor() {
        super();
        this.state = {
          history: [],
          // using moment library to set timezone to LA
          day: moment().weekday(),
          meal: "brunch"
        }
    }

    // This is used to synchronize the state updates with the graph
    // updates
    updateState(day, meal, newHistory) {
        // This works by calling letting setState() know that the call
        // to updateGraph() depends on the state values, so it will ensure
        // the values are synched before the function call
        this.setState({
            day: day,
            meal: meal,
            history: newHistory
        }, () => this.updateGraph());
    }

    updateGraph() {
        // Honestly don"t know what this line does, but it makes it work
        const myChartRef = this.chartRef.current.getContext("2d");
        // Loading firebase data into local arrays for ease of access
        var label = [];
        var data = [];
        this.state.history.forEach(function(elem) {
            // formatting data
            label.push((elem.hour===12 ? 12:elem.hour%12)+
            ":" + (elem.minute > 9 ? elem.minute : "0"+elem.minute));
            data.push(elem.pastCount);
        });
        if(this.chart) {
            this.chart.destroy();
        }

        // reference: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createLinearGradient
        // Arguments: x0,y0,x1,y1 where 0 is start point and 1 is end point
        // Creates gradient along line given by two coordinates
        var fillPattern = myChartRef.createLinearGradient(0,50,0,300);
        // reference: https://www.w3schools.com/tags/canvas_addcolorstop.asp
        // integer is value that represents the position between start and end in gradient
        fillPattern.addColorStop(.75, 'green');
        fillPattern.addColorStop(.5, 'yellow');
        fillPattern.addColorStop(.1, 'red');
        this.chart = new Chart(myChartRef, {
            type: "line",
            data: {
                //Bring in data
                labels: label,
                datasets: [
                    {
                        // Set color to white with a darkness value of .35 (grey)
                        // backgroundColor: "rgba(0,0,0,.35)",
                        backgroundColor: fillPattern,
                        data: data
                    }
                ]
            },
            options: {
                animation: {duration: 0},
                // hide title and other misc info
                legend: {display: false},
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            stepSize: 10
                        }
                    }]
                }
            }
        });
    }

    tick() {
        this.updateGraph();
    }

    // Automatically called by React everytime a component is mounted (loaded)
    // on to the webpage
    // Needed to load values from firebase after the page has been loaded
    componentDidMount() {
        // From https://www.sitepoint.com/graph-data-with-firebase/
        // This caches the data locally so it can be easily retrieved
        // avoids error of not loading data on initial click
        this.database.ref("history").on("value", () => {});

        this.loadHistory(moment().weekday(), "brunch")

        this.intervalID = setInterval(() => this.tick(), 500);

        // Refreshes the graph after the data has been pulled from firebase
        // IMPORTANT: This time is hard coded and may not be enough once 
        // we have more values stored in the database!
        // setTimeout(() => this.updateGraph(), 500);
    }

    // Needed to remove error when navigating away from this page
    componentWillUnmount() {
        clearInterval(this.intervalID);
        this.intervalID = null;
      }

    pullBreakfastHistory(day) {
        let newHistory = [];
        // searches through database looking for entries with the day matching the current day
        this.database.ref("history").orderByChild("weekday").equalTo(day).on("value", (snapshot) => {
            let hist = snapshot.val();
            // Creates an array for each 5 minute interval over the 2 hours
            let sums = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            let numElements = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            // Loops through every element that has the same meal as the current meal
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
                    minute: (i*5 + 30) % 60 ,
                });
            }
        });
        return newHistory;
    }
  
    // Same implementation as pullBreakfastHistory
    pullBrunchHistory(day) {
        let newHistory = [];
        this.database.ref("history").orderByChild("weekday").equalTo(day).on("value", (snapshot) => {
            let hist = snapshot.val();
            let sums = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            let numElements = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            for(let entry in hist) {
                if(hist[entry].meal === "brunch") {
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
            for(let i = 0; i < 27; ++i)
            {
                newHistory.push({
                    pastCount: sums[i] / numElements[i],
                    hour: (i < 6) ? 10 : (i < 18 ? 11 : 12),
                    minute: (30 + i*5) % 60,
                });
            }
        });
        return newHistory;
    }
  
    // Same implenetation as pullBreakfastHistory
    pullLunchHistory(day) {
        let newHistory = [];
        this.database.ref("history").orderByChild("weekday").equalTo(day).on("value", (snapshot) => {
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
                    hour: (i < 12) ? 11 : 12,
                    minute: (i*5) % 60,
                });
            }
        });
        return newHistory;
    }
  
    // Same implenetation as pullBreakfastHistory
    pullDinnerHistory(day) {
        let newHistory = [];
        this.database.ref("history").orderByChild("weekday").equalTo(day).on("value", (snapshot) => {
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
  
    // Buttons only can call one function, so I combined the necessary update info
    // into this function. It currently updates the day, meal, and history on each call
    loadHistory(n, s) {
        // helpful site https://firebase.google.com/docs/database/admin/retrieve-data
        // .limitToFirst(n)  or .limitToLast(n)- only chooses certain n values
        // .orderByChild(" -- name of category -- ") sorts by that value 
        let newHistory = [];
        let day = n;
        let meal = this.setMeal(n, s);
        if(meal === "dinner") {newHistory = this.pullDinnerHistory(day);}
        else if(meal === "lunch") {newHistory = this.pullLunchHistory(day);}
        else if(meal === "breakfast") {newHistory = this.pullBreakfastHistory(day);}
        else if(meal === "brunch") {newHistory = this.pullBrunchHistory(day);}
        // Passes all information to one function that will handle the setState() update
        // to minimize collisions with asynchronous updates
        this.updateState(day, meal, newHistory);
    }

    setMeal(n, s) {
        if((n !== 0 && n !== 6) && s === "brunch") {
            s = "breakfast";
        }
        else if((n === 0 || n === 6) && s === "breakfast") {
            s = "brunch";
        }
        return s;
    }

    // Used to convert integer into a human readable day for the display
    getDay() {
        if(this.state.day === 0) return "Sunday";
        else if(this.state.day === 1) return "Monday";
        else if(this.state.day === 2) return "Tuesday";
        else if(this.state.day === 3) return "Wednesday";
        else if(this.state.day === 4) return "Thursday";
        else if(this.state.day === 5) return "Friday";
        else if(this.state.day === 6) return "Saturday";
    }

render() {
    return (
        <div className="app">
            <header>
              <div className="wrapper">
                <h1>Turnstile</h1>
              </div>
          </header>
        <div>
            <ul>
                {/* Buttons that change the displayed day */}
                <section className = "button-Bar">
                    <li>
                        <day><button onClick={() => this.loadHistory(0, "brunch")}>
                                Sunday</button></day>
                        <day><button onClick={() => this.loadHistory(1, "breakfast")}>
                                Monday</button></day>
                        <day><button onClick={() => this.loadHistory(2, "breakfast")}>
                                Tuesday</button></day>
                        <day><button onClick={() => this.loadHistory(3, "breakfast")}>
                                Wednesday</button></day>
                        <day><button onClick={() => this.loadHistory(4, "breakfast")}>
                                Thursday</button></day>
                        <day><button onClick={() => this.loadHistory(5, "breakfast")}>
                                Friday</button></day>
                        <day><button onClick={() => this.loadHistory(6, "brunch")}>
                                Saturday</button></day>
                    </li>
                </section>
            </ul>
            <ul>
                {/* Buttons that change the displayed meal */}
                <section className = "button-Bar">
                    <li>
                        {/* Display Brunch or Breakfast, depending on the day */}
                        <breakfast><button className="meal" onClick = {() => this.loadHistory(this.state.day, "breakfast")}>
                                {(this.state.day === 0 || this.state.day === 6) ? 
                                    "Brunch":"Breakfast"}</button></breakfast>
                        {/* Ugly workaround to keep the button spacing consistent. If the lunch button
                            is not displayed, it creates a white rectangle to fill the space */}
                        {(this.state.day === 0 || this.state.day === 6) 
                            ? <lunch><rect></rect></lunch>
                            : <lunch><button className="meal" onClick = {() => this.loadHistory(this.state.day, "lunch")}>
                                Lunch</button></lunch>}
                        <dinner><button className="meal" onClick = {() => this.loadHistory(this.state.day, "dinner")}>
                                Dinner</button></dinner>
                    </li>
                </section>
            </ul>
        </div>
        {/* Keeps the chart and info box in one div element to keep them on the same line */}
        <div className = "small-container">
            <canvas ref={this.chartRef}/>
            <section className="display-meal">
                <h1>{this.getDay()}</h1>
                <h1>{this.state.meal.charAt(0).toUpperCase()}{this.state.meal.substring(1)}</h1>
            </section>
        </div>
        </div>
        );
    }
}