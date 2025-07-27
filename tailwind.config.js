/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        accent: '#10B981',
        danger: '#DC2626',
        success: '#16A34A',
        gray: '#6B7280',
      },
      fontFamily: {
        hindi: ['Noto Sans Devanagari', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}