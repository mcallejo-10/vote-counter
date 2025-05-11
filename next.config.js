/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Desactivar ESLint durante el build en producción
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig