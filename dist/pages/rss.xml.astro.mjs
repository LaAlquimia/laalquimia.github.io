export { renderers } from '../renderers.mjs';

const page = () => import('../chunks/prerender_BKAE5_7B.mjs').then(n => n.r);

export { page };
