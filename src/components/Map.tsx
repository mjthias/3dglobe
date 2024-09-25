"use client";

import { MapContainer, Marker, TileLayer, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

import { type LatLngExpression, type Map } from "leaflet";
import { useMemo } from "react";
import { useState } from "react";

// import "leaflet-defaulticon-compatibility";
// import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

export default function TwoDMap({ position, zoom = 6 }: { position: { lat: number; lng: number }; zoom?: number }) {
  const mapPostition: LatLngExpression = [position.lat, position.lng];

  const [map, setMap] = useState<Map | null>(null);

  useEffect(() => {
    if (!map) return;
    map.setView([position.lat, position.lng], zoom);
  }, [position]);

  const displayMap = useMemo(
    () => (
      <MapContainer
        center={mapPostition}
        zoom={zoom}
        scrollWheelZoom={false}
        className="h-56"
        ref={setMap}
        zoomControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
      </MapContainer>
    ),
    []
  );

  return <div className="rounded-xl overflow-hidden">{displayMap}</div>;
}
