import type {ThemeName} from "./types.js";

export type Theme = {
  name: ThemeName;
  foreground: string;
  muted: string;
  accent: string;
  border: string;
  danger: string;
};

export const themes: Record<ThemeName, Theme> = {
  amber: {
    name: "amber",
    foreground: "#ffbf5f",
    muted: "#a8732a",
    accent: "#ffd28a",
    border: "#c68433",
    danger: "#ff6b4a"
  },
  green: {
    name: "green",
    foreground: "#8cff9a",
    muted: "#4f9f5d",
    accent: "#c8ffd1",
    border: "#66c46f",
    danger: "#ff7b7b"
  },
  paper: {
    name: "paper",
    foreground: "#f0e7c8",
    muted: "#a69b78",
    accent: "#fff5cf",
    border: "#d9c98f",
    danger: "#ff9b73"
  }
};
