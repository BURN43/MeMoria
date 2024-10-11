// src/components/Input.jsx
import React from 'react';

const Input = ({ icon: Icon, ...props }) => {
	return (
		<div className="relative mb-6">
			<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
				{/* Ensure your Icon has appropriate size utility class */}
				<Icon className="h-5 w-5 text-purple-500" />
			</div>
			<input
				{...props}
				className="w-full pl-10 pr-3 py-2 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400 transition duration-200"
				aria-label={props['aria-label'] || 'input field'} // Example for accessibility
			/>
		</div>
	);
};

export default Input;