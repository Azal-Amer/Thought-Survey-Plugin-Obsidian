const electron = require("electron");
interface Time {
	hour: number;
	minute: number;
}
export class DesktopNotification {
	private isMobile() {
		return electron === undefined;
	}

	public async notify(
		title: string,
		body: string,
		deliveryTime: Time,
		URL: string
	) {
		const Notification = (electron as any).remote.Notification;
		if (!this.isMobile()) {
			const deliveryHour = deliveryTime.hour;
			const deliveryMinute = deliveryTime.minute;
			const currentDate = new Date();

			const sendNotification = () => {
				const notification = new Notification({
					title: title,
					body: body,
				});
				notification.on("click", () => {
					console.log("Notification clicked");
					window.open(URL);
				});
				notification.show();
			};

			const deliveryDate = new Date(
				currentDate.getFullYear(),
				currentDate.getMonth(),
				currentDate.getDate(),
				deliveryHour,
				deliveryMinute
			);
			const deliveryTimeDate =
				deliveryDate.getTime() - currentDate.getTime();
			if (deliveryTimeDate < 0) {
				console.log(
					"Delivery time is in the past, not sending notification"
				);
				return;
			} else {
				console.log(
					`Notification Scheduled for ${deliveryTime.hour}:${deliveryTime.minute}`
				);
				setTimeout(sendNotification, deliveryTimeDate);
			}
		} else {
			console.log("On Mobile Device, no notifications available");
		}
	}
}
