import React from 'react';

import * as moment from 'moment';
import * as timezone from 'moment-timezone';
import firebase from '../firebase.js';

export default class HistoryPage extends React.Component {
    constructor() {
        super();
        this.state = {
          //population counter
          currentCount: 0,
          history: [],
          // using moment library to set timezone to LA
          time: moment().day(0),
          meal: "brunch"
        }
        //binds the handleSubmit() function to all buttons to update the databse
        //on each click of every button
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    handleSubmit(e) {
        e.preventDefault();
        this.setDay(this.state.time.day());
        this.setMeal(this.state.meal);
        this.loadHistory();
    }

      
      // Automatically called by React everytime a component is mounted (loaded)
      // on to the webpage
      // Needed to load values from firebase after the page has been loaded
      componentDidMount() {
        // connects to the database
        const database = firebase.database();
    
        // Loads the current database value into currentCount
        // pulls data once from the section titled "count" and its child titled "value"
        database.ref('count').once('value', (snapshot) => {
          this.setState({ currentCount: snapshot.val().value });
        });
    
        // Reads from the database and updates this.state.history
        this.loadHistory();
      }
      
      pullBreakfastHistory() {
        const database = firebase.database();
        let newHistory = [];
        database.ref('history').orderByChild("weekday").equalTo(this.state.time.day()).on('value', (snapshot) => {
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
              meal: "breakfast"
            });
          }
        });
        return newHistory;
      }
  
      pullBrunchHistory() {
        const database = firebase.database();
        let newHistory = [];
        database.ref('history').orderByChild("weekday").equalTo(this.state.time.day()).on('value', (snapshot) => {
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
              minute: (i*5) % 60,
              meal: "brunch"
            });
          }
        });
        return newHistory;
      }
  
      pullLunchHistory() {
        const database = firebase.database();
        let newHistory = [];
        database.ref('history').orderByChild("weekday").equalTo(this.state.time.day()).on('value', (snapshot) => {
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
          for(let i = 0; i < 21; ++i)
          {
            newHistory.push({
              pastCount: sums[i] / numElements[i],
              hour: (i < 9) ? 11 : 12,
              minute: (i*5) % 60,
              meal: "lunch"
            });
          }
        });
        return newHistory;
      }
  
      // Similar code to pullBreakfastHistory()
      pullDinnerHistory() {
        const database = firebase.database();
        let newHistory = [];
        // CURRENTLY ONLY PULLS MONDAY DATA - FOR TESTING PURPOSES ONLY
        database.ref('history').orderByChild("weekday").equalTo(this.state.time.day()).on('value', (snapshot) => {
          let hist = snapshot.val();
          let sums = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
          let numElements = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
          for(let entry in hist) {
            if(hist[entry].meal === "dinner") {
              sums[((hist[entry].hour-17) * 12) + (hist[entry].minute/5)] += hist[entry].value;
              ++numElements[((hist[entry].hour-17) * 12) + (hist[entry].minute/5)];
            }
          }
          for(let i = 0; i < 24; ++i)
          {
            newHistory.push({
              pastCount: sums[i] / numElements[i],
              hour: (i < 12) ? 17 : 18,
              minute: (i*5) % 60,
              meal: "dinner"
            });
          }
        });
        return newHistory;
      }
  
      loadHistory() {
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
        let newHistory;
        if(this.state.meal === "dinner") {newHistory = this.pullDinnerHistory();}
        else if(this.state.meal === "lunch") {newHistory = this.pullLunchHistory();}
        else if(this.state.meal === "breakfast") {newHistory = this.pullBreakfastHistory();}
        else if(this.state.meal === "brunch") {newHistory = this.pullBrunchHistory();}
        
        
        this.setState({
          history: newHistory
        });
      }
  
      getMeal() {
        return this.state.meal;
      }

      setDay(n) {
          // using built in function to change the day 
          this.setState({
            time: moment().day(0)
        });
      }

      setMeal(s) {
          // setState() is the safer way to update state variables in js
          if((this.state.time.day() != 0 || this.state.time.day() != 6) && s === "brunch"){
            s = "breakfast";
          }
          this.setState({
              meal: s
          });
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
                        <button onClick={() => this.setDay(0)}>Sunday</button>
                        <button onClick={() => this.setDay(1)}>Monday</button>
                        <button onClick={() => this.setDay(2)}>Tuesday</button>
                        <button onClick={() => this.setDay(3)}>Wednesday</button>
                        <button onClick={() => this.setDay(4)}>Thursday</button>
                        <button onClick={() => this.setDay(5)}>Friday</button>
                        <button onClick={() => this.setDay(6)}>Saturday</button>
                    </section>
                </ul>
            </div>
              <div className='container'>
                <section className='display-count'>
                    <form onSubmit={this.handleSubmit}>
                      <h3>The number of people in the Hoch is:</h3>
                      {/* loads the value of currentCount */}
                      <h1>{this.state.currentCount}</h1>
                      <h1>{this.state.time.day()}</h1>
                      <h1>{this.getMeal()}</h1>
                    </form>
                </section>
                <section className='display-history'>
                  <h1>History</h1>
                  {this.state.history.map((element) => {
                    return (
                      <li key = {element.id}>
                        {/* pulls from the history and displays it with style h4 (see App.css for format)*/
                          /* the ? lines are used for formating the time */}
                        <h4>Time: {element.hour === 12 ? 12: element.hour%12}:
                            {element.minute > 9 ? element.minute : '0'+element.minute} &nbsp;&nbsp;&nbsp;&nbsp; Avg Pop: {Math.floor(element.pastCount)}
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