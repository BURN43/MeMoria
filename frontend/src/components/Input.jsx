// src/components/Input.jsx
import React from 'react';

const Input = ({ icon: Icon, ...props }) => {
	return (
		<div className="relative mb-6">
			<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
				<Icon className="h-5 w-5 text-input-icon" />
			</div>
			<input
				{...props}
				className="w-full pl-10 pr-3 py-2 bg-card text-light placeholder-secondary border border-secondary rounded-lg focus:border-primary focus:ring-2 focus:ring-primary transition duration-200"
				aria-label={props['aria-label'] || 'input field'}
			/>
		</div>
	);
};

export default Input;