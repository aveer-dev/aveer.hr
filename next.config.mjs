/** @type {import('next').NextConfig} */

import path from 'node:path';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const cMapsDir = path.join(path.dirname(require.resolve('pdfjs-dist/package.json')), 'cmaps');
const standardFontsDir = path.join(path.dirname(require.resolve('pdfjs-dist/package.json')), 'standard_fonts');

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
	},
	plugins: [
		new CopyWebpackPlugin({
			patterns: [
				{
					from: cMapsDir,
					to: 'cmaps/'
				}
			]
		}),
		new CopyWebpackPlugin({
			patterns: [
				{
					from: standardFontsDir,
					to: 'standard_fonts/'
				}
			]
		})
	]
};

export default nextConfig;
