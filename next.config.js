/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure the output to be static HTML
  
  // Configure images to be unoptimized for static export
  images: {
    unoptimized: true,
  },
  
  // Configure trailing slash behavior
  trailingSlash: true,
}

module.exports = nextConfig