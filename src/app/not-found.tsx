import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: "var(--background)" }}
    >
      <p className="text-sm font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>404</p>
      <h1 className="text-2xl font-semibold mb-2">Page not found</h1>
      <p className="text-sm mb-8" style={{ color: "var(--muted-foreground)" }}>
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
      >
        Go Home
      </Link>
    </div>
  );
}
