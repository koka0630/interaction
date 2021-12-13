// @ts-check

const path = require('path');

const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
];

/**
 * @type {import('next').NextConfig}
 **/
module.exports = {
  async headers() {
    return [
      {
        // Apply these headers to all routes in your application.
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  experimental: {
    optimizeFonts: true,
  },
  serverRuntimeConfig: {
    priviageAdminEmails: [
    ],
  },
  env: {
  },
  webpack(config) {
    config.resolve.alias['@components'] = path.join(__dirname, 'components');
    config.resolve.alias['@contexts'] = path.join(__dirname, 'contexts');
    config.resolve.alias['@lib'] = path.join(__dirname, 'lib');
    return config;
  },
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  i18n: {
    defaultLocale: 'ja',
    locales: ['ja', 'en'],
  },
};
