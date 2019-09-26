import React, { Component } from 'react';
import './App.css';
import firebase from './firebase.js';

class App extends Component {
  constructor() {
    super();
    this.state = {
      currentCount: 0
    }
    this.handleIncrement = this.handleIncrement.bind(this);
    this.handleDecrement = this.handleDecrement.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  
  handleIncrement() {
    this.setState({
      currentCount: this.state.currentCount + 1
    });
  }

  handleDecrement() {
    this.setState({
      currentCount: this.state.currentCount - 1
    });
}

  handleSubmit(e) {
    e.preventDefault();
    const itemsRef = firebase.database().ref('count');
    const item = {
      value: this.state.currentCount
    }
    //itemsRef.push(item);
    itemsRef.update(item);
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
                <h1>{this.state.currentCount}</h1>
                <button id="increment" onClick={() => this.handleIncrement()}>Increment</button>
                <button id="decrement" onClick={() => this.handleDecrement()}>Decrement</button>
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
