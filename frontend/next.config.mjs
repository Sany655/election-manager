/** @type {import('next').NextConfig} */
const nextConfig = {
    distDir: process.env.NEXT_DIST_DIR || '.next',
    images: {
        domains: [
          ...(process.env.NEXT_PUBLIC_ALLOWED_IMAGE_DOMAINS
            ? process.env.NEXT_PUBLIC_ALLOWED_IMAGE_DOMAINS.split(',')
            : ['i.pravatar.cc', 'github.com', 'localhost', 'api-remark.modern-printers.com', '182.160.114.99']),
          new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8001').hostname
        ],
      },
};

export default nextConfig;
