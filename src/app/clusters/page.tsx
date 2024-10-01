import dynamic from "next/dynamic";

const ThreeDGlobe = dynamic(() => import("@/components/Globe2"), {
  ssr: false, // Disable SSR for this component
});

export default function Day() {
  return <ThreeDGlobe />;
}
