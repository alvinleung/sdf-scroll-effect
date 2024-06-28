/** @type {import('next').NextConfig} */
const nextConfig = {
  // DANGEROUS
  // React strict mode causes double instaniation of the Object
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(frag|vert)$/,
      type: "asset/source",
    });
    return config;
  },
};

export default nextConfig;
