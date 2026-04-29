import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-4 text-slate-300">Page not found.</p>
      <Link className="mt-6 inline-block text-navy hover:underline" href="/">
        Back home
      </Link>
    </section>
  );
}
