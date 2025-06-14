"use client"

import Image from "next/image";
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function Home() {
  return (
    <>
      <Map
        mapboxAccessToken="pk.eyJ1Ijoiamllbmh1YWdvbyIsImEiOiJjbTdsNjY0MjMwNDl2MmtzZHloYXY0czNkIn0.mlD3UGH3wR3ZMJmCuHDpSQ"
        initialViewState={{
          longitude: -79.88845565847294,
          latitude: 43.27659075691894,
          zoom: 12
        }}
        style={{width: "100vw", height: "100vh"}}
        mapStyle="mapbox://styles/mapbox/light-v11"
      >

      </Map>
    </>
  );
}
