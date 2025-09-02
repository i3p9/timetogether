import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		VitePWA({
			registerType: "prompt",
			injectRegister: false,

			pwaAssets: {
				disabled: false,
				config: true,
			},

			manifest: {
				name: "TimeTogether",
				short_name: "TimeTogether",
				description: "Track time zones for friends, family, and colleagues worldwide",
				theme_color: "#075985",
				background_color: "#075985",
				display: "standalone",
				orientation: "portrait",
				scope: "/",
				start_url: "/",
				id: "/",
				categories: ["productivity", "utilities", "social"],
				icons: [
					{
						src: "/android/android-launchericon-48-48.png",
						sizes: "48x48",
						type: "image/png",
						purpose: "maskable any"
					},
					{
						src: "/android/android-launchericon-72-72.png",
						sizes: "72x72",
						type: "image/png",
						purpose: "maskable any"
					},
					{
						src: "/android/android-launchericon-96-96.png",
						sizes: "96x96",
						type: "image/png",
						purpose: "maskable any"
					},
					{
						src: "/android/android-launchericon-144-144.png",
						sizes: "144x144",
						type: "image/png",
						purpose: "maskable any"
					},
					{
						src: "/android/android-launchericon-192-192.png",
						sizes: "192x192",
						type: "image/png",
						purpose: "maskable any"
					},
					{
						src: "/android/android-launchericon-512-512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "maskable any"
					},
					{
						src: "/ios/180.png",
						sizes: "180x180",
						type: "image/png"
					}
				],
			},

			workbox: {
				globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
				cleanupOutdatedCaches: true,
				clientsClaim: true,
			},

			devOptions: {
				enabled: true,
				navigateFallback: "index.html",
				suppressWarnings: true,
				type: "module",
			},
		}),
	],
});
