import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { TimezoneData, searchTimezones } from "../timezones";

interface Friend {
	id: string;
	name: string;
	timezone: string;
	timezoneDisplay: string;
	customLocation?: string;
	addedAt: Date;
}

interface FriendModalProps {
	showModal: boolean;
	editingFriend: Friend | null;
	friendName: string;
	setFriendName: (name: string) => void;
	selectedTimezone: TimezoneData | null;
	setSelectedTimezone: (tz: TimezoneData | null) => void;
	timezoneSearch: string;
	setTimezoneSearch: (search: string) => void;
	customLocation: string;
	setCustomLocation: (location: string) => void;
	showTimezoneDropdown: boolean;
	setShowTimezoneDropdown: (show: boolean) => void;
	onSave: () => void;
	onClose: () => void;
}

export function FriendModal({
	showModal,
	editingFriend,
	friendName,
	setFriendName,
	selectedTimezone,
	setSelectedTimezone,
	timezoneSearch,
	setTimezoneSearch,
	customLocation,
	setCustomLocation,
	showTimezoneDropdown,
	setShowTimezoneDropdown,
	onSave,
	onClose,
}: FriendModalProps) {
	const [isVisible, setIsVisible] = useState(false);
	const [isClosing, setIsClosing] = useState(false);

	useEffect(() => {
		if (showModal) {
			setIsVisible(true);
			setIsClosing(false);
		} else if (isVisible) {
			setIsClosing(true);
			// Hide modal after animation completes
			const timer = setTimeout(() => {
				setIsVisible(false);
				setIsClosing(false);
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [showModal, isVisible]);

	if (!isVisible) return null;

	const filteredTimezones = searchTimezones(timezoneSearch);

	const handleClose = () => {
		setIsClosing(true);
		// Call onClose after a brief delay to allow animation to start
		setTimeout(() => {
			onClose();
		}, 50);
	};

	const handleBackdropClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			handleClose();
		}
	};

	const isDesktop = window.innerWidth >= 768;

	return (
		<div
			className={`fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end justify-center z-50 md:items-center ${
				isClosing ? "modal-backdrop-exit" : "modal-backdrop-enter"
			}`}
			onClick={handleBackdropClick}
		>
			<div
				className={`bg-white/95 backdrop-blur w-full max-w-md rounded-t-3xl md:rounded-3xl max-h-[80vh] overflow-y-auto border border-gray-100/50 ios-card native-scroll ${
					isClosing
						? isDesktop
							? "modal-content-exit-desktop"
							: "modal-content-exit"
						: isDesktop
						? "modal-content-enter-desktop"
						: "modal-content-enter"
				}`}
				onClick={(e) => e.stopPropagation()}
			>
				<div className='flex justify-between items-center p-6 pb-4 border-b border-gray-100'>
					<h3 className='m-0 text-lg font-medium'>
						{editingFriend ? "Edit Entry" : "Add New"}
					</h3>
					<button
						className='bg-gray-100/80 border-none text-gray-600 cursor-pointer p-2 flex items-center justify-center rounded-full w-8 h-8 native-button'
						onClick={handleClose}
					>
						<X size={16} />
					</button>
				</div>
				<div className='p-6'>
					<div className='mb-6'>
						<label
							className='block mb-2 font-medium text-black'
							htmlFor='friendName'
						>
							Name
						</label>
						<input
							type='text'
							id='friendName'
							value={friendName}
							onChange={(e) => setFriendName(e.target.value)}
							placeholder="Enter place / person's name"
							className='w-full p-4 bg-gray-50/80 border border-gray-200/50 rounded-2xl text-base focus:outline-none focus:border-sky-600 focus:bg-white backdrop-blur'
						/>
					</div>
					<div className='mb-6'>
						<label
							className='block mb-2 font-medium text-black'
							htmlFor='friendTimezone'
						>
							Timezone
						</label>
						<div className='relative'>
							<input
								type='text'
								id='friendTimezone'
								value={timezoneSearch}
								onChange={(e) => {
									setTimezoneSearch(e.target.value);
									setShowTimezoneDropdown(true);
									setSelectedTimezone(null);
								}}
								onFocus={() => setShowTimezoneDropdown(true)}
								placeholder='Search for timezone or city'
								className='w-full p-4 bg-gray-50/80 border border-gray-200/50 rounded-2xl text-base focus:outline-none focus:border-sky-600 focus:bg-white backdrop-blur'
							/>
							{showTimezoneDropdown && (
								<div className='absolute top-full left-0 right-0 bg-white/95 backdrop-blur border border-gray-200/50 rounded-2xl mt-2 max-h-48 overflow-y-auto z-50 native-scroll shadow-lg'>
									{filteredTimezones.slice(0, 10).map((tz, index) => (
										<div
											key={`${tz.id}-${index}`}
											className='p-4 cursor-pointer border-b border-gray-100/50 hover:bg-gray-50/80 last:border-b-0 first:rounded-t-2xl last:rounded-b-2xl native-button'
											onClick={() => {
												setSelectedTimezone(tz);
												setTimezoneSearch(tz.displayName);
												setShowTimezoneDropdown(false);
											}}
										>
											<div className='font-medium'>
												{tz.displayName}
											</div>
											{tz.searchTerms.length > 0 && (
												<div className='text-xs text-gray-500 mt-1'>
													{tz.searchTerms.slice(0, 3).join(", ")}
												</div>
											)}
										</div>
									))}
								</div>
							)}
						</div>
					</div>
					<div className='mb-6'>
						<label
							className='block mb-2 font-medium text-black'
							htmlFor='customLocation'
						>
							Custom Display Location (Optional)
						</label>
						<input
							type='text'
							id='customLocation'
							value={customLocation}
							onChange={(e) => setCustomLocation(e.target.value)}
							placeholder="e.g., John's City, My Home"
							className='w-full p-4 bg-gray-50/80 border border-gray-200/50 rounded-2xl text-base focus:outline-none focus:border-sky-600 focus:bg-white backdrop-blur'
						/>
						<div className='text-xs text-gray-500 mt-1'>
							Leave blank to use "
							{selectedTimezone?.displayName || "default location"}"
						</div>
					</div>
				</div>
				<div className='flex gap-3 p-6 pt-4'>
					<button
						className='flex-1 p-4 rounded-2xl text-base cursor-pointer bg-gray-100/80 border-none text-gray-600 backdrop-blur native-button'
						onClick={handleClose}
					>
						Cancel
					</button>
					<button
						className='flex-1 p-4 rounded-2xl text-base cursor-pointer bg-sky-500 border-none text-white native-button shadow-lg shadow-sky-300/25'
						onClick={onSave}
					>
						Save
					</button>
				</div>
			</div>
		</div>
	);
}
