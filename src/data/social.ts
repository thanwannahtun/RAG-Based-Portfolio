import { SocialLink } from "@/types";

export const SOCIAL_LINKS: SocialLink[] = [
    {
        name: "GitHub",
        url: process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/thanwannahtun",
        icon: "github",
        username: "@thanwannahtun",
    },
    {
        name: "LinkedIn",
        url: process.env.NEXT_PUBLIC_LINKEDIN_URL || "https://www.linkedin.com/in/than-wanna-45263729b/",
        icon: "linkedin",
        username: "https://www.linkedin.com/in/than-wanna-45263729b/",
    },
    {
        name: "Facebook",
        url: process.env.NEXT_PUBLIC_FACEBOOK_URL || "https://facebook.com/yourusername",
        icon: "facebook",
        username: "thanwanna",
    },
    {
        name: "Portfolio",
        url: process.env.NEXT_PUBLIC_PORTFOLIO_URL || "https://thanwannahtun.github.io",
        icon: "globe",
        username: "https://thanwannahtun.github.io",
    },
];

export const OWNER_NAME = process.env.NEXT_PUBLIC_OWNER_NAME || "Thanwanna Htun";
export const OWNER_TITLE = "Senior Fullstack Developer";
export const OWNER_TAGLINE = "Building AI-native web experiences & developer tools";