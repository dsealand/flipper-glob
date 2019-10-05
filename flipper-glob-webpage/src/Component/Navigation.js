import React, {Component} from 'react';
import {Route,Link} from 'react-router-dom';
import Home from './Home';
import HistoryPage from './HistoryPage';


const Navigation = () => {
    return (
        <nav className = {'deep-purple darken-1'}>
            <div>
                <ul>
                    <section className = {'nav-Bar'}>
                        <Link to = {'/'}>
                            <button>
                                <a className = {'white-text'}>Home</a>
                            </button>
                        </Link>
                        
                        {/* nbsp = non breaking space - for formating */}
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <Link to = {'/historyPage'}>
                            <button>
                                <a className = {'white-text'}>History</a>
                                </button>
                        </Link>
                    </section>
                </ul>
            </div>
        </nav>
    ); 
}

export default Navigation;