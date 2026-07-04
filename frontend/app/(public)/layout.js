// Public layout shell.
//
// Renders the lightweight chrome used by the public marketing pages:
// the landing page at `/` and the dynamic candidate profile at `/[slug]`.
//
// Intentionally does NOT import `DefaultLayout`, `Sidebar`, `Header`,
// `ProtectedRoute`, or any auth context. The root `app/layout.js` already
// supplies the `<html>` and `<body>` wrappers, so this layout only renders
// the public navbar, a `<main>` slot for the page, and a footer.
import PublicNavbar from "../components/public/PublicNavbar";
import PublicFooter from "../components/public/PublicFooter";


export default function PublicLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
