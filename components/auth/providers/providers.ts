import type { Provider, ProviderConfig } from "./types";

export const PROVIDERS: Partial<
  Record<Provider, ProviderConfig>
> = {
  google: {
    label: "Google",
  },

  github: {
    label: "GitHub",
  },

  discord: {
    label: "Discord",
  },

  apple: {
    label: "Apple",
  },

  microsoft: {
    label: "Microsoft",
  },

  facebook: {
    label: "Facebook",
  },

  spotify: {
    label: "Spotify",
  },

  twitch: {
    label: "Twitch",
  },

  twitter: {
    label: "X",
  },

  linkedin: {
    label: "LinkedIn",
  },

  gitlab: {
    label: "GitLab",
  },

  reddit: {
    label: "Reddit",
  },

  slack: {
    label: "Slack",
  },

  dropbox: {
    label: "Dropbox",
  },

  figma: {
    label: "Figma",
  },

  notion: {
    label: "Notion",
  },

  zoom: {
    label: "Zoom",
  },

  atlassian: {
    label: "Atlassian",
  },

  vercel: {
    label: "Vercel",
  },

  railway: {
    label: "Railway",
  },

  paypal: {
    label: "PayPal",
  },

  line: {
    label: "LINE",
  },

  kakao: {
    label: "Kakao",
  },

  naver: {
    label: "Naver",
  },

  wechat: {
    label: "WeChat",
  },

  vk: {
    label: "VK",
  },

  tiktok: {
    label: "TikTok",
  },

  roblox: {
    label: "Roblox",
  },

  linear: {
    label: "Linear",
  },

  huggingface: {
    label: "Hugging Face",
  },

  salesforce: {
    label: "Salesforce",
  },

  kick: {
    label: "Kick",
  },

  cognito: {
    label: "Amazon Cognito",
  },

  polar: {
    label: "Polar",
  },

  paybin: {
    label: "Paybin",
  },
};