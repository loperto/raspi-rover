import * as React from 'react';
import './App.css';
import Test from './test';
import Monitor from "./monitor"


export default class App extends React.Component<{}> {
    render() {
        return (
            <div className="App">
                <div className="App-header">
                    <h2>Welcome to React</h2>
                </div>
                <p className="App-intro">
                    To get started <code>src/App.tsx</code> and save to reload.
                    <Monitor />
                    <Test />
                </p>
            </div>
        );
    }
}
