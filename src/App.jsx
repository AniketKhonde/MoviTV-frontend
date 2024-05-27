import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import ProfilePage from './ProfilePage';
import BookmarkPage from './BookmarkPage';
import TvSeriesPage from './TvSeriesPage';
import MoviesPage from './MoviesPage';
import DetailInfoPage from './DetailInfoPage';

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
