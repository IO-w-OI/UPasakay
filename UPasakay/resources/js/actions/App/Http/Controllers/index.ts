import Api from './Api'
import DashboardController from './DashboardController'
import LiveMapController from './LiveMapController'
import AdminController from './AdminController'
import DriverController from './DriverController'
import ShuttleWebController from './ShuttleWebController'
import PickupRequestController from './PickupRequestController'
import PassengerApprovalController from './PassengerApprovalController'
import NotificationController from './NotificationController'
import FeedbackController from './FeedbackController'
import Settings from './Settings'
const Controllers = {
    Api: Object.assign(Api, Api),
DashboardController: Object.assign(DashboardController, DashboardController),
LiveMapController: Object.assign(LiveMapController, LiveMapController),
AdminController: Object.assign(AdminController, AdminController),
DriverController: Object.assign(DriverController, DriverController),
ShuttleWebController: Object.assign(ShuttleWebController, ShuttleWebController),
PickupRequestController: Object.assign(PickupRequestController, PickupRequestController),
PassengerApprovalController: Object.assign(PassengerApprovalController, PassengerApprovalController),
NotificationController: Object.assign(NotificationController, NotificationController),
FeedbackController: Object.assign(FeedbackController, FeedbackController),
Settings: Object.assign(Settings, Settings),
}

export default Controllers