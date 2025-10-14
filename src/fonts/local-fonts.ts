import localFont from "next/font/local";

// Example for adding local fonts
export const customFont = localFont({
  src: [
    {
      path: "./custom-font-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./custom-font-bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-custom",
  display: "swap",
});

// Example for local Persian font
export const persianFont = localFont({
  src: [
    {
      path: "./persian-font-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./persian-font-bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-persian",
  display: "swap",
});
