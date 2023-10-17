const config = {
	mode: 'jit',
	content: ['./src/**/*.{html,js,svelte,ts}'],

	darkMode: 'class',
	theme: {
		extend: {
			backgroundColor: {
				body: '#1A202C' // dark gray color
			}
		}
	}
};

module.exports = config;
