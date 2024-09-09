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
      </ul>
    </main>
  );
}
