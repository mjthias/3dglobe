"use client";

import Globe from "globe.gl";
import * as THREE from "three";
import { useCallback, useEffect, useRef, useState } from "react";
import { globeData } from "./globeData";

type GDataObject = {
  id: string;
  title: string;
  text: string;
  lat: number;
  lng: number;
};

export default function ThreeDGlobe() {
  const [modal, setModal] = useState<GDataObject | null>(null);
  const globeRef = useRef<HTMLDivElement | null>(null);

  const markerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" fill="none">
<path d="M9 0C4.03952 0 0 4.0381 0 8.99683C0 13.9619 4.03317 18 9 18C13.9668 18 18 13.9619 18 9.00318C18.0063 4.0381 13.9605 0 9 0ZM9 14.4C6.02117 14.4 3.60127 11.9746 3.60127 9.00318C3.60127 6.03175 6.02752 3.60635 9 3.60635C11.9725 3.60635 14.3987 6.0254 14.3987 9.00318C14.4051 11.9746 11.9788 14.4 9 14.4Z" fill="#00FF00"/>
</svg>`;

  const world = useCallback(Globe({ animateIn: false }), []);

  useEffect(() => {
    if (!globeRef.current) return;

    world(globeRef.current)
      .globeImageUrl("//unpkg.com/three-globe/example/img/earth-night.jpg")
      .backgroundImageUrl("//unpkg.com/three-globe/example/img/night-sky.png")
      .backgroundColor("#000")
      .htmlElementsData(globeData)
      .htmlElement((d) => {
        const obj = d as GDataObject;
        const el = document.createElement("div");
        el.innerHTML = `
        <div data-id="${obj.id}" class="globe-marker relative h-10 flex justify-center items-center transition-transform duration-700" >
          <div class="backdrop-blur-lg p-1 rounded-full bg-[#00FF00] bg-opacity-20 size-9 hover:size-10 transition-[width,height] duration-300" >
            ${markerSvg}
          </div>
          <p class="absolute top-full pointer-events-none text-center font-normal backdrop-blur-lg px-2 py-1 rounded-md text-xs" >${obj.title}</p>
        </div>
        `;
        // el.innerHTML = markerSvg;
        el.style.cursor = "pointer";
        el.style.pointerEvents = "auto";
        el.onclick = () => {
          setModal(obj);
        };
        return el;
      });

    world.controls().enableZoom = false;

    window.addEventListener("resize", handleResize);

    function handleResize() {
      if (!globeRef.current) return;
      const newWidth = globeRef.current.offsetWidth;
      const newHeight = globeRef.current.offsetHeight;
      world.width(newWidth);
      world.height(newHeight);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!modal) {
      world.controls().autoRotate = true;
      world.controls().autoRotateSpeed = 0.35;
    } else {
      world.controls().autoRotate = false;
    }

    if (modal) {
      world.pointOfView({ lat: modal.lat, lng: modal.lng, altitude: 1.5 }, 700);
      const markers = document.querySelectorAll<HTMLDivElement>(".globe-marker");
      markers.forEach((marker) => {
        if (marker.dataset?.id === modal.id) marker.classList.add("scale-125");
      });
    } else {
      const markers = document.querySelectorAll<HTMLDivElement>(".globe-marker");
      world.pointOfView({ altitude: 2.5 }, 700);
      markers.forEach((marker) => {
        marker.classList.remove("scale-125");
      });
    }
  }, [modal]);

  return (
    <>
      <div className="w-screen h-screen relative flex items-center justify-center">
        <div ref={globeRef} className="size-full" />

        <div
          className={`absolute p-10 backdrop-blur-lg z-[999999999] w-full max-w-md rounded-xl ease-in-out translate-y-[75%] ${
            !modal ? "opacity-0 translate-y-4 pointer-events-none" : "transition-opacity duration-200"
          }`}
        >
          <div className="flex justify-end">
            <button
              onClick={() => {
                setModal(null);
              }}
            >
              x
            </button>
          </div>
          <p className="text-2xl">{modal?.title}</p>
          <p className="text-sm mt-6">{modal?.text}</p>
        </div>
      </div>
    </>
  );
}
