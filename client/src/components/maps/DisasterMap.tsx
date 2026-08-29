import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet marker icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom Icons
const createColorIcon = (colorUrl: string) =>
  new L.Icon({
    iconUrl: colorUrl,
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

const icons = {
  blue: createColorIcon(
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  ),
  red: createColorIcon(
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  ),
  green: createColorIcon(
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  ),
  orange: createColorIcon(
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
  ),
  yellow: createColorIcon(
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png",
  ),
  violet: createColorIcon(
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png",
  ),
  grey: createColorIcon(
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png",
  ),
  black: createColorIcon(
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-black.png",
  ),
};

interface DisasterMapProps {
  shelters?: any[];
  alerts?: any[];
  incidents?: any[];
  tasks?: any[];
  requests?: any[];
  centerLoc?: [number, number] | null;
  zoom?: number;
}

const DisasterMap: React.FC<DisasterMapProps> = ({
  shelters = [],
  alerts = [],
  incidents = [],
  tasks = [],
  requests = [],
  centerLoc,
  zoom = 11,
}) => {
  const defaultCenter: [number, number] = centerLoc || [13.0827, 80.2707];

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer
        center={defaultCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        className="h-full w-full relative z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {centerLoc && (
          <Marker position={centerLoc} icon={icons.black}>
            <Popup>
              <strong>Reference Location</strong>
            </Popup>
          </Marker>
        )}

        {shelters.map(
          (s) =>
            s.latitude &&
            s.longitude && (
              <Marker
                key={`s-${s.id}`}
                position={[s.latitude, s.longitude]}
                icon={s.status === "OPEN" ? icons.green : icons.grey}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <h3 className="font-bold">{s.name}</h3>
                    <p className="text-xs text-gray-600 mb-1">{s.address}</p>
                    <div className="text-xs">
                      Capacity: {s.capacity} | Occ: {s.currentOccupancy}
                    </div>
                    <div className="text-xs font-bold text-green-700">
                      {s.status}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ),
        )}

        {alerts.map(
          (a) =>
            a.latitude &&
            a.longitude && (
              <Marker
                key={`a-${a.id}`}
                position={[a.latitude, a.longitude]}
                icon={icons.red}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <h3 className="font-bold text-red-600">🚨 {a.title}</h3>
                    <p className="text-xs">{a.description}</p>
                    <div className="text-xs font-bold mt-1">
                      Severity: {a.severity}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ),
        )}

        {incidents.map(
          (i) =>
            i.latitude &&
            i.longitude && (
              <Marker
                key={`i-${i.id}`}
                position={[i.latitude, i.longitude]}
                icon={icons.orange}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <h3 className="font-bold text-orange-600">🔥 {i.title}</h3>
                    <p className="text-xs">{i.description}</p>
                    <div className="text-xs font-bold mt-1">
                      Status: {i.status}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ),
        )}

        {requests.map(
          (r) =>
            r.latitude &&
            r.longitude && (
              <Marker
                key={`r-${r.id}`}
                position={[r.latitude, r.longitude]}
                icon={icons.violet}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <h3 className="font-bold text-violet-600">
                      ✋ Help Request
                    </h3>
                    <p className="text-xs">{r.description}</p>
                    <div className="text-xs font-bold mt-1">
                      Priority: {r.priority} | {r.status}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ),
        )}

        {tasks.map(
          (t) =>
            t.latitude &&
            t.longitude && (
              <Marker
                key={`t-${t.id}`}
                position={[t.latitude, t.longitude]}
                icon={icons.blue}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <h3 className="font-bold text-blue-600">📋 {t.title}</h3>
                    <p className="text-xs">{t.description}</p>
                    <div className="text-xs font-bold mt-1">
                      Status: {t.status}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ),
        )}
      </MapContainer>
    </div>
  );
};

export default DisasterMap;
