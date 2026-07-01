/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.unicomcx.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  // تم تعطيل typedRoutes لإصلاح خطأ TypeScript في صفحات auth
  // experimental: {
  //   typedRoutes: true,
  // },
};

export default nextConfig;
