/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'epoca-crema': '#FDF8F4',
        'epoca-rosa': '#E8A0BF',
        'epoca-rosa-claro': '#F2C6C2',
        'epoca-verde': '#A8C5A8',
        'epoca-verde-claro': '#C5D5CB',
        'epoca-violeta': '#B8A0C8',
        'epoca-violeta-claro': '#D4B5D6',
        'epoca-marron': '#3D2C2E',
        'epoca-marron-medio': '#6B5658',
      },
      fontFamily: {
        'playfair': ['"Playfair Display"', 'Georgia', 'serif'],
        'lora': ['Lora', 'Georgia', 'serif'],
        'inter': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
