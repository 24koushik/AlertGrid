import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
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

interface Shelter {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
  currentOccupancy: number;
  status: string;
}

interface Alert {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  severity: string;
}

interface ShelterMapProps {
  shelters: Shelter[];
  alerts?: Alert[];
  communityLoc?: [number, number];
}

function LocationMarker({
  setUserLoc,
}: {
  setUserLoc: (loc: [number, number]) => void;
}) {
  const map = useMap();

  useEffect(() => {
    map.locate().on("locationfound", function (e) {
      setUserLoc([e.latlng.lat, e.latlng.lng]);
      map.flyTo(e.latlng, map.getZoom());
    });
  }, [map, setUserLoc]);

  return null;
}

const ShelterMap: React.FC<ShelterMapProps> = ({
  shelters,
  alerts = [],
  communityLoc,
}) => {
  const [userLoc, setUserLoc] = useState<[number, number] | null>(null);

  // Center prioritizing user GPS > community location > fallback
  const defaultCenter: [number, number] = userLoc ||
    communityLoc || [13.0827, 80.2707];

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  return (
    <div className="h-full w-full relative z-0">
      {/* We use key to force re-render map if center changes significantly, or just rely on flyTo */}
      <MapContainer
        center={defaultCenter}
        zoom={communityLoc ? 11 : 13}
        scrollWheelZoom={false}
        className="h-full w-full relative z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker setUserLoc={setUserLoc} />

        {userLoc && (
          <Marker position={userLoc}>
            <Popup>
              <strong>Your GPS Location</strong>
            </Popup>
          </Marker>
        )}

        {communityLoc && !userLoc && (
          <Marker position={communityLoc}>
            <Popup>
              <strong>Your Community Center</strong>
            </Popup>
          </Marker>
        )}

        {/* Render Shelters */}

        {shelters.map((shelter) => (
          <Marker
            key={shelter.id}
            position={[shelter.latitude, shelter.longitude]}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-bold text-lg">{shelter.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{shelter.address}</p>
                <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                  <div>
                    <span className="font-semibold">Capacity:</span>{" "}
                    {shelter.capacity}
                  </div>
                  <div>
                    <span className="font-semibold">Occupancy:</span>{" "}
                    {shelter.currentOccupancy}
                  </div>
                  <div>
                    <span className="font-semibold">Available:</span>{" "}
                    {shelter.capacity - shelter.currentOccupancy}
                  </div>
                  <div>
                    <span className="font-semibold">Status:</span>
                    <span
                      className={`ml-1 px-1 rounded text-xs ${shelter.status === "OPEN" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {shelter.status}
                    </span>
                  </div>
                </div>
                {userLoc && (
                  <p className="text-sm text-blue-600 font-medium border-t pt-2 mt-2">
                    {calculateDistance(
                      userLoc[0],
                      userLoc[1],
                      shelter.latitude,
                      shelter.longitude,
                    )}{" "}
                    km away
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Render Alerts */}
        {alerts.map((alert) => (
          <Marker
            key={alert.id}
            position={[alert.latitude, alert.longitude]}
            icon={L.icon({
              iconUrl:
                "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
              shadowUrl:
                "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41],
            })}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-bold text-lg text-red-600">
                  🚨 {alert.title}
                </h3>
                <p className="text-sm font-semibold">
                  Severity: {alert.severity}
                </p>
                {userLoc && (
                  <p className="text-sm text-red-600 font-medium border-t pt-2 mt-2">
                    {calculateDistance(
                      userLoc[0],
                      userLoc[1],
                      alert.latitude,
                      alert.longitude,
                    )}{" "}
                    km from you
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default ShelterMap;
