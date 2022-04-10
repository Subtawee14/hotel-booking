import App from '@/app';
import AuthRoute from '@routes/auth.route';
import IndexRoute from '@routes/index.route';
import UsersRoute from '@routes/users.route';
import validateEnv from '@utils/validateEnv';
import HotelRoute from '@routes/hotels.route';
import BookingRoute from './routes/bookings.route';

validateEnv();

const app = new App([new IndexRoute(), new UsersRoute(), new AuthRoute(), new HotelRoute(), new BookingRoute()]);

app.listen();
