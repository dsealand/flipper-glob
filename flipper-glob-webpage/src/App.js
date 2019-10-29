import React from 'react';
import {Route} from 'react-router-dom'

import Home from './Component/Home';
import historyPage from './Component/HistoryPage';
import Navigation from './Component/Navigation'
import About from './Component/About'

import './App.css';

/*
 * This is the app that is called when the program is run
 * It currently only has a navigation bar and calls the other pages
 * to display the desired information
*/
class App extends React.Component {
  
  render() {
    return (
      <div>
        <Navigation/>
        {

        }
        <Route exact = {true} path = {'/'} component = {Home} />
        <Route exact = {true} path = {'/historyPage'} component = {historyPage} />
        <Route exact = {true} path = {'/About'} component = {About} />
      </div>
    );
  }
}

export default App;