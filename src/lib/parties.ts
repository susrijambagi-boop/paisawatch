// Party-associated colours used as a visual "flag" cue. These are colours, not
// the parties' trademarked election symbols/logos (which aren't freely
// licensed), so we render a coloured chip rather than an official emblem.

interface PartyStyle {
  color: string;
  fg: string;
}

const RULES: Array<[test: RegExp, style: PartyStyle]> = [
  [/\bBJP\b|Bharatiya Janata/i, { color: "#FF9933", fg: "#3a2400" }],
  [/\bINC\b|Indian National Congress/i, { color: "#1AA1E2", fg: "#06304a" }],
  [/\bAAP\b|Aam Aadmi/i, { color: "#1F4E9B", fg: "#ffffff" }],
  [/\bAITC\b|\bTMC\b|Trinamool/i, { color: "#20603D", fg: "#ffffff" }],
  [/\bDMK\b/i, { color: "#E30000", fg: "#ffffff" }],
  [/\bSP\b|Samajwadi/i, { color: "#ED1C24", fg: "#ffffff" }],
  [/\bRJD\b|Rashtriya Janata/i, { color: "#0B6E2E", fg: "#ffffff" }],
  [/ShivSena|Shiv Sena/i, { color: "#F37020", fg: "#3a2400" }],
  [/\bTDP\b|Telugu Desam/i, { color: "#FFD200", fg: "#3a2f00" }],
  [/\bYSRCP\b|YSR Congress/i, { color: "#1565C0", fg: "#ffffff" }],
  [/\bJD\(U\)|Janata Dal \(United\)/i, { color: "#0F8A3C", fg: "#ffffff" }],
  [/\bBJD\b|Biju Janata/i, { color: "#1B7A43", fg: "#ffffff" }],
  [/\bNCP\b|Nationalist Congress/i, { color: "#00A0E3", fg: "#06304a" }],
  [/\bCPI|Communist Party/i, { color: "#C8102E", fg: "#ffffff" }],
  [/\bIND\b|Independent/i, { color: "#94A3B8", fg: "#1e293b" }],
];

const DEFAULT: PartyStyle = { color: "#64748B", fg: "#ffffff" };

export function partyStyle(party: string): PartyStyle {
  return RULES.find(([re]) => re.test(party))?.[1] ?? DEFAULT;
}
