import dynamic from "next/dynamic";

const ReactGlobe = dynamic(() => import("@/components/ReactGlobe"), {
  ssr: false, // Disable SSR for this component
});

export default function page() {
  return <ReactGlobe />;
}
