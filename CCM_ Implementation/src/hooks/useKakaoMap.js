import { useEffect, useRef, useState } from 'react';

export default function useKakaoMap({ onMapClick }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    const initMap = () => {
      if (!mapContainer.current) return;

      const center = new window.kakao.maps.LatLng(
        35.8242,
        128.7530
      );

      const map = new window.kakao.maps.Map(
        mapContainer.current,
        {
          center,
          level: 3
        }
      );

      mapRef.current = map;
      setMapReady(true);

      window.kakao.maps.event.addListener(
        map,
        'click',
        (mouseEvent) => {
          const latlng = mouseEvent.latLng;

          onMapClick({
            lat: latlng.getLat(),
            lng: latlng.getLng()
          });
        }
      );
    };

    if (window.kakao && window.kakao.maps) {
      initMap();
      return;
    }

    const script = document.createElement('script');
    script.src =
      'https://dapi.kakao.com/v2/maps/sdk.js?appkey=8309e0e8095058bb527deb1918011c3c&autoload=false';
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        initMap();
      });
    };

    document.head.appendChild(script);
  }, [onMapClick]);

  return {
    mapContainer,
    mapRef,
    mapReady
  };
}