import { withSentryConfig } from '@sentry/nextjs';
import createMDX from '@next/mdx';
/** @type {import('next').NextConfig} */

const nextConfig = {
	reactStrictMode: false,
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '**.supabase.co'
			},
			{
				protocol: 'https',
				hostname: '**.aveer.hr'
			},
			{
				protocol: 'https',
				hostname: 'aveer.hr'
			},
			{
				hostname: '127.0.0.1'
			}
		]
	},
	turbopack: {
		resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json']
	},
	sassOptions: {
		silenceDeprecations: ['legacy-js-api']
	},
	headers() {
		return [
			{
				source: '/',
				headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }]
			}
		];
	},
	experimental: {
		serverActions: {
			bodySizeLimit: '10mb'
		},
		mdxRs: true
	},
	transpilePackages: ['next-mdx-remote'],
	pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx']
};

const withMDX = createMDX({
	extension: /\.mdx?$/
});

const mergedConfig = withMDX(nextConfig);

export default withSentryConfig(mergedConfig, {
	// For all available options, see:
	// https://github.com/getsentry/sentry-webpack-plugin#options

	org: 'aveer',
	project: 'aveer-hr',

	// Only print logs for uploading source maps in CI
	silent: !process.env.CI,

	// For all available options, see:
	// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

	// Upload a larger set of source maps for prettier stack traces (increases build time)
	widenClientFileUpload: true,

	// Automatically annotate React components to show their full name in breadcrumbs and session replay
	reactComponentAnnotation: {
		enabled: true
	},

	// Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
	// This can increase your server load as well as your hosting bill.
	// Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
	// side errors will fail.
	tunnelRoute: '/monitoring',
	sendClientReports: false,

	// Hides source maps from generated client bundles
	hideSourceMaps: true,

	// Automatically tree-shake Sentry logger statements to reduce bundle size
	disableLogger: true,

	// Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
	// See the following for more information:
	// https://docs.sentry.io/product/crons/
	// https://vercel.com/docs/cron-jobs
	automaticVercelMonitors: true
});
