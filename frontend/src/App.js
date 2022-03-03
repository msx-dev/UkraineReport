import { useState, useEffect } from "react";
import Map, { Marker, Popup } from "react-map-gl";
import axios from "axios";
import "mapbox-gl/dist/mapbox-gl.css";
import "./App.css";
import { Room } from "@material-ui/icons";
import { format } from "timeago.js";

function App() {
  const [pins, setPins] = useState([]);
  //Contains selected pin
  const [selectedPin, setSelectedPin] = useState(null);

  //Get all pins from the database
  useEffect(() => {
    const getPins = async () => {
      try {
        const response = await axios.get("/pins");
        setPins(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    getPins();
    //console.log(pins);
  }, []);

  const handlePinClick = (pin) => {
    console.log("here");
    setSelectedPin(pin);
    console.log(pin);
  };

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
      >
        {pins.map((pin) => (
          <>
            <Marker longitude={pin.long} latitude={pin.lat} anchor="bottom">
              <Room
                style={{ color: "red", cursor: "pointer" }}
                onClick={() => handlePinClick(pin)}
              />
            </Marker>
            {selectedPin ? (
              <Popup
                key={selectedPin._id}
                longitude={selectedPin.long}
                latitude={selectedPin.lat}
                anchor="bottom"
                onClose={() => setSelectedPin(null)}
              >
                <div className="popup">
                  <label>Title</label>
                  <h2>{selectedPin.title}</h2>
                  <label>Description</label>
                  <h2>{selectedPin.description}</h2>
                  <label>Type of forces</label>
                  <label>Est. number of forces</label>
                  <h2>{selectedPin.number}</h2>
                  <label>Added on</label>
                  <h2>{format(selectedPin.createdAt)}</h2>
                </div>
              </Popup>
            ) : null}
          </>
        ))}
      </Map>
    </div>
  );
}

export default App;
