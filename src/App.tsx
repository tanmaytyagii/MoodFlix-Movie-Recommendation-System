import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Recommendations from './pages/Recommendations';
import About from './pages/About';
import MovieDetails from './pages/MovieDetails';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="flex min-h-screen flex-col bg-canvas text-ink">
          <Header />
          {/* Offsets the floating header: inset + bar height, plus the mobile search row. */}
          <main className="flex-grow pt-[8.25rem] md:pt-[5.5rem]">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/about" element={<About />} />
              <Route path="/movie/:id" element={<MovieDetails />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
