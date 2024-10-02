"use client";

import Globe from "globe.gl";
import * as THREE from "three";
import { useCallback, useEffect, useRef, useState } from "react";
import { globeData } from "./globeData";
import { createClusters, type Cluster } from "./createClusters";
import { div } from "three/webgpu";

function generateTitle(cluster: Cluster) {
  let title = "";
  cluster.locations.forEach((loc, index) => {
    if (index == 0) title += loc.title;
    else title += `,<br>${loc.title}`;
  });
  return title;
}

export default function ThreeDGlobe() {
  const clusters = createClusters(globeData, 100);

  const [modal, setModal] = useState<Cluster | null>(null);
  const globeRef = useRef<HTMLDivElement | null>(null);
  const [useWhite, setUseWhite] = useState(false);
  const [filter, setFilter] = useState("all");
  const [filteredClusters, setFilteredClusters] = useState(clusters);

  const markerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" fill="none">
<path d="M9 0C4.03952 0 0 4.0381 0 8.99683C0 13.9619 4.03317 18 9 18C13.9668 18 18 13.9619 18 9.00318C18.0063 4.0381 13.9605 0 9 0ZM9 14.4C6.02117 14.4 3.60127 11.9746 3.60127 9.00318C3.60127 6.03175 6.02752 3.60635 9 3.60635C11.9725 3.60635 14.3987 6.0254 14.3987 9.00318C14.4051 11.9746 11.9788 14.4 9 14.4Z" fill="currentColor"/>
</svg>`;

  const world = useCallback(Globe({ animateIn: false }), []);

  useEffect(() => {
    if (!globeRef.current) return;

    world(globeRef.current)
      .globeImageUrl("/globe-blue-marble.jpg")
      .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
      .backgroundColor("#000")
      .onGlobeReady(() => {
        globeRef.current?.classList.remove("opacity-0", "scale-50");
      });

    world.controls().enableZoom = false;
    world.width(window.innerWidth);
    world.controls().touches.ONE = undefined;

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
    world.htmlElementsData(filteredClusters).htmlElement((d) => {
      const obj = d as Cluster;
      const el = document.createElement("div");
      el.innerHTML = `
      <div data-id="${obj.id}" class="globe-marker relative ${
        obj.locations.length > 1 ? "h-14" : "h-10"
      } flex justify-center items-center transition-transform duration-700 group ${
        modal ? (modal.id == obj.id ? "scale-125" : "scale-75") : ""
      }">

        <div class="backdrop-blur-lg p-1 rounded-full bg-opacity-20  text-[#00FF00] bg-[#00FF00] transition-[width,height] duration-300 relative flex justify-center items-center ${
          obj.locations.length > 1 ? "size-12 hover:size-14" : "size-8 hover:size-10"
        }" >
          ${markerSvg}
          ${obj.locations.length > 1 ? `<p class="absolute text-xs text-white">${obj.locations.length}</p>` : ""}
        </div>

        <p class="pin-text absolute block top-full text-center whitespace-nowrap pointer-events-none font-normal backdrop-blur-lg px-2 py-1 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300" >${generateTitle(
          obj
        )}</p>

      </div>
      `;

      // el.innerHTML = markerSvg;
      el.style.cursor = "pointer";
      el.style.pointerEvents = "auto";
      el.onclick = () => {
        setModal(obj);
      };
      el.onmouseover = (e) => {
        const globeMarker = (e.target as HTMLElement).closest(".globe-marker");
        if (!globeMarker) return;
        const parent = globeMarker.parentElement;
        if (!parent) return;
        parent.classList.add("!z-[100]");
      };
      el.onmouseout = (e) => {
        const globeMarker = (e.target as HTMLElement).closest(".globe-marker");
        if (!globeMarker) return;
        const parent = globeMarker.parentElement;
        if (!parent) return;
        parent.classList.remove("!z-[100]");
      };
      return el;
    });
  }, [filteredClusters]);

  useEffect(() => {
    const filteredData = globeData.filter((gData) => gData.type == filter || filter == "all");
    setFilteredClusters(createClusters(filteredData, 100));
  }, [filter]);

  useEffect(() => {
    if (!modal) {
      world.controls().autoRotate = true;
      world.controls().autoRotateSpeed = 0.35;
    } else {
      world.controls().autoRotate = false;
    }

    if (modal) {
      world.pointOfView({ lat: modal.lat, lng: modal.lng, altitude: 0.7 }, 700);
      const markers = document.querySelectorAll<HTMLDivElement>(".globe-marker");
      markers.forEach((marker) => {
        if (marker.dataset?.id === modal.id + "") {
          marker.classList.add("scale-125");
          marker.classList.remove("scale-75");
          if (marker.querySelector(".pin-text")) {
            (marker.querySelector(".pin-text") as HTMLParagraphElement).style.opacity = "100%";
          }
        } else {
          marker.classList.add("scale-75");
          if (marker.querySelector(".pin-text")) {
            (marker.querySelector(".pin-text") as HTMLParagraphElement).style.opacity = "";
          }
        }
      });
    } else {
      const markers = document.querySelectorAll<HTMLDivElement>(".globe-marker");
      world.pointOfView({ altitude: 1.7 }, 700);
      markers.forEach((marker) => {
        marker.classList.remove("scale-125");
        marker.classList.remove("scale-75");
        if (marker.querySelector(".pin-text")) {
          (marker.querySelector(".pin-text") as HTMLParagraphElement).style.opacity = "";
        }
      });
    }
  }, [modal]);

  useEffect(() => {
    world.backgroundColor(useWhite ? "#fff" : "#000");
  }, [useWhite]);

  return (
    <div className={`h-screen relative flex items-center justify-center`}>
      <div ref={globeRef} />

      <div className="absolute top-10 right-10">
        <select
          id="type"
          className="bg-[#292929]"
          onChange={(e) => {
            setFilter(e.target.value);
          }}
        >
          <option value="all">All</option>
          <option value="project">Project</option>
          <option value="office">Office</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div
        className={`absolute top-10 left-10 bottom-10 w-[500px] bg-black bg-opacity-30 rounded-xl backdrop-blur-lg p-6 z-[200] ${
          !modal ? "opacity-0 translate-y-4 pointer-events-none" : "transition-opacity duration-200"
        }`}
      >
        <div className="flex justify-end">
          <button
            onClick={() => {
              setModal(null);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width={30} height={30} viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        {modal?.locations && modal.locations.length > 1 && (
          <div className="grid gap-10">
            {modal.locations.map((loc, index) => {
              return (
                <details key={`modal-accordion-${index}`}>
                  <summary className="text-2xl cursor-pointer">{loc.title}</summary>
                  <p className="text-sm mt-6">{loc.text}</p>
                </details>
              );
            })}
          </div>
        )}

        {modal?.locations && modal.locations.length === 1 && (
          <>
            <p className="text-2xl">{modal.locations[0].title}</p>
            <p className="text-sm mt-6">{modal.locations[0].text}</p>
          </>
        )}
      </div>
    </div>
  );
}
