import AuthController from './AuthController'
import AdminAuthController from './AdminAuthController'
import NotificationController from './NotificationController'
import PassengerProfileController from './PassengerProfileController'
import RouteController from './RouteController'
import StopController from './StopController'
import ShuttleController from './ShuttleController'
import PassengerController from './PassengerController'
import DriverController from './DriverController'
import PickupRequestController from './PickupRequestController'
import DriverAssignmentController from './DriverAssignmentController'
import ShuttleLocationController from './ShuttleLocationController'
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