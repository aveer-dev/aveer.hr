// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
	dsn: 'https://c9356578e023a6500228f22ddbbd5fc5@o1081937.ingest.us.sentry.io/4508133308497921',

	// Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
	tracesSampleRate: 0.8,

	// Setting this option to true will print useful information to the console while you're setting up Sentry.
	debug: false
});
