/** @type {import('next').NextConfig} */
const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL
  ? new URL(process.env.NEXT_PUBLIC_WORDPRESS_URL)
  : undefined;

if (wordpressUrl && wordpressUrl.protocol !== "http:" && wordpressUrl.protocol !== "https:") {
  throw new Error("NEXT_PUBLIC_WORDPRESS_URL must use HTTP or HTTPS.");
}

const nextConfig = {
  output: "standalone",
  pageExtensions: ["ts", "tsx", "mdx"],
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [68, 75, 82],
    remotePatterns: wordpressUrl
      ? [{
          protocol: wordpressUrl.protocol === "https:" ? "https" : "http",
          hostname: wordpressUrl.hostname,
          port: wordpressUrl.port,
          pathname: "/**",
        }]
      : [],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;