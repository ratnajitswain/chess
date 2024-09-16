/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  env:{
    JWT_SECRET:process.env.JWT_SECRET,
    MONGODB_URI:process.env.MONGODB_URI
  }
};

export default nextConfig;
