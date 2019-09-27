import React, { Component } from 'react';
import './App.css';
import firebase from './firebase.js';


class App extends Component {
  constructor() {
    super();
    this.state = {
      //population counter, initially set to 0
      currentCount: 0,
      time: new Date().toLocaleString()
    }
    //binds the handleSubmit() function to all buttons to update the databse
    //on each click of every button
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  tick() {
    this.setState({
      time: new Date().toLocaleString()
    });
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
                <h3>The time is {this.state.time}</h3>
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