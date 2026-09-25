import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Dev only: let a phone on the same network load the dev server, to try the
  // camera on a real touch screen. No effect on production builds.
  allowedDevOrigins: ['192.168.*.*'],
};

export default nextConfig;
