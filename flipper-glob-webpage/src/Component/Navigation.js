import React, {Component} from 'react';
import {Route,Link} from 'react-router-dom';
import Home from './Home';
import HistoryPage from './HistoryPage';


const Navigation = () => {
    return (
        <nav className = {'deep-purple darken-1'}>
            <div className = {'nav-wrapper'}>
                <ul>
                    <section className = {'nav-Bar'}>
                        <button>
                            <Link to = {'/'}>
                                <a className = {'white-text'}>Home</a>
                            </Link>
                        </button>
                        
                        {/* nbsp = non breaking space - for formating */}
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <button>
                            <Link to = {'/historyPage'}>
                                <a className = {'white-text'}>History</a>
                            </Link>
                        </button>
                        
                    </section>
                </ul>
            </div>
        </nav>
    ); 
}

export default Navigation;