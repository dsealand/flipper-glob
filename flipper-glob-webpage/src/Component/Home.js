import React from 'react';

export default class Home extends React.Component {

    render() {
        const style = {
            display: 'flex',
            justifyContent: 'center',
            alignItems:'center'
        }
        return (
            <div>
                <div style = {style}>
                    <div>
                        <div className = {'container'}>
                            <h2 className = {'teal-text'}>Hello World!</h2>
                            <p>Home Page</p>
                        </div>
                    </div>
                </div>
            </div>
        )
        ;
    }
}