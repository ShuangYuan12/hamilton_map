"use client"

import dynamic from "next/dynamic";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import Map, { Marker, useMap, MapProvider } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';


const places = [
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

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const initCenter = {
    longitude: -69.2547,
    latitude: 30.89797,
    zoom: 3.5,
  };

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
          <MarkerList
            places={places}
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
        </Map>
      </MapProvider>

      <audio
        ref={audioRef}
        src={places[currentIndex].audio}
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
  }, [currentIndex, mainMap]);

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

      {places.map((p) => (
        <Marker
          key={p.id}
          longitude={p.longitude}
          latitude={p.latitude}
          onClick={() => setCurrentIndex(places.findIndex((x) => x.id === p.id))}
        >
          <div className="w-2 h-2 bg-orange-500 rounded-full" />
        </Marker>
      ))}
    </>
  );
}
