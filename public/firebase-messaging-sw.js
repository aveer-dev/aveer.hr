importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

// Set Firebase configuration, once available
self.addEventListener('fetch', () => {
	try {
		const urlParams = new URLSearchParams(location.search);
		self.firebaseConfig = Object.fromEntries(urlParams);
	} catch (err) {
		console.error('Failed to add event listener', err);
	}
});

// "Default" Firebase configuration (prevents errors)
const defaultConfig = {
	apiKey: true,
	projectId: true,
	messagingSenderId: true,
	appId: true
};

// Initialize Firebase app
firebase.initializeApp(self.firebaseConfig || defaultConfig);
let messaging;
try {
	messaging = firebase.messaging.isSupported() ? firebase.messaging() : null;
} catch (err) {
	console.error('Failed to initialize Firebase Messaging', err);
}

// To dispaly background notifications
if (messaging) {
	try {
		messaging.onBackgroundMessage(payload => {
			const notificationTitle = payload.notification.title;
			const notificationOptions = {
				body: payload.notification.body,
				tag: notificationTitle, // tag is added to ovverride the notification with latest update
				icon: 'https://api.aveer.hr/storage/v1/object/public/platform%20assets/logo/aveer-round.png',
				data: {
					url: payload?.data?.openUrl
				}
			};

			self.registration.showNotification(notificationTitle, notificationOptions);
		});
	} catch (err) {
		console.log(err);
	}
}
