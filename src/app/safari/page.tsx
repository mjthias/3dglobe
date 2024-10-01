import dynamic from "next/dynamic";

const ThreeDGlobe = dynamic(() => import("@/components/SafariGlobe"), {
  ssr: false, // Disable SSR for this component
});

export default function Page() {
  return <ThreeDGlobe />;
}
