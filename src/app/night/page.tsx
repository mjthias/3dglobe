import dynamic from "next/dynamic";

const ThreeDGlobeNight = dynamic(() => import("@/components/GlobeNight"), {
  ssr: false, // Disable SSR for this component
});

export default function Night() {
  return <ThreeDGlobeNight />;
}
