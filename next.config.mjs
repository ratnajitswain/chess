/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  env:{
    GOOGLE_AI_API_KEY:process.env.GOOGLE_AI_API_KEY,
    JWT_SECRET:process.env.JWT_SECRET,
    MONGODB_URI:process.env.MONGODB_URI,
    AI_USER_ID:process.env.AI_USER_ID,
    AI_USER_OBJECT_ID:process.env.AI_USER_OBJECT_ID
  }
};

export default nextConfig;
