import React, {Component} from 'react';
import {Route,Link} from 'react-router-dom';
import Home from './Home';
import HistoryPage from './HistoryPage';


const Navigation = () => {
    return (
        <nav className = {'deep-purple darken-1'}>
            <div>
                <ul>
                    <section className = {'button-Bar'}>
                        <day><Link to = {'/'}>
                            <button>Home</button>
                        </Link></day>
                        <day><Link to = {'/historyPage'}>
                            <button>History</button>
                        </Link></day>
                    </section>
                </ul>
            </div>
        </nav>
    ); 
}

export default Navigation;