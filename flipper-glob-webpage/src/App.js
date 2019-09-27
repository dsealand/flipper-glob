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
      time: new Date()

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
        timestamp: this.state.time
      }
      database.update(entry);
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

    // calls this.tick() every 1000 ms (every 1 second)
    this.intervalID = setInterval(() => this.tick(), 1000);
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
                {/* toLocaleString() is a function that formats the time*/}
                <h3>The time is {this.state.time.toLocaleString()}</h3>
                {/* Assigns a function to be called on the button press IN ADDITION
                    to handleSubmit */}
                <button onClick={() => this.handleIncrement()}>Increment</button>
                <button onClick={() => this.handleDecrement()}>Decrement</button>
                <button onClick={() => this.handleReset()}>Reset</button>
              </form>
          </section>
          <section className='display-item'>
            <div className='wrapper'>
              <ul>
              </ul>
            </div>
          </section>
        </div>
      </div>
    );
  }
}

export default App;