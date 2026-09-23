import { resolve } from "path";
import { defineConfig } from "vite";
import fs from "fs";

export default defineConfig({
  plugins: [
    {
      name: "clean-urls-routing",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const [pathname, search] = req.url.split("?");
          const query = search ? `?${search}` : "";

          // Redirect *.html to clean URLs
          const cleanRoutes = ["events", "team", "sponsors", "guidelines"];
          for (const route of cleanRoutes) {
            if (pathname === `/${route}.html`) {
              res.writeHead(301, { Location: `/${route}${query}` });
              return res.end();
            }

            if (pathname === `/${route}`) {
              const accept = req.headers.accept || "";
              if (accept.includes("text/html") || !accept.includes("application/javascript")) {
                req.url = `/${route}/${query}`;
              }
            }
          }

          next();
        });
      },
    },
  ],
  server: {
    watch: {
      usePolling: true,
      interval: 1000,
      ignored: [
        "**/public/**",
        "**/node_modules/**",
        "**/dist/**",
      ],
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        events: resolve(__dirname, "events/index.html"),
        eventsLegacy: resolve(__dirname, "events.html"),
        team: resolve(__dirname, "team/index.html"),
        teamLegacy: resolve(__dirname, "team.html"),
        sponsors: resolve(__dirname, "sponsors/index.html"),
        sponsorsLegacy: resolve(__dirname, "sponsors.html"),
        guidelines: resolve(__dirname, "guidelines/index.html"),
        guidelinesLegacy: resolve(__dirname, "guidelines.html"),
      },
    },
  },
});

