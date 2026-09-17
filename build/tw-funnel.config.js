/**
 * Tailwind config for the dark-neon funnel pages.
 * Output: assets/tw-funnel.css  (regenerate with `npm run build:css`)
 *
 * Merges the previously per-page inline `tailwind.config` blocks from:
 *   webinar/index.html, webinar/payment/index.html, course/index.html,
 *   course/day-1..7.html, thankyou/index.html
 * (`surface*` tokens were never used as classes; kept for parity anyway.)
 */
module.exports = {
  darkMode: 'class',
  content: [
    './webinar/index.html',
    './webinar/payment/index.html',
    './course/index.html',
    './course/day-1.html',
    './course/day-2.html',
    './course/day-3.html',
    './course/day-4.html',
    './course/day-5.html',
    './course/day-6.html',
    './course/day-7.html',
    './thankyou/index.html',
  ],
  // Classes assembled at runtime as string fragments (price-drop swap in
  // webinar/index.html, reveal toggle). The inline scripts live in the HTML
  // above so most are already picked up; this is belt-and-braces.
  safelist: [
    'reveal-shown',
    'line-through',
    'font-normal',
    { pattern: /^(text|bg|border|ring)-(neon|urgency|white|black)$/ },
    { pattern: /^text-(neutral|zinc)-(400|500)$/ },
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        surface: '#0a0a0a',
        'surface-card': '#0d0d0d',
        'surface-card-hover': '#141414',
        neon: '#a3fd00',
        'neon-glow': 'rgba(163, 253, 0, 0.4)',
        urgency: '#ff2a40',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        headline: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
};
