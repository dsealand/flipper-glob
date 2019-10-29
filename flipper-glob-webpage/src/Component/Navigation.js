import React from 'react';
import {Link} from 'react-router-dom';

const Navigation = () => {
    return (
        <nav>
            <div>
                <ul>
                    <section className = 'button-Bar'> 
                        <day><Link to = {'/'}>
                            <button>Home</button>
                        </Link></day>
                        <day><Link to = {'/historyPage'}>
                            <button>History</button>
                        </Link></day>
                        <day><Link to = {'/About'}>
                            <button>About</button>
                        </Link></day>
                    </section>
                </ul>
            </div>
        </nav>
    ); 
}

export default Navigation;