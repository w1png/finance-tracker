import Footer from "./footer";
import Navbar from "./navbar";

export default function LandingLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div>{children}</div>
      <Footer />
    </>
  );
}
