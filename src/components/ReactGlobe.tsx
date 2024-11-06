"use client";

import Globe, { type GlobeMethods } from "react-globe.gl";

import { useEffect, useRef, useState } from "react";
import { Cluster, createClusters } from "./createClusters";
import { globeData } from "./globeData";
import * as THREE from "three";

const CLUSTER_KM = 0;

export default function ReactGlobe() {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);

  const initClusters = createClusters(globeData, CLUSTER_KM);
  const [filter, setFilter] = useState("all");
  const [filterdClusters, setFilteredClusters] = useState(initClusters);
  const [globeSize, setGlobeSize] = useState<{ width: number; height: number } | undefined>(undefined);
  const [modal, setModal] = useState<Cluster | null>(null);

  useEffect(() => {
    if (!globeRef.current) return;
    const globe = globeRef.current;

    // Globe base settings
    globe.controls().enableZoom = false;
    globe.controls().touches.ONE = null;
    globe.controls().touches.TWO = THREE.TOUCH.DOLLY_ROTATE;

    // Settings depending on modal
    if (modal) {
      globe.pointOfView({ lat: modal.lat, lng: modal.lng, altitude: 0.15 }, 700);
      globe.controls().autoRotate = false;
    } else {
      globe.pointOfView({ altitude: 1.7 }, 700);
      globe.controls().autoRotate = true;
      globe.controls().autoRotateSpeed = 0.35;
    }

    // Handle browser resize
    handleResize();
    window.addEventListener("resize", handleResize);
    function handleResize() {
      if (!globeRef.current) return;
      setGlobeSize({ width: window.innerWidth, height: window.innerHeight });
    }
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [globeRef, modal]);

  // Filter updates
  useEffect(() => {
    const filteredData = globeData.filter((gData) => gData.type == filter || filter == "all");
    setFilteredClusters(createClusters(filteredData, CLUSTER_KM));
  }, [filter]);

  return (
    <div>
      <div className="h-screen bg-white" />
      <div className="relative w-screen h-screen [&_canvas]:!touch-auto">
        <Globe
          ref={globeRef}
          globeImageUrl={"/globe-blue-marble.jpg"}
          backgroundColor={"#000"}
          width={globeSize?.width}
          height={globeSize?.height}
          animateIn={false}
          htmlElementsData={filterdClusters}
          htmlElement={(d) => htmlStringPin({ cluster: d as Cluster, modal, setModal })}
        />

        {/* Filter */}
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

        {/* Modal */}
        <div
          className={`absolute top-10 left-10 bottom-10 w-[70%] max-w-[500px] bg-black bg-opacity-30 rounded-xl backdrop-blur-lg p-6 z-[200] ${
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
      <div className="h-screen bg-white" />
    </div>
  );
}

function htmlStringPin({
  cluster,
  modal,
  setModal,
}: {
  cluster: Cluster;
  modal: Cluster | null;
  setModal: React.Dispatch<React.SetStateAction<Cluster | null>>;
}): HTMLElement {
  const el = document.createElement("div");

  function generateTitle(cluster: Cluster) {
    let title = "";
    cluster.locations.forEach((loc, index) => {
      if (index == 0) title += loc.title;
      else title += `,<br>${loc.title}`;
    });
    return title;
  }

  const markerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" fill="none">
  <path d="M9 0C4.03952 0 0 4.0381 0 8.99683C0 13.9619 4.03317 18 9 18C13.9668 18 18 13.9619 18 9.00318C18.0063 4.0381 13.9605 0 9 0ZM9 14.4C6.02117 14.4 3.60127 11.9746 3.60127 9.00318C3.60127 6.03175 6.02752 3.60635 9 3.60635C11.9725 3.60635 14.3987 6.0254 14.3987 9.00318C14.4051 11.9746 11.9788 14.4 9 14.4Z" fill="currentColor"/>
  </svg>`;

  el.innerHTML = `
  <div data-id="${cluster.id}" class="globe-marker relative ${
    cluster.locations.length > 1 ? "h-14" : "h-10"
  } flex justify-center items-center transition-transform duration-700 group ${
    modal ? (modal.id == cluster.id ? "scale-125" : "scale-75") : ""
  }">

    <div class="backdrop-blur-lg p-1 rounded-full bg-opacity-20  text-[#00FF00] bg-[#00FF00] transition-[width,height] duration-300 ${
      cluster.locations.length > 1 ? "size-12 hover:size-14" : "size-8 hover:size-10"
    }" >
      ${markerSvg}
      </div>
      ${
        cluster.locations.length > 1
          ? `<p class="absolute text-xs text-white pointer-events-none">${cluster.locations.length}</p>`
          : ""
      }

    <p class="pin-text absolute block top-full text-center whitespace-nowrap pointer-events-none font-normal backdrop-blur-lg px-2 py-1 rounded-md text-xs group-hover:opacity-100 transition-opacity duration-300 ${
      modal ? (modal.id == cluster.id ? "opacity-100" : "opacity-0") : "opacity-0"
    }" >${generateTitle(cluster)}</p>

  </div>
  `;

  el.style.cursor = "pointer";
  el.style.pointerEvents = "auto";
  el.onclick = () => {
    setModal(cluster);
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
}
