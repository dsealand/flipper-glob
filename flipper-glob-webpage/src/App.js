import React, { Component } from 'react';
import {Route} from 'react-router-dom'

import Home from './Component/Home';
import About from './Component/HistoryPage';
import Navigation from './Component/Navigation'
import Test from './Component/Test'

import './App.css';


class App extends Component {

  render() {
    return (
      <div>
        <Navigation/>
        {

        }
        <Route exact = {true} path = {'/'} component = {Home} />
        <Route exact = {true} path = {'/historyPage'} component = {About} />
        <Route exact = {true} path = {'/Test'} component = {Test} />
      </div>
    );
  }
}

export default App;