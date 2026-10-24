import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8888";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/:path*`,
      },
      {
        source: "/home",
        destination: `${BACKEND_URL}/home`,
      },
      {
        source: "/tab/:path*",
        destination: `${BACKEND_URL}/tab/:path*`,
      },
      {
        source: "/anime",
        destination: `${BACKEND_URL}/anime`,
      },
      {
        source: "/rankings",
        destination: `${BACKEND_URL}/rankings`,
      },
      {
        source: "/discovery",
        destination: `${BACKEND_URL}/discovery`,
      },
      {
        source: "/trending",
        destination: `${BACKEND_URL}/trending`,
      },
      {
        source: "/movies",
        destination: `${BACKEND_URL}/movies`,
      },
      {
        source: "/short-tv",
        destination: `${BACKEND_URL}/short-tv`,
      },
      {
        source: "/kids",
        destination: `${BACKEND_URL}/kids`,
      },
      {
        source: "/education",
        destination: `${BACKEND_URL}/education`,
      },
      {
        source: "/music",
        destination: `${BACKEND_URL}/music`,
      },
      {
        source: "/asian",
        destination: `${BACKEND_URL}/asian`,
      },
      {
        source: "/western",
        destination: `${BACKEND_URL}/western`,
      },
      {
        source: "/nollywood",
        destination: `${BACKEND_URL}/nollywood`,
      },
      {
        source: "/game",
        destination: `${BACKEND_URL}/game`,
      },
      {
        source: "/search-suggestions",
        destination: `${BACKEND_URL}/search-suggestions`,
      },
      {
        source: "/search",
        destination: `${BACKEND_URL}/search`,
      },
      {
        source: "/rooms/:path*",
        destination: `${BACKEND_URL}/rooms/:path*`,
      },
      {
        source: "/groups/:path*",
        destination: `${BACKEND_URL}/groups/:path*`,
      },
      {
        source: "/post/:path*",
        destination: `${BACKEND_URL}/post/:path*`,
      },

      {
        source: "/episodes/:path*",
        destination: `${BACKEND_URL}/episodes/:path*`,
      },
      {
        source: "/stream/:path*",
        destination: `${BACKEND_URL}/stream/:path*`,
      },
      {
        source: "/download/:path*",
        destination: `${BACKEND_URL}/download/:path*`,
      },
      {
        source: "/subtitles/:path*",
        destination: `${BACKEND_URL}/subtitles/:path*`,
      },
      {
        source: "/history/:path*",
        destination: `${BACKEND_URL}/history/:path*`,
      },
      {
        source: "/watchlist/:path*",
        destination: `${BACKEND_URL}/watchlist/:path*`,
      },
      {
        source: "/watchlist",
        destination: `${BACKEND_URL}/watchlist`,
      },
      {
        source: "/user-info",
        destination: `${BACKEND_URL}/user-info`,
      },
      {
        source: "/login",
        destination: `${BACKEND_URL}/login`,
      },
      {
        source: "/logout",
        destination: `${BACKEND_URL}/logout`,
      },
      {
        source: "/register",
        destination: `${BACKEND_URL}/register`,
      },
      {
        source: "/request-otp",
        destination: `${BACKEND_URL}/request-otp`,
      },
      {
        source: "/sub-proxy",
        destination: `${BACKEND_URL}/sub-proxy`,
      },
      {
        source: "/play-compat/:path*",
        destination: `${BACKEND_URL}/play-compat/:path*`,
      },
      {
        source: "/launch-player",
        destination: `${BACKEND_URL}/launch-player`,
      },
      {
        source: "/analytics/:path*",
        destination: `${BACKEND_URL}/analytics/:path*`,
      },
      {
        source: "/health",
        destination: `${BACKEND_URL}/health`,
      },
    ];
  },
};

export default nextConfig;
