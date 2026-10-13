/**
 * Tailwind config for the light legal/info pages.
 * Output: assets/tw-legal.css  (regenerate with `npm run build:css`)
 *
 * Reproduces the inline `tailwind.config` block that each of these pages
 * previously loaded via cdn.tailwindcss.com?plugins=forms,container-queries.
 */
module.exports = {
  content: [
    './contact/index.html',
    './privacy/index.html',
    './terms/index.html',
    './refund/index.html',
    './delivery/index.html',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        accent: '#ff6a00',
        'bg-light': '#f8fafc',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        headline: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
};
