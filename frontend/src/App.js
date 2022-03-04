import React from "react";
import { useState, useEffect, useRef } from "react";
import ReactMapGL, { Marker, Popup } from "react-map-gl";
import axios from "axios";
import "mapbox-gl/dist/mapbox-gl.css";
import "./App.css";
import { Room } from "@material-ui/icons";
import { GiBattleTank, GiRallyTheTroops } from "react-icons/gi";
import { GoRocket } from "react-icons/go";
import { format } from "timeago.js";
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";
import Geocoder from "react-map-gl-geocoder";

function App() {
  const [pins, setPins] = useState([]);
  //Contains selected pin
  const [selectedPin, setSelectedPin] = useState(null);
  const [newPin, setNewPin] = useState(null);
  const [title, setTitle] = useState(null);
  const [description, setDescription] = useState(null);
  const [type, setType] = useState(null);
  const [number, setNumber] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [ip, setIp] = useState("");
  const [viewport, setViewport] = useState({
    longitude: 31.1656,
    latitude: 48.3794,
    zoom: 5,
  });

  const mapRef = useRef();

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

  //Submitting new data to database
  const submitForm = async (e) => {
    e.preventDefault();
    const addPin = {
      title: title,
      description: description,
      type: type,
      number: number,
      lat: newPin.lat,
      long: newPin.long,
    };

    try {
      const response = await axios.post("/pins", addPin);
      setPins([...pins, response.data]);
      setNewPin(null);
    } catch (error) {
      console.log(error);
    }
  };

  //Handle escape button to close popups
  useEffect(() => {
    const listener = (e) => {
      if (e.key === "Escape") {
        setSelectedPin(null);
        setNewPin(null);
      }
    };
    window.addEventListener("keydown", listener);

    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, []);

  //Handle click on specific pin
  const handlePinClick = (id, lat, long) => {
    setSelectedPin(id);
    setViewport({ ...viewport, latitude: lat, longitue: long });
  };

  //Handle adding a new pin on double click
  const addNewPin = (e) => {
    const [long, lat] = e.lngLat;
    setNewPin({ lat: lat, long: long });
  };

  //Get users IP address
  const getIp = async () => {
    const res = await axios.get("https://geolocation-db.com/json/");
    setIp(res.data.country_code);
  };

  useEffect(() => {
    getIp();
  }, []);

  return (
    <div className="App" style={{ height: "100vh", width: "100%" }}>
      {ip !== "RU" ? (
        <ReactMapGL
          ref={mapRef}
          {...viewport}
          mapboxApiAccessToken={process.env.REACT_APP_MAPBOX}
          width="100%"
          height="100%"
          mapStyle="mapbox://styles/msude/cl0b56qxj000215qj1qgx7faq"
          onViewportChange={(viewport) => setViewport(viewport)}
          onDblClick={addNewPin}
          transitionDuration={150}
        >
          <Geocoder
            onViewportChange={(viewport) => setViewport(viewport)}
            mapboxApiAccessToken={process.env.REACT_APP_MAPBOX}
            position="top-left"
            mapRef={mapRef}
          />
          {pins.map((pin) => (
            <>
              <Marker longitude={pin.long} latitude={pin.lat} anchor="bottom">
                {pin.type == "Tanks" ? (
                  <GiBattleTank
                    style={{ color: "red", cursor: "pointer" }}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePinClick(pin._id, pin.lat, pin.long);
                    }}
                  />
                ) : pin.type == "Missile" ? (
                  <GoRocket
                    style={{ color: "red", cursor: "pointer" }}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePinClick(pin._id, pin.lat, pin.long);
                    }}
                  />
                ) : pin.type == "Troops" ? (
                  <GiRallyTheTroops
                    style={{ color: "red", cursor: "pointer" }}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePinClick(pin._id, pin.lat, pin.long);
                    }}
                  />
                ) : (
                  <Room
                    style={{ color: "red", cursor: "pointer" }}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePinClick(pin._id, pin.lat, pin.long);
                    }}
                  />
                )}
              </Marker>

              {selectedPin === pin._id && (
                <Popup
                  key={pin._id}
                  longitude={pin.long}
                  latitude={pin.lat}
                  anchor="bottom"
                  onClose={() => setSelectedPin(null)}
                >
                  <div className="popup">
                    <label>Title</label>
                    <h2>{pin.title}</h2>
                    <hr />
                    <label>Description</label>
                    <h2>{pin.description}</h2>
                    <hr></hr>
                    <label>Type of forces</label>
                    <h2>{pin.type}</h2>
                    <hr className="separator" />
                    <label>Est. number of forces</label>
                    <h2>{pin.number}</h2>
                    <hr className="separator" />
                    <label>Added on</label>
                    <h2>{format(pin.createdAt)}</h2>
                  </div>
                </Popup>
              )}
            </>
          ))}
          {newPin && (
            <Popup
              longitude={newPin.long}
              latitude={newPin.lat}
              anchor="bottom"
            >
              <div>
                <form onSubmit={submitForm}>
                  <label>Title</label>
                  <input
                    placeholder="Title"
                    onChange={(e) => setTitle(e.target.value)}
                  ></input>
                  <label>Description</label>
                  <textarea
                    placeholder="Description"
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                  <label>Type</label>
                  <select onChange={(e) => setType(e.target.value)}>
                    <option value="Troops">Troops</option>
                    <option value="Tanks">Tanks</option>
                    <option value="Missile">Missile</option>
                    <option value="Other">Other</option>
                  </select>
                  <label>Number</label>
                  <input
                    placeholder="Number of troops"
                    onChange={(e) => setNumber(e.target.value)}
                  ></input>
                  <button type="submit">Submit</button>
                  <p>Press ESC key to close</p>
                </form>
              </div>
            </Popup>
          )}
        </ReactMapGL>
      ) : (
        <h1>
          If you are using a VPN service, please disable it for full
          functionality!
        </h1>
      )}
    </div>
  );
}

export default App;
