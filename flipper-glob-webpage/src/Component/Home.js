import React from "react";

import * as moment from "moment";
import "moment-timezone";
import firebase from "../firebase.js";

import Chart from "chart.js";

export default class Home extends React.Component {
    // Creating the base for the chart
    chartRef = React.createRef();
    database = firebase.database();

    constructor() {
        super();
        this.state = {
          //population counter
          currentCount: 0,
          history: [],
          // using moment library to set timezone to LA
          time: moment().tz("America/Los_Angeles"),
          // used only keep track of meal being displayed and update
          // history when meal is changed
          meal: "Closed",
          // should we push the values to the firebase history
          shouldLogData: false
        }
    }
    
    

    // called every second - will be used to log history
    tick() {
      // Updates the clock every tick
      this.setState({
        time: moment().tz("America/Los_Angeles")
      });
      
      // Pulls the value from firebase every tick
      this.database.ref("count").once("value", (snapshot) => {
        this.setState({ 
          currentCount: snapshot.val().value,
          shouldLogData: snapshot.val().shouldLogData
        });
      });
      
      // If the meal has changed, load info for the next meal
      // Also handles reseting the counter to 0 during off hours
      if(this.state.meal !== this.getMeal())
      {
        this.updateHistory(this.state.time.day(), this.getMeal())
      }
      
      this.updateGraph();
      // // Every minute, create a new object and push it to the database
      // // Stores only every 5 minute interval into the database
      // if(this.state.time.seconds() % 5 === 0 /*&& this.state.time.minutes % 5 === 0*/)
      // {
      //   const database = firebase.database().ref("history");
      //   const entry = {
      //     // value: this.state.currentCount,
      //     // weekday: this.state.time.day(),
      //     // hour: this.state.time.hours(),
      //     // minute: this.state.time.minutes(),
      //     // meal: this.getMeal()
      //   }
      //   if(meal !== "Closed" && this.state.shouldLogData === true) {database.ref("history").push(entry);}
      // }
    }

    // Automatically called by React everytime a component is mounted (loaded)
    // on to the webpage
    // Needed to load values from firebase after the page has been loaded
    componentDidMount() {
      // Loads the current database value into currentCount
      // pulls data once from the section titled "count" and its child titled "value"
      this.database.ref("count").once("value", (snapshot) => {
        this.setState({ 
          currentCount: snapshot.val().value ,
          shouldLogData: snapshot.val().shouldLogData
        });
      });
  
      // calls this.tick() every 500 ms (every .5 seconds)
      // sets up the clock function
      this.intervalID = setInterval(() => this.tick(), 500);
  
      // Reads from the database and updates this.state.history
      this.updateHistory(this.state.time.day(), this.getMeal())
    }

    // Needed to remove error when navigating away from this page
    componentWillUnmount() {
      clearInterval(this.intervalID);
      this.intervalID = null;
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

  // Creates a graph using chart.js and populates it with information from this.state.history
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
      new Chart(myChartRef, {
          type: "line",
          data: {
              //Bring in data
              labels: label,
              datasets: [
                  {
                      // Set color to white with a darkness value of .35 (grey)
                      backgroundColor: "rgba(0,0,0,.35)",
                      data: data
                  }
              ]
          },
          options: {
              animation: {duration: 0},
              // hide title and other misc info
              legend: {
                  display: false
              },
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

    // Functionality should be pushed to the board
    // Resets the firebase value to 0
    // Called when the hoch is closed
    resetCounter() {
      const itemsRef = this.database.ref("count");
      const item = {
        value: 0
      }
      //updates existing item on firebase or creates new item if one does not exist
      itemsRef.update(item);
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

  // Calls method corresponding to meal, then passes information to updateState
  // to change all information in one setState call
  updateHistory(n, s) {
    // helpful site https://firebase.google.com/docs/database/admin/retrieve-data
    // .limitToFirst(n)  or .limitToLast(n)- only chooses certain n values
    // .orderByChild(" -- name of category -- ") sorts by that value 
    let newHistory = [];
    let day = n;
    let meal = this.setMeal(n, s);
    // // Hard coded values for testing purposes
    // let day = 1;
    // let meal = "dinner";
    if(meal === "dinner") {newHistory = this.pullDinnerHistory(day);}
    else if(meal === "lunch") {newHistory = this.pullLunchHistory(day);}
    else if(meal === "breakfast") {newHistory = this.pullBreakfastHistory(day);}
    else if(meal === "brunch") {newHistory = this.pullBrunchHistory(day);}
    else if(meal === "Closed") {this.resetCounter();}
    // Passes all information to one function that will handle the setState() update
    // to minimize collisions with asynchronous updates
    this.updateState(day, meal, newHistory);
}

    // Handles meal differences on the weekend
    setMeal(n, s) {
      if((n !== 0 && n !== 6) && s === "brunch") {
          s = "breakfast";
      }
      else if((n === 0 || n === 6) && s === "breakfast") {
          s = "brunch";
      }
      return s;
  }

    // Uses day and time info to return a string corresponding to the current meal
    // returns Closed as default
    getMeal() {
      if(this.state.time.day() === 0 || this.state.time.day() === 6)
      {
        if((this.state.time.hours() === 12 && this.state.time.minutes() <= 45) 
          || (this.state.time.hours() === 10 && this.state.time.minutes >= 30)
          || this.state.time.hours() === 11) {
          return "brunch";
        }
        else if (this.state.time.hours() <= 19 && this.state.time.hours() >= 17) {
          return "dinner";
        }
        return "Closed";
      }
      else if ((this.state.time.hours() === 7 && this.state.time.minutes() >= 30)
                || this.state.time.hours() === 8
                || (this.state.time.hours() === 9 && this.state.time.minutes() <= 30)) {
        return "breakfast";
      }
      else if ((this.state.time.hours() === 11 && this.state.time.minutes() >= 15)
                || this.state.time.hours() === 12
                || (this.state.time.hours() === 13 && this.state.time.minutes() <= 15)) {
        return "lunch";
      }
      else if (this.state.time.hours() <= 19 && this.state.time.hours() >= 17) {
        return "dinner";
      }
      return "Closed";
    }
    
    render() {
      return (
        <div className="app">
          <header>
              <div className="wrapper">
                <h1>Turnstile</h1>
              </div>
          </header>
          <div className="container">
            <section className="display-count">
                <center><h1>The number of people in the Hoch is:</h1>
                {/* loads the value of currentCount */}
                <h1>{this.state.currentCount}</h1>
                <h3>{this.state.time.format("dddd, MMMM Do YYYY, h:mm:ss a")}</h3>
                <h1>{this.getMeal()}</h1></center>
            </section>
            <div className = "small-container">
              <canvas ref={this.chartRef}/>
            </div>
          </div>
        </div>
      );
    }
}
