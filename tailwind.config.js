/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./*.html", "./*/**/*.js"],
    darkMode: "class",
    theme: {
        extend: {},
    },
    plugins: [require("daisyui")],
    daisyui: {
        themes: [
            "fantasy",
            "sunset",
        ],
    },
};