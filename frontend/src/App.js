import React from "react";
import { useState, useEffect, useRef } from "react";
import ReactMapGL, { Marker, Popup, Source } from "react-map-gl";
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
  const [map, setMap] = useState("Draw");
  const [mapStyle, setMapStyle] = useState(
    "mapbox://styles/msude/cl0b56qxj000215qj1qgx7faq"
  );
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

      setTitle("");
      setDescription("");
      setType("Troops");
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

  const changeMapStyle = () => {
    if (mapStyle == "mapbox://styles/msude/cl0b56qxj000215qj1qgx7faq") {
      setMapStyle("mapbox://styles/mapbox/satellite-v8");
      setMap("Satellite");
    } else {
      setMapStyle("mapbox://styles/msude/cl0b56qxj000215qj1qgx7faq");
      setMap("Draw");
    }
  };

  useEffect(() => {});

  return (
    <div className="App" style={{ height: "100vh", width: "100%" }}>
      {ip !== "RU" ? (
        <ReactMapGL
          ref={mapRef}
          {...viewport}
          mapboxApiAccessToken={process.env.REACT_APP_MAPBOX}
          width="100%"
          height="100%"
          //mapStyle="mapbox://styles/msude/cl0b56qxj000215qj1qgx7faq"
          //mapStyle="mapbox://styles/mapbox/satellite-v8"
          terrain={{ source: "mapbox-dem", exaggeration: 1.5 }}
          mapStyle={mapStyle}
          onViewportChange={(viewport) => setViewport(viewport)}
          onDblClick={addNewPin}
        >
          <Source
            id="mapbox-dem"
            type="raster-dem"
            url="mapbox://mapbox.mapbox-terrain-dem-v1"
            tileSize={512}
            maxzoom={14}
          />
          <Geocoder
            onViewportChange={(viewport) => setViewport(viewport)}
            mapboxApiAccessToken={process.env.REACT_APP_MAPBOX}
            position="top-left"
            mapRef={mapRef}
          />
          {pins.map((pin) => (
            <>
              <Marker
                longitude={pin.long}
                latitude={pin.lat}
                anchor="bottom"
                offsetLeft={-2.8 * viewport.zoom}
                offsetTop={-2.3 * viewport.zoom}
              >
                {pin.type === "Tanks" ? (
                  <GiBattleTank
                    style={{
                      color: "#eb1100",
                      cursor: "pointer",
                      fontSize: 5 * viewport.zoom,
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePinClick(pin._id, pin.lat, pin.long);
                    }}
                  />
                ) : pin.type === "Missile" ? (
                  <GoRocket
                    style={{
                      color: "#eb1100",
                      cursor: "pointer",
                      fontSize: 5 * viewport.zoom,
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePinClick(pin._id, pin.lat, pin.long);
                    }}
                  />
                ) : pin.type === "Troops" ? (
                  <GiRallyTheTroops
                    style={{
                      color: "#eb1100",
                      cursor: "pointer",
                      fontSize: 5 * viewport.zoom,
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePinClick(pin._id, pin.lat, pin.long);
                    }}
                  />
                ) : (
                  <Room
                    style={{
                      color: "#eb1100",
                      cursor: "pointer",
                      fontSize: 5 * viewport.zoom,
                    }}
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
                    <h2 className="pinText">{pin.title}</h2>

                    <label>Description</label>
                    <h2 className="pinText">{pin.description}</h2>

                    <label>Type of forces</label>
                    <h2 className="pinText">{pin.type}</h2>

                    <label>Est. number of forces</label>
                    <h2 className="pinText">{pin.number}</h2>

                    <label>Added</label>
                    <h2 className="pinText">{format(pin.createdAt)}</h2>
                  </div>
                </Popup>
              )}

              <div className="mapStyleButton" onClick={changeMapStyle}>
                {map === "Draw" ? (
                  <h1 className="viewText">Satellite View</h1>
                ) : (
                  <h1 className="viewText">Classic View</h1>
                )}
              </div>
              <div className="latestButton">
                <h1 className="viewText">Latest Reports</h1>
              </div>
              <div className="aboutButton">
                <h1 className="viewText">About</h1>
              </div>
            </>
          ))}

          {newPin && (
            <Popup
              longitude={newPin.long}
              latitude={newPin.lat}
              anchor="bottom"
            >
              <div className="popupAdd">
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
                    maxLength="90"
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
                  <button type="submit" className="submit">
                    Submit
                  </button>
                  <p className="hint">Press ESC key to close</p>
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
      <div className="latestReports">
        {pins
          .slice(0)
          .reverse()
          .map((pin) =>
            format(pin.createdAt) === "2 days ago" ? null : format(
                pin.createdAt
              ) === "3 days ago" ? null : (
              <div>
                <h4>{pin.title}</h4>
                <h5>{format(pin.createdAt)}</h5>
              </div>
            )
          )}
      </div>
    </div>
  );
}

export default App;
