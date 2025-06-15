import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import BookmarkPage from './pages/BookmarkPage';
import TvSeriesPage from './pages/TvSeriesPage';
import MoviesPage from './pages/MoviesPage';
import DetailInfoPage from './pages/DetailInfoPage';

const App = () => {
    return (
        <Router>
    <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/LoginPage" element={<LoginPage />} />
        <Route path="/RegisterPage" element={<RegisterPage />} />
        <Route path="/ProfilePage" element={<ProfilePage />} />
        <Route path="/BookmarkPage" element={<BookmarkPage />} />
        <Route path="/TvSeriesPage" element={<TvSeriesPage />} />
        <Route path="/MoviesPage" element={<MoviesPage />} />
        <Route path="/DetailInfoPage/:productId" element={<DetailInfoPage />} />
        {/* Add more routes for other pages */}
    </Routes>
</Router>
    );
};

export default App;
