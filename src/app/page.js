"use client";

import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import Map, { Marker, Layer, Source, useMap, MapProvider } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

const places = [
  { id: 1, song: "Alexander Hamilton", event: "出生", location: "英屬背風群島尼維斯島", latitude: 17.13537397597739, longitude: -62.62599687346717 },
  { id: 2, song: "My Shot", event: "學院崛起", location: "伊莉莎白鎮學院", latitude: 40.781307026849134, longitude: -74.43696283038658 },
  { id: 3, song: "Satisfied", event: "結婚", location: "漢密爾頓住宅國家紀念區", latitude: 40.849825752958175, longitude: -73.95964423157923 },
  { id: 4, song: "Guns and Ships", event: "獨立戰爭", location: "維吉尼亞州約克鎮", latitude: 37.241792067138796, longitude: -76.5216979492628 },
  { id: 5, song: "Non-Stop", event: "寫論文", location: "美國獨立紀念館", latitude: 39.94898882024012, longitude: -75.14998038809651 },
  { id: 6, song: "Say No to This", event: "外遇", location: "三一教堂墓園和陵墓", latitude: 40.83320497670361, longitude: -73.94909794572479 },
  { id: 7, song: "The Room Where It Happens", event: "內政與財政政策衝突", location: "華盛頓哥倫比亞特區國會山", latitude: 38.886077218944685, longitude: -76.99954101138947 },
  { id: 8, song: "It’s Quiet Uptown", event: "移居鄉下", location: "曼哈頓上城", latitude: 40.82400392398603, longitude: -73.94480803038849 },
  { id: 9, song: "Who Lives, Who Dies, Who Tells Your Story", event: "死亡", location: "紐約格林尼治村", latitude: 40.73118879709873, longitude: -73.99728782422429 }
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lineCoordinates, setLineCoordinates] = useState([]); // 儲存所有線的座標
  const [dashProgress, setDashProgress] = useState({}); // 每條線的動畫進度

  const initCenter = {
    longitude: -69.2547008295843,
    latitude: 30.897972048254545,
    zoom: 3.5
  };

  // 虛線逐段出現動畫
  useEffect(() => {
    if (lineCoordinates.length > 0) {
      const animate = () => {
        setDashProgress((prev) => {
          const newProgress = { ...prev };
          lineCoordinates.forEach((_, index) => {
            if (!newProgress[index] || newProgress[index] < 1) {
              newProgress[index] = (newProgress[index] || 0) + 0.01; // 每條線獨立進度
            }
          });
          return newProgress;
        });
        requestAnimationFrame(animate);
      };
      const animationId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationId);
    }
  }, [lineCoordinates]);

  // 當 currentIndex 變化時更新線段
  useEffect(() => {
    if (currentIndex > 0) {
      const newLine = [
        [places[currentIndex - 1].longitude, places[currentIndex - 1].latitude],
        [places[currentIndex].longitude, places[currentIndex].latitude]
      ];
      setLineCoordinates((prev) => {
        const newCoordinates = [...prev];
        newCoordinates[currentIndex - 1] = newLine; // 更新或添加線段
        return newCoordinates;
      });
      setDashProgress((prev) => ({ ...prev, [currentIndex - 1]: 0 })); // 重置新線動畫
    }
  }, [currentIndex]);

  // 為每條線生成圖層
  const lineLayers = lineCoordinates.map((_, index) => ({
    id: `dashed-line-${index}`,
    type: 'line',
    source: `line-source-${index}`,
    paint: {
      'line-color': '#F97316', 
      'line-width': 6, // 加粗虛線
      'line-dasharray': [
        2 * (dashProgress[index] || 0),
        Math.max(2 * (1 - (dashProgress[index] || 0)), 0) 
      ]
    }
  }));

  // 為每條線生成 GeoJSON
  const lineGeoJSONs = lineCoordinates.map((coords, index) => ({
    id: `line-source-${index}`,
    data: {
      type: 'FeatureCollection',
      features: coords.length > 0 ? [
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: coords
          }
        }
      ] : []
    }
  }));

  return (
    <MapProvider>
      <Map
        id="mainMap"
        mapboxAccessToken="pk.eyJ1Ijoiamllbmh1YWdvbyIsImEiOiJjbTdsNjY0MjMwNDl2MmtzZHloYXY0czNkIn0.mlD3UGH3wR3ZMJmCuHDpSQ"
        initialViewState={initCenter}
        style={{ width: "100vw", height: "100vh" }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
      >
        <MarkerList
          places={places}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
        />
        {lineGeoJSONs.map((geojson, index) => (
          geojson.data.features.length > 0 && (
            <Source key={geojson.id} id={geojson.id} type="geojson" data={geojson.data}>
              <Layer {...lineLayers[index]} />
            </Source>
          )
        ))}
      </Map>
    </MapProvider>
  );
}

function MarkerList({ places, currentIndex, setCurrentIndex }) {
  const { mainMap } = useMap();

  useEffect(() => {
    if (!mainMap) return;
    const place = places[currentIndex];

    mainMap.flyTo({
      center: [place.longitude, place.latitude],
      zoom: 10,
      speed: 1.2,
      curve: 1.4,
      essential: true
    });
  }, [currentIndex, mainMap]);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % places.length);
  };

  const place = places[currentIndex];

  return (
    <>
      <div className="absolute top-10 left-10 w-64 bg-gray-100 rounded-2xl shadow-xl p-4 z-50">
        <div className="relative w-full aspect-square overflow-hidden rounded-xl">
          <Image
            src="/HMicon.jpg"
            alt="avatar"
            fill
            className="object-cover rounded-t-md"
          />
        </div>

        <h2 className="mt-4 text-xl font-black text-black">{place.song}</h2>
        <p className="mt-2 text-sm italic text-gray-600 leading-snug tracking-wide break-words">
          {place.event} @ {place.location}
        </p>

        <button
          onClick={next}
          className="mt-3 ml-auto text-yellow-500 font-bold text-sm flex items-center"
        >
          NEXT <span className="ml-1">▶</span>
        </button>
      </div>

      {places.map((p, index) => (
        <Marker
          key={p.id}
          longitude={p.longitude}
          latitude={p.latitude}
          onClick={() => setCurrentIndex(places.findIndex(x => x.id === p.id))}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              index <= currentIndex ? 'bg-orange-500' : 'bg-gray-500'
            }`}
          />
        </Marker>
      ))}
    </>
  );
}