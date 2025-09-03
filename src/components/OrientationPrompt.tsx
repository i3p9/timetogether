import { useState, useEffect } from "react";
import { RotateCcw, X } from "lucide-react";

export function OrientationPrompt() {
	const [showPrompt, setShowPrompt] = useState(false);

	useEffect(() => {
		const checkOrientation = () => {
			const isLandscape = window.matchMedia("(orientation: landscape)").matches;
			const isDesktop = window.matchMedia("(min-width: 768px)").matches;
			const isMobile = window.matchMedia("(max-width: 767px)").matches;
			
			// Show prompt if on mobile in landscape or on desktop
			const shouldShow = (isMobile && isLandscape) || isDesktop;
			
			// Check if user has dismissed this prompt recently
			const dismissed = localStorage.getItem("time-together-orientation-dismissed");
			if (dismissed) {
				const dismissedTime = parseInt(dismissed);
				const hourAgo = Date.now() - 60 * 60 * 1000;
				if (dismissedTime > hourAgo) {
					return;
				}
			}
			
			setShowPrompt(shouldShow);
		};

		// Check on mount
		checkOrientation();

		// Listen for orientation changes
		const mediaQuery = window.matchMedia("(orientation: landscape)");
		const desktopQuery = window.matchMedia("(min-width: 768px)");
		
		mediaQuery.addEventListener("change", checkOrientation);
		desktopQuery.addEventListener("change", checkOrientation);
		window.addEventListener("resize", checkOrientation);

		return () => {
			mediaQuery.removeEventListener("change", checkOrientation);
			desktopQuery.removeEventListener("change", checkOrientation);
			window.removeEventListener("resize", checkOrientation);
		};
	}, []);

	const handleDismiss = () => {
		setShowPrompt(false);
		localStorage.setItem(
			"time-together-orientation-dismissed",
			Date.now().toString()
		);
	};

	if (!showPrompt) {
		return null;
	}

	return (
		<div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
			<div className="max-w-md mx-auto bg-white/95 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-2xl ios-card">
				<div className="p-6">
					<div className="flex items-start gap-4">
						<div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl flex items-center justify-center text-white flex-shrink-0">
							<RotateCcw size={24} />
						</div>
						<div className="flex-1">
							<h3 className="text-lg font-semibold text-black mb-1">
								Best in Portrait Mode
							</h3>
							<p className="text-sm text-gray-600 mb-4">
								TimeTogether is designed for mobile devices in portrait mode for the optimal experience!
							</p>
							<div className="flex gap-3">
								<button
									onClick={handleDismiss}
									className="flex-1 bg-orange-600 text-white py-3 px-4 rounded-2xl text-sm font-medium native-button shadow-lg shadow-orange-600/25"
								>
									Got it
								</button>
							</div>
						</div>
						<button
							onClick={handleDismiss}
							className="w-8 h-8 bg-gray-100/80 rounded-full flex items-center justify-center text-gray-500 native-button flex-shrink-0"
						>
							<X size={16} />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}