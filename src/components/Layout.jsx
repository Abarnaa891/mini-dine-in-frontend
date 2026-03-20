import Navbar from './Navbar';
import '../styles/layout.css';

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main className="main-content">{children}</main>
    </>
  );
}