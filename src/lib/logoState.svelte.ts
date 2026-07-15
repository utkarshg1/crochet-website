let hasSettled = $state(false);

export const logoState = {
	get hasSettled(): boolean {
		return hasSettled;
	},

	set hasSettled(value: boolean) {
		hasSettled = value;
	}
};
