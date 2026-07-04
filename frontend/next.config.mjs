/** @type {import('next').NextConfig} */
const nextConfig = {
    distDir: process.env.NEXT_DIST_DIR || '.next',
    images: {
        unoptimized: true,
        remotePatterns: [
          ...(process.env.NEXT_PUBLIC_ALLOWED_IMAGE_DOMAINS
            ? process.env.NEXT_PUBLIC_ALLOWED_IMAGE_DOMAINS.split(',').map((domain) => ({ protocol: 'https', hostname: domain.trim() }))
            : [
                { protocol: 'https', hostname: 'i.pravatar.cc' },
                { protocol: 'https', hostname: 'github.com' },
                { protocol: 'http', hostname: 'localhost' },
                { protocol: 'https', hostname: 'api-remark.modern-printers.com' },
                { protocol: 'http', hostname: '182.160.114.99' },
              ]),
          { protocol: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8001').protocol.replace(':', ''), hostname: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8001').hostname }
        ],
      },
};

export default nextConfig;
