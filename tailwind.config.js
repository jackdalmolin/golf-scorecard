/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,jsx}"], // Make sure this matches your project
    theme: {
      extend: {
        colors: {
          mastersGreen: "#005A2B",
          mastersYellow: "#FFD700",
        },
        fontFamily: {
          masters: ['"Merriweather"', "serif"], // Note the double quotes here!
        },
      },
    },
    plugins: [],
  };
  