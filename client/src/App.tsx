import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import ControlPanel from "./controlPanel/controlPanel";
import * as React from "react";

export default class App extends React.Component {

  public render() {
    return (
      <div className="App">
        <ControlPanel />
      </div>
    );
  }
}
