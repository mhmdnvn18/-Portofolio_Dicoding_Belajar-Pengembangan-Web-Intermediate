import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import MapPage from '../pages/map/map-page';
import PlantPage from '../pages/plant/plant-page';
import LoginPage from '../pages/login/login-page';
import RegisterPage from '../pages/register/register-page';
import CalendarPage from '../pages/calendar/calendar-page';
import GrowthPage from '../pages/growth/growth-page';
import AddStoryPage from '../pages/add-story/add-story-page';

const routes = {
  '/': new HomePage(),
  '/about': new AboutPage(),
  '/map': new MapPage(),
  '/plant': new PlantPage(),
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
  '/calendar': new CalendarPage(),
  '/growth': new GrowthPage(),
  '/add-story': new AddStoryPage(),
};

export default routes;
