"use client"

import Image from "next/image";
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function Home() {

  const places = [
    { song: "Alexander Hamilton", event: "出生", location: "英屬背風群島尼維斯島", latitude: 17.13537397597739, longitude: -62.62599687346717 },
    { song: "My Shot", event: "學院崛起", location: "伊莉莎白鎮學院", latitude: 40.781307026849134, longitude: -74.43696283038658 },
    { song: "Satisfied", event: "結婚", location: "漢密爾頓住宅國家紀念區", latitude: 40.849825752958175, longitude: -73.95964423157923 },
    { song: "Guns and Ships", event: "獨立戰爭", location: "維吉尼亞州約克鎮", latitude: 37.241792067138796, longitude: -76.5216979492628 },
    { song: "Non-Stop", event: "寫論文", location: "美國獨立紀念館", latitude: 39.94898882024012, longitude: -75.14998038809651 },
    { song: "Say No to This", event: "外遇", location: "三一教堂墓園和陵墓", latitude: 40.83320497670361, longitude: -73.94909794572479 },
    { song: "The Room Where It Happens", event: "內政與財政政策衝突", location: "華盛頓哥倫比亞特區國會山", latitude: 38.886077218944685, longitude: -76.99954101138947 },
    { song: "It’s Quiet Uptown", event: "移居鄉下", location: "曼哈頓上城", latitude: 40.82400392398603, longitude: -73.94480803038849 },
    { song: "Who Lives, Who Dies, Who Tells Your Story", event: "死亡", location: "美國紐約紐約格林尼治村", latitude: 40.73118879709873, longitude: -73.99728782422429 }
  ]

  return (
    <>
      <Map
        mapboxAccessToken="pk.eyJ1Ijoiamllbmh1YWdvbyIsImEiOiJjbTdsNjY0MjMwNDl2MmtzZHloYXY0czNkIn0.mlD3UGH3wR3ZMJmCuHDpSQ"
        initialViewState={{
          longitude: -69.2547008295843,
          latitude: 30.897972048254545,
          zoom: 3.5
        }}
        style={{ width: "100vw", height: "100vh" }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
      >

        {places.map((place) => (
          <Marker
            longitude={place.longitude}
            latitude={place.latitude}
            key={place.song}
          >

            <div className='w-2 h-2 bg-orange-500 rounded-full'></div>

          </Marker>
        ))}

      </Map>
    </>
  );
}
