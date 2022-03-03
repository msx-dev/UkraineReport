import { useState } from "react";
import Map from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./App.css";

function App() {
  return (
    <div className="App">
      <Map
        initialViewState={{
          longitude: 31.1656,
          latitude: 48.3794,
          zoom: 5,
        }}
        style={{ width: "100vw", height: "100vh" }}
        mapStyle="mapbox://styles/msude/cl0b56qxj000215qj1qgx7faq"
        mapboxAccessToken={process.env.REACT_APP_MAPBOX}
      />
    </div>
  );
}

export default App;
