/**
 * SAKTHI HACKFEST'26 - Official Hackathon Themes
 * 
 * IMPORTANT:
 * Official theme problem statements will be populated once finalized by the committee.
 * Keep these values clean and editable.
 */

export interface HackathonTheme {
  id: string;
  themeNumber: string;
  name: string;
  shortDescription: string;
  iconTag: string;
}

export const hackathonThemes: HackathonTheme[] = [
  {
    id: "theme-01",
    themeNumber: "01",
    name: "Generative AI",
    shortDescription: "Official theme problem statement will be announced. Submit your innovative concept.",
    iconTag: "TRACK 01"
  },
  {
    id: "theme-02",
    themeNumber: "02",
    name: "Cryptography and Cyber Security",
    shortDescription: "Official theme problem statement will be announced. Submit your innovative concept.",
    iconTag: "TRACK 02"
  },
  {
    id: "theme-03",
    themeNumber: "03",
    name: "Sustainable Development Goals",
    shortDescription: "Official theme problem statement will be announced. Submit your innovative concept.",
    iconTag: "TRACK 03"
  },
  {
    id: "theme-04",
    themeNumber: "04",
    name: "Digital Prototyping & Design",
    shortDescription: "Official theme problem statement will be announced. Submit your innovative concept.",
    iconTag: "TRACK 04"
  },
  {
    id: "theme-05",
    themeNumber: "05",
    name: "Web3 & FinTech",
    shortDescription: "Official theme problem statement will be announced. Submit your innovative concept.",
    iconTag: "TRACK 05"
  }
];
