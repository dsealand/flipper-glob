import React, { Component } from 'react';
import './App.css';
import firebase from './firebase.js';


class App extends Component {
  constructor() {
    super();
    this.state = {
      //population counter
      currentCount: 0,
      //we must use new Date() to create a new object and avoid some weird errors
      //I don't exactly know why though
      time: new Date(),
      history: []
    }
    //binds the handleSubmit() function to all buttons to update the databse
    //on each click of every button
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // called every second - will be used to log history
  tick() {
    this.setState({
      time: new Date()
    });
    if(this.state.time.getSeconds() === 0)
    {
      const database = firebase.database().ref('history');
      const entry = {
        value: this.state.currentCount,
        weekday: this.state.time.getDay().toString(),
        hour: this.state.time.getHours().toString(),
        minute: this.state.time.getMinutes().toString()
      }
      database.push(entry);
    }
  }

  handleIncrement() {
    this.setState({ currentCount: this.state.currentCount + 1 });
  }

  handleDecrement() {
    this.setState({ currentCount: this.state.currentCount - 1 });
}
  
  handleReset() {
    this.setState({ currentCount: 0 });
  }

  handleSubmit(e) {
    //Stops the page from reloading every click
    e.preventDefault();
    //connects to firebase
    const itemsRef = firebase.database().ref('count');
    const item = {
      value: this.state.currentCount
    }
    //updates existing item on firebase or creates new item if one does not exist
    itemsRef.update(item);
}

// Automatically called by React everytime a component is mounted (loaded)
// on to the webpage
  componentDidMount() {
    // connects to the database
    const database = firebase.database();

    // pulls data once from the section titled "count" and its child titled "value"
    database.ref('count').once('value', (snapshot) => {
    // writes that value to currentCount
    this.setState({ currentCount: snapshot.val().value });
    });

    // calls this.tick() every 1000 ms (every 1 second)
    // sets up the clock function
    this.intervalID = setInterval(() => this.tick(), 1000);

    // pull in the history
    let newHistory = [];
    // helpful site https://firebase.google.com/docs/database/admin/retrieve-data
    // .limitToFirst(n)  or .limitToLast(n)- only chooses certain n values
    // .orderByChild(" -- name of category -- ") sorts by that value 
    // Note: we might need to create multiple of the following calls to parse the data
    // It only allows one orderBy ise per function call
    // Or we'll just have to be smart about our limitTo calls and include smart if statements
    // Currently only pulls database values from the same weekday
    database.ref('history').orderByChild("weekday").equalTo(this.state.time.getDay().toString())
            .limitToLast(20).on('value', (snapshot) => {
      let elements = snapshot.val();
      // Loops through every element passed - to change number of entries use limitToFirst()
      // or limitToLast() in the database.ref line
      for(let element in elements)
      {
        if(elements[element].minute % 2 === 0){ // Way to limit the entries to only even times
          newHistory.push({
            pastCount: elements[element].value,
            hour: elements[element].hour,
            minute: elements[element].minute
          });
        }
      }
    });
    this.setState({
      history: newHistory
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
        <div className='container'>
          <section className='display-count'>
              <form onSubmit={this.handleSubmit}>
                <h3>The number of people in the Hoch is:</h3>
                {/* loads the value of currentCount */}
                <h1>{this.state.currentCount}</h1>
                {/* Assigns a function to be called on the button press IN ADDITION
                    to handleSubmit */}
                <button onClick={() => this.handleIncrement()}>Increment</button>
                <button onClick={() => this.handleDecrement()}>Decrement</button>
                <button onClick={() => this.handleReset()}>Reset</button>
              </form>
          </section>
          <section className='display-history'>
              <li>
                <h1>History</h1>
                {this.state.history.map((element) => {
                  return (
                    <li key = {element.id}>
                      {/* pulls from the history and displays it with style h4 (see App.css for format)*/}
                      {/* the ? lines are used for formating the time */}
                      <h4>{element.hour === 12 ? 12: element.hour%12}:
                          {element.minute > 9 ? element.minute : '0'+element.minute} Pop: {element.pastCount}
                      </h4>
                      </li>
                  )
                })}
              </li>
          </section>
        </div>
      </div>
    );
  }
}

export default App;