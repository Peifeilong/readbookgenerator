import Link from "next/link";
export default function Home() {
  return (
    <div>
      <div>Hello, Next.js!</div>
      <div>
        <Link rel="stylesheet" href="/about/temp">
          跳转
        </Link>
      </div>
    </div>
  );
}
