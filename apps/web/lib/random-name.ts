export const ADJECTIVES = [
  "Quiet", "Brave", "Swift", "Curious", "Bold", "Cosmic", "Daring", "Gentle",
  "Witty", "Vibrant", "Mellow", "Eager", "Plucky", "Lively", "Stoic", "Sunny",
  "Lucid", "Nimble", "Jolly", "Steady", "Sleek", "Crafty", "Drowsy", "Earnest",
  "Fierce", "Glowing", "Hidden", "Iron", "Keen", "Loyal", "Mighty", "Noble",
  "Polite", "Rapid", "Silent", "Tame", "Velvet", "Wild", "Zesty", "Amber",
];

export const ANIMALS = [
  "Tiger", "Otter", "Falcon", "Dolphin", "Fox", "Eagle", "Lynx", "Panda",
  "Heron", "Wolf", "Owl", "Hare", "Raven", "Stag", "Whale", "Bison", "Koi",
  "Moth", "Crane", "Mantis", "Quokka", "Seal", "Toad", "Yak", "Hawk", "Newt",
  "Beetle", "Cobra", "Lemur", "Marten", "Badger", "Gecko", "Heron", "Ibis",
  "Jaguar", "Kestrel", "Lark", "Magpie", "Orca", "Puma",
];

export const COLORS = ["#60a5fa", "#f472b6", "#34d399", "#fb923c", "#a78bfa"];

const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const generateGuestName = (): string => `${pick(ADJECTIVES)} ${pick(ANIMALS)}`;

export const pickColor = (): string => pick(COLORS);

export const getInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase() || "?";
