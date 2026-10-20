const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    // Tailwind puts every style inside @layer blocks, which browsers older than
    // Chrome 99 / Safari 15.4 skip entirely (an unstyled site). This flattens
    // the layers while keeping the same cascade order.
    "@csstools/postcss-cascade-layers": {},
  },
};

export default config;
