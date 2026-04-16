import { Outlet } from 'react-router-dom';
import Topbar from '../components/Topbar';
import Navbar from '../components/Navbar';
import BannerSlider from '../components/BannerSlider';
import Footer from '../components/Footer';

export default function PublicLayout() {
  return (
    <>
      <Topbar />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
