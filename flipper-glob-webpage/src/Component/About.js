import React from 'react';

export default class About extends React.Component {

    render() {
        const style = {
            display: 'flex',
            justifyContent: 'center',
            alignItems:'center'
        }
        return (
            <div className = {'container'}>
                <div style = {style}>
                    <div>
                        <div className = {'container'}>
                            <h2 className = {'teal-text'}>Hello World!</h2>
                            <p>About Page</p>
                        </div>
                    </div>
                </div>
            </div>
        )
        ;
    }
}