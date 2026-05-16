import AdminAuthController from './AdminAuthController'
import AuthController from './AuthController'
import DriverAssignmentController from './DriverAssignmentController'
import DriverController from './DriverController'
import NotificationController from './NotificationController'
import PassengerController from './PassengerController'
import PassengerProfileController from './PassengerProfileController'
import PickupRequestController from './PickupRequestController'
import RouteController from './RouteController'
import ShuttleController from './ShuttleController'
import ShuttleLocationController from './ShuttleLocationController'
import StopController from './StopController'
const Api = {
    AuthController: Object.assign(AuthController, AuthController),
AdminAuthController: Object.assign(AdminAuthController, AdminAuthController),
NotificationController: Object.assign(NotificationController, NotificationController),
PassengerProfileController: Object.assign(PassengerProfileController, PassengerProfileController),
RouteController: Object.assign(RouteController, RouteController),
StopController: Object.assign(StopController, StopController),
ShuttleController: Object.assign(ShuttleController, ShuttleController),
PassengerController: Object.assign(PassengerController, PassengerController),
DriverController: Object.assign(DriverController, DriverController),
PickupRequestController: Object.assign(PickupRequestController, PickupRequestController),
DriverAssignmentController: Object.assign(DriverAssignmentController, DriverAssignmentController),
ShuttleLocationController: Object.assign(ShuttleLocationController, ShuttleLocationController),
}

export default Api