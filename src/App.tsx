import * as React from 'react';
import './App.css';
import * as socketIOClient from 'socket.io-client';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';

const logo = require('./logo.svg');
const image = require('./photo.jpg');
class App extends React.Component {

  socket: SocketIOClient.Socket;
  componentDidMount() {
    this.socket = socketIOClient('http://localhost:3000');
    this.socket.on('server', this.socketListener);
  }

  socketListener = () => {
    this.forceUpdate();
  }

  send = () => {
    this.socket.emit('chat message', 'red');
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.tsx</code> and save to reload.
        </p>
        <img src={`${image}?${new Date().valueOf()}`} style={{ width: 800, height: 600 }} />
        <button className="btn btn-default btn-warning" onClick={this.send}>Invia</button>
      </div>
    );
  }
}

export default App;
