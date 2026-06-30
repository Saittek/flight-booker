import { createRequire } from "module";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    resolveAlias: {
      buffer: require.resolve("buffer/"),
    },
  },
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        buffer: require.resolve("buffer/"),
      };

      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
        }),
      );
    }

    return config;
  },
};

initOpenNextCloudflareForDev();

export default nextConfig;
