import Link from "next/link";

export default function NotFound() {
  return (
    <div className="tab-safe mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-6">
      <h1 className="large-title">Not found</h1>
      <p className="mt-3 text-[var(--secondary)]">That project is not here.</p>
      <Link href="/" className="ios-btn mt-6 w-fit px-6">
        Back to projects
      </Link>
    </div>
  );
}
