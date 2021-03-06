import React from "react";
import { useState, useEffect, useRef } from "react";
import ReactMapGL, {
  Marker,
  Popup,
  Source,
  GeolocateControl,
} from "react-map-gl";
import axios from "axios";
import "mapbox-gl/dist/mapbox-gl.css";
import "./App.css";
import { Room } from "@material-ui/icons";
import { GiHealthNormal } from "react-icons/gi";
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
  const [type, setType] = useState("Minor");
  const [number, setNumber] = useState(0);
  const [latestOpen, setLatestOpen] = useState(false);
  const [ip, setIp] = useState("");
  const [map, setMap] = useState("Draw");
  const [latestPin, setLatestPin] = useState(0);
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
      setType("Minor");
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

  const handleLatestClick = (id) => {
    setLatestPin(id);
    setLatestOpen(false);
  };

  const handleLatestOpen = () => {
    if (latestOpen) {
      setLatestOpen(false);
    } else {
      setLatestOpen(true);
    }
  };

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
          <GeolocateControl />
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
                offsetLeft={-1.6 * viewport.zoom}
                offsetTop={-1.7 * viewport.zoom}
              >
                {pin.type === "Minor" ? (
                  <GiHealthNormal
                    style={{
                      color: "yellow",
                      cursor: "pointer",
                      fontSize: 3 * viewport.zoom,
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePinClick(pin._id, pin.lat, pin.long);
                    }}
                  />
                ) : pin.type === "Moderate" ? (
                  <GiHealthNormal
                    style={{
                      color: "orange",
                      cursor: "pointer",
                      fontSize: 3 * viewport.zoom,
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePinClick(pin._id, pin.lat, pin.long);
                    }}
                  />
                ) : pin.type === "Critical" ? (
                  <GiHealthNormal
                    style={{
                      color: "red",
                      cursor: "pointer",
                      fontSize: 3 * viewport.zoom,
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePinClick(pin._id, pin.lat, pin.long);
                    }}
                  />
                ) : (
                  <GiHealthNormal
                    style={{
                      color: "black",
                      cursor: "pointer",
                      fontSize: 3 * viewport.zoom,
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePinClick(pin._id, pin.lat, pin.long);
                    }}
                  />
                )}
              </Marker>

              {selectedPin === pin._id ? (
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

                    <label>Severity</label>
                    <h2 className="pinText">{pin.type}</h2>

                    <label>Est. number of injured</label>
                    <h2 className="pinText">{pin.number}</h2>

                    <label>Added</label>
                    <h2 className="pinText">{format(pin.createdAt)}</h2>
                  </div>
                </Popup>
              ) : latestPin === pin._id ? (
                <Popup
                  key={pin._id}
                  longitude={pin.long}
                  latitude={pin.lat}
                  anchor="bottom"
                  onClose={() => {
                    setSelectedPin(null);
                    setLatestPin(null);
                  }}
                >
                  <div className="popup">
                    <label>Title</label>
                    <h2 className="pinText">{pin.title}</h2>

                    <label>Description</label>
                    <h2 className="pinText">{pin.description}</h2>

                    <label>Severity</label>
                    <h2 className="pinText">{pin.type}</h2>

                    <label>Est. number of injured</label>
                    <h2 className="pinText">{pin.number}</h2>

                    <label>Added</label>
                    <h2 className="pinText">{format(pin.createdAt)}</h2>
                  </div>
                </Popup>
              ) : null}

              <div className="mapStyleButton" onClick={changeMapStyle}>
                {map === "Draw" ? (
                  <h1 className="buttonText">Satellite View</h1>
                ) : (
                  <h1 className="buttonText">Classic View</h1>
                )}
              </div>
              <div className="latestButton" onClick={handleLatestOpen}>
                <h1 className="buttonText">Latest Reports</h1>
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
                    <option value="Minor">Minor</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Critical">Critical</option>
                    <option value="Lethal">Lethal</option>
                  </select>
                  <label>Number</label>
                  <input
                    placeholder="Est. number of injured"
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
      {latestOpen && (
        <div className="latestReports">
          {pins
            .slice(0)
            .reverse()
            .map((pin) =>
              format(pin.createdAt) === "2 days ago" ? null : format(
                  pin.createdAt
                ) === "3 days ago" ? null : (
                <div
                  className="latestEntry"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLatestClick(pin._id);
                  }}
                >
                  {pin.type === "Minor" ? (
                    <GiHealthNormal
                      style={{
                        color: "yellow",
                        cursor: "pointer",
                        fontSize: 3 * viewport.zoom,
                        float: "right",
                      }}
                    />
                  ) : pin.type === "Moderate" ? (
                    <GiHealthNormal
                      style={{
                        color: "orange",
                        cursor: "pointer",
                        fontSize: 3 * viewport.zoom,
                        float: "right",
                      }}
                    />
                  ) : pin.type === "Critical" ? (
                    <GiHealthNormal
                      style={{
                        color: "red",
                        cursor: "pointer",
                        fontSize: 3 * viewport.zoom,
                        float: "right",
                      }}
                    />
                  ) : (
                    <GiHealthNormal
                      style={{
                        color: "black",
                        cursor: "pointer",
                        fontSize: 3 * viewport.zoom,
                        float: "right",
                      }}
                    />
                  )}

                  <h3 className="titleEntry">Title</h3>
                  <h3 className="latestTitle">{pin.title}</h3>

                  <h3 className="titleEntry">Type</h3>
                  <h4 className="latestType">{pin.type}</h4>
                  <h3 className="titleEntry">Time</h3>
                  <h5 className="latestTime">{format(pin.createdAt)}</h5>
                </div>
              )
            )}
        </div>
      )}
    </div>
  );
}

export default App;
