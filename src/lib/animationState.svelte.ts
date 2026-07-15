let hasSettled = $state(false);

export const animationState = {
	get hasSettled(): boolean {
		return hasSettled;
	},

	set hasSettled(value: boolean) {
		hasSettled = value;
	}
};
