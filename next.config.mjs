/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: false,
	webpack: config => {
		config.resolve.alias.canvas = false;

		return config;
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '**.supabase.co'
			}
		]
	}
};

export default nextConfig;
