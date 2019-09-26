import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      currentCount: 0
    }
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
              <form>
                <h3>The number of people in the Hoch is:</h3>
                <h1>{this.state.currentCount}</h1>
                <button>Increment</button>
                <button>Decrement</button>
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
