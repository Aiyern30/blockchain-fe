import { Metadata } from "next";

const iconUrl = "/Logo.png";

export const generatePageMetadata = (
  title: string,
  description: string
): Metadata => {
  return {
    title: `LiveSportsNow | ${title}`,
    description: description,
    icons: {
      icon: [{ url: iconUrl, type: "image/png" }],
    },
  };
};