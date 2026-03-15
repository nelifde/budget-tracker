const path = require("node:path");

/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "standalone",
	// Monorepo: use frontend as root so Next doesn't use parent lockfile
	outputFileTracingRoot: path.join(__dirname),
};
module.exports = nextConfig;
