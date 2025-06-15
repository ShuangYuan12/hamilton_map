"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import Map, { Marker, Layer, Source, useMap, MapProvider } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';


const Hamiltonplaces = [
  {
    id: 1, song: "Alexander Hamilton", event: "出生", location: "英屬背風群島尼維斯島",
    audio: "/audio/1.mp3", latitude: 17.13537397597739, longitude: -62.62599687346717
  },
  {
    id: 2, song: "My Shot", event: "學院崛起", location: "伊莉莎白鎮學院",
    audio: "/audio/2.mp3", latitude: 40.781307026849134, longitude: -74.43696283038658
  },
  {
    id: 3, song: "Satisfied", event: "結婚", location: "漢密爾頓住宅國家紀念區",
    audio: "/audio/3.mp3", latitude: 40.849825752958175, longitude: -73.95964423157923
  },
  {
    id: 4, song: "Guns and Ships", event: "獨立戰爭", location: "維吉尼亞州約克鎮",
    audio: "/audio/4.mp3", latitude: 37.241792067138796, longitude: -76.5216979492628
  },
  {
    id: 5, song: "Non-Stop", event: "寫論文", location: "美國獨立紀念館",
    audio: "/audio/5.mp3", latitude: 39.94898882024012, longitude: -75.14998038809651
  },
  {
    id: 6, song: "Say No to This", event: "外遇", location: "三一教堂墓園和陵墓",
    audio: "/audio/6.mp3", latitude: 40.83320497670361, longitude: -73.94909794572479
  },
  {
    id: 7, song: "The Room Where It Happens", event: "內政與財政政策衝突", location: "華盛頓哥倫比亞特區國會山",
    audio: "/audio/7.mp3", latitude: 38.886077218944685, longitude: -76.99954101138947
  },
  {
    id: 8, song: "It’s Quiet Uptown", event: "移居鄉下", location: "曼哈頓上城",
    audio: "/audio/8.mp3", latitude: 40.82400392398603, longitude: -73.94480803038849
  },
  {
    id: 9, song: "Who Lives, Who Dies, Who Tells Your Story", event: "死亡", location: "紐約格林尼治村",
    audio: "/audio/9.mp3", latitude: 40.73118879709873, longitude: -73.99728782422429
  }
];

const Burrplaces = [
  { id: 1, song: "Aaron Burr, Sir", event: "出生", location: "英屬美洲紐澤西省紐華克", latitude: 40.74390390983216, longitude: -74.17141241806374 },
  { id: 2, song: "My Shot", event: "學校", location: "伊莉莎白鎮學院", latitude: 40.781307026849134, longitude: -74.43696283038658 },
  { id: 3, song: "The room where it happened", event: "總統落選", location: "美國眾議院", latitude: 38.88996496158612, longitude: -77.00904648606979 },
  { id: 4, song: "Ten Duel Commandments", event: "伯爾-漢密爾頓決鬥", location: "新澤西州的威霍肯", latitude: 40.7700787163784, longitude: -74.01691886845401 },
  { id: 5, song: "Who Lives, Who Dies, Who Tells Your Story", event: "死亡", location: "普林斯頓公墓", latitude: 40.35414713183177, longitude: -74.66006837116463 }
];

export default function Home() {
  const [HumanPlace, setHumanPlace] = useState(Hamiltonplaces)
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lineCoordinates, setLineCoordinates] = useState([]); // 儲存所有線的座標
  const [dashProgress, setDashProgress] = useState({}); // 每條線的動畫進度
  const [lineColors, setLineColors] = useState([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const initCenter = {
    longitude: -69.2547,
    latitude: 30.89797,
    zoom: 3.5,
  };

  let otherPlace = Burrplaces;

  useEffect(() => {
    otherPlace = HumanPlace == Hamiltonplaces ? Burrplaces : Hamiltonplaces;
  }, [HumanPlace]);

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
        [HumanPlace[currentIndex - 1].longitude, HumanPlace[currentIndex - 1].latitude],
        [HumanPlace[currentIndex].longitude, HumanPlace[currentIndex].latitude]
      ];
      setLineCoordinates((prev) => {
        const newCoordinates = [...prev];
        newCoordinates[currentIndex - 1] = newLine; // 更新或添加線段
        return newCoordinates;
      });
      setLineColors((prev) => {
        const newColors = [...prev];
        newColors[currentIndex - 1] = HumanPlace == Hamiltonplaces ? "#F97316" : "#01814A";
        return newColors;
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
      'line-color': lineColors[index],
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
    <>
    <MapProvider>
      <Map
        id="mainMap"
        mapboxAccessToken="pk.eyJ1Ijoiamllbmh1YWdvbyIsImEiOiJjbTdsNjY0MjMwNDl2MmtzZHloYXY0czNkIn0.mlD3UGH3wR3ZMJmCuHDpSQ"
        initialViewState={initCenter}
        style={{ width: "100vw", height: "100vh" }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
      >

        {otherPlace.map((p) => (
          <Marker
            key={p.id}
            longitude={p.longitude}
            latitude={p.latitude}
          >
            <div
              className={"w-2 h-2 rounded-full bg-gray-500"}
            />
          </Marker>
        ))}

        <MarkerList
          places={HumanPlace}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          audioRef={audioRef}
          currentTime={currentTime}
          setCurrentTime={setCurrentTime}
          setDuration={setDuration}
          duration={duration}
        />

        <div className="absolute top-120 left-10 flex flex-col gap-5">
          <button
            onClick={() => { setHumanPlace(Hamiltonplaces); setCurrentIndex(0); }}
            className="w-30 h-10 rounded-full bg-yellow-500"
          >
            Hamilton
          </button>

          <button
            onClick={() => { setHumanPlace(Burrplaces); setCurrentIndex(0); }}
            className="w-30 h-10 rounded-full bg-yellow-500"
          >
            Burr
          </button>
        </div>

        {lineGeoJSONs.map((geojson, index) => (
          geojson.data.features.length > 0 && (
            <Source key={geojson.id} id={geojson.id} type="geojson" data={geojson.data}>
              <Layer {...lineLayers[index]} />
            </Source>
          )
        ))}

      </Map>
    </MapProvider>

    <audio
        ref={audioRef}
        src={HumanPlace[currentIndex].audio}
        onTimeUpdate={() => setCurrentTime(audioRef.current.currentTime)}
        onLoadedMetadata={() => setDuration(audioRef.current.duration)}
        autoPlay
      />
    </>
  );
}

function MarkerList({
  places,
  currentIndex,
  setCurrentIndex,
  isPlaying,
  setIsPlaying,
  audioRef,
  currentTime,
  setCurrentTime,
  setDuration,
  duration
}) {
  const { mainMap } = useMap();
  const place = places[currentIndex];

  useEffect(() => {
    if (!mainMap || !audioRef.current) return;

    mainMap.flyTo({
      center: [place.longitude, place.latitude],
      zoom: 10,
      speed: 1.2,
      curve: 1.4,
      essential: true,
    });

    audioRef.current.pause();
    audioRef.current.src = place.audio;
    audioRef.current.currentTime = 0;
    if (isPlaying) audioRef.current.play();
  }, [places, currentIndex, mainMap]);

  useEffect(() => {
    const handleFirstClick = () => {
      audioRef.current?.play();
      window.removeEventListener("click", handleFirstClick);
    };
    window.addEventListener("click", handleFirstClick);
    return () => window.removeEventListener("click", handleFirstClick);
  }, []);


  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <>
      <div className="absolute top-10 left-10 w-72 bg-gray-100 rounded-2xl shadow-xl p-4 z-50">
        <div className="relative w-full aspect-square overflow-hidden rounded-xl">
          <Image src="/HMicon.jpg" alt="avatar" fill className="object-cover rounded-t-md" />
        </div>

        <h2 className="mt-4 text-xl font-black text-black">{place.song}</h2>
        <p className="mt-2 text-sm italic text-gray-600 leading-snug tracking-wide break-words">
          {place.event} @ {place.location}
        </p>

        <div className="mt-3 text-xs text-gray-600">
          {Math.floor(currentTime)} / {Math.floor(duration)} 秒
        </div>

        <input
          type="range"
          min={0}
          max={duration}
          value={currentTime}
          onChange={handleSeek}
          className="w-full mt-1"
        />

        <div className="flex gap-3 mt-4 justify-center">
          <button
            className=" text-3xl"
            onClick={() => setCurrentIndex((prev) => (prev - 1 + places.length) % places.length)}>⏮</button>
          <button
            className="bg-yellow-500 hover:bg-yellow-300 text-white text-3xl px-6 py-3 rounded-2xl shadow-lg transition"
            onClick={togglePlay}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button
            className=" text-3xl"
            onClick={() => setCurrentIndex((prev) => (prev + 1) % places.length)}>⏭</button>
        </div>
      </div>

      {places.map((p, index) => (
        <Marker
          key={p.id}
          longitude={p.longitude}
          latitude={p.latitude}
          onClick={() => setCurrentIndex(places.findIndex((x) => x.id === p.id))}
        >
          <div
            className={`w-2 h-2 rounded-full ${index <= currentIndex ? (places == Hamiltonplaces ? 'bg-orange-500' : '#01814A') : 'bg-blue-200'
              }`}
          />
        </Marker>
      ))}
    </>
  );
}