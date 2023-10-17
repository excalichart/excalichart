import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals: { getSession } }) => {
	const session = await getSession();

	if (session) {
		throw redirect(303, '/dashboard');
	}

	return { url: url.origin };
};
