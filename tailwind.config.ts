/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./node_modules/flowbite-react/**/*.js",
    "./node_modules/tailwind-datepicker-react/dist/**/*.js",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],

  safelist: [
    'w-64',
    'w-1/2',
    'rounded-l-lg',
    'rounded-r-lg',
    'bg-gray-200',
    'grid-cols-4',
    'grid-cols-7',
    'h-6',
    'leading-6',
    'h-9',
    'leading-9',
    'shadow-lg'
  ],

  theme: {
    fontFamily: {
      'body': [
        'Inter',
        'ui-sans-serif',
        'system-ui',
      ],
      'sans': [
        'Inter',
        'ui-sans-serif',
        'system-ui',
      ]
    },
  },
  plugins: [require("flowbite/plugin"), require("tailwindcss-animate"), require('@tailwindcss/typography')],
}