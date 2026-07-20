"use client";

import { Icon } from "@iconify/react";
import type { Provider } from "./types";

const ICONS: Partial<Record<Provider, string>> = {
  google: "logos:google-icon",
  github: "logos:github-icon",
  discord: "logos:discord-icon",
  apple: "logos:apple",
  microsoft: "logos:microsoft-icon",

  facebook: "logos:facebook",
  spotify: "logos:spotify-icon",
  twitch: "logos:twitch",
  twitter: "logos:twitter",
  linkedin: "logos:linkedin-icon",

  gitlab: "logos:gitlab",
  reddit: "logos:reddit-icon",
  slack: "logos:slack-icon",

  dropbox: "logos:dropbox",
  figma: "logos:figma",
  notion: "logos:notion-icon",
  zoom: "logos:zoom-icon",

  atlassian: "logos:atlassian",
  vercel: "logos:vercel-icon",
  railway: "logos:railway-icon",

  paypal: "logos:paypal",
  line: "logos:line",
  kakao: "logos:kakao",
  naver: "logos:naver",
  wechat: "logos:wechat",

  vk: "logos:vk",
  tiktok: "logos:tiktok-icon",
  roblox: "logos:roblox",

  linear: "logos:linear",
  huggingface: "logos:hugging-face-icon",
  salesforce: "logos:salesforce",

  kick: "logos:kick",
};

interface BrandIconProps {
  provider: Provider;
  className?: string;
}

export function BrandIcon({
  provider,
  className,
}: BrandIconProps) {
  return (
    <Icon
      icon={
        ICONS[provider] ??
        "lucide:circle-help"
      }
      className={className}
    />
  );
}