const path = require("node:path");

/** Backend URL for rewrites only (server-side). Browser uses same-origin /api/... unless NEXT_PUBLIC_API_URL is set. */
const backendUrl =
	process.env.BACKEND_URL || "http://127.0.0.1:4000";

/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "standalone",
	// Monorepo: use frontend as root so Next doesn't use parent lockfile
	outputFileTracingRoot: path.join(__dirname),
	async rewrites() {
		return [
			{
				source: "/api/:path*",
				destination: `${backendUrl}/api/:path*`,
			},
		];
	},
};
module.exports = nextConfig;
