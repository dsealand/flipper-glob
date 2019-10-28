import React from 'react';

export default class Home extends React.Component {
    render() {
        return (
            <div className="app">
              <header>
                  <div className="wrapper">
                    <h1>Turnstile</h1>
                  </div>
              </header>
            <div>
              <section className="display-about">
                Turnstile was created by Andreas Roeseler, Aaron Trujillo, and Daniel Sealand.<br></br>
                More info about us here
              </section>
            </div>
            </div>
        );
    }
}