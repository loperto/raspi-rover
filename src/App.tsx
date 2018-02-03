import * as React from "react";
import "./App.css";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../node_modules/font-awesome/css/font-awesome.min.css";
import ControlPanel from "./controlPanel";

class App extends React.Component {

  render() {
    return (
      <div className="App">
        <ControlPanel />
      </div>
    );
  }
}

export default App;
