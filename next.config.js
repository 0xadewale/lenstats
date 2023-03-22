/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  productionBrowserSourceMaps: true,
  images: {
    domains: [
      'ipfs.infura.io',
      'statics-polygon-lens-staging.s3.eu-west-1.amazonaws.com',
      'lens.infura-ipfs.io',
      'media.orb.ac'
    ]
  },
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: 'https://sitemap.lenstats.xyz/sitemap.xml'
      },
      {
        source: '/sitemaps/:match*',
        destination: 'https://sitemap.lenstats.xyz/sitemaps/:match*'
      }
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin' },
          { key: 'Permissions-Policy', value: 'interest-cohort=()' }
        ]
      }
    ];
  }
}

module.exports = nextConfig
