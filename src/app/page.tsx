import Link from "next/link";

export default function Home() {
  return (
    <main>
      <ul className="p-10">
        <li>
          <Link href={"/day"}>Day globe</Link>
        </li>
        <li>
          <Link href={"/night"}>Night globe</Link>
        </li>

        <li>
          <a href="https://visibleearth.nasa.gov/collection/1484/blue-marble" target="_blank">
            Textures
          </a>
        </li>
      </ul>
    </main>
  );
}
