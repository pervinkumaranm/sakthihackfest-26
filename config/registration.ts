/**
 * SAKTHI HACKFEST'26 - Central Registration Configuration
 * 
 * IMPORTANT:
 * This file centralizes the schema, validation rules, field limits, and Google Form mappings.
 * As the organizer supplies the exact Google Form fields, update the fields below.
 * Marked with: // TODO: OFFICIAL EVENT DATA
 */

import { z } from 'zod';

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormFieldDef {
  name: string;
  label: string;
  placeholder?: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'textarea' | 'url';
  required: boolean;
  options?: FormFieldOption[];
  helpText?: string;
}

export interface StepConfig {
  stepNumber: number;
  title: string;
  subtitle: string;
  description: string;
}

export const REGISTRATION_CONFIG = {
  limits: {
    minMembers: 2,
    maxMembers: 4, // 1 Leader + 1 to 3 additional members
    minAdditionalMembers: 1,
    maxAdditionalMembers: 3,
  },

  steps: [
    {
      stepNumber: 1,
      title: "TEAM INFORMATION",
      subtitle: "Identity & College",
      description: "Define your squad name, institution, and chosen problem domain."
    },
    {
      stepNumber: 2,
      title: "TEAM LEADER",
      subtitle: "Primary Contact",
      description: "Designate the primary point of contact for all hackathon communications."
    },
    {
      stepNumber: 3,
      title: "TEAM MEMBERS",
      subtitle: "Squad Roster",
      description: "Register your co-engineers and teammates (1 to 3 additional members)."
    },
    {
      stepNumber: 4,
      title: "ADDITIONAL INFORMATION",
      subtitle: "Track & Submission",
      description: "Confirm innovation track, abstract summary, and declaration."
    }
  ] as StepConfig[],

  // Innovation tracks matching technical fest standards
  // TODO: OFFICIAL EVENT DATA - Match tracks with organizer criteria
  tracks: [
    { label: "AI & Autonomous Systems (GenAI, ML, Computer Vision)", value: "ai-systems" },
    { label: "Web3, Blockchain & Decentralized Trust", value: "web3-crypto" },
    { label: "IoT, Embedded Systems & Smart Robotics", value: "iot-robotics" },
    { label: "FinTech, Cyber Defense & Zero-Trust Security", value: "fintech-security" },
    { label: "CleanTech, Smart Agriculture & Healthcare Engineering", value: "cleantech-health" },
    { label: "Open Innovation / Breakthrough Engineering", value: "open-innovation" },
  ],

  academicYears: [
    { label: "1st Year (Fresher)", value: "1st Year" },
    { label: "2nd Year (Sophomore)", value: "2nd Year" },
    { label: "3rd Year (Junior)", value: "3rd Year" },
    { label: "4th Year (Senior)", value: "4th Year" },
    { label: "Postgraduate (M.E./M.Tech/MCA/M.Sc)", value: "Postgraduate" },
  ],

  foodPreferences: [
    { label: "Vegetarian", value: "veg" },
    { label: "Non-Vegetarian", value: "non-veg" },
  ],

  tshirtSizes: [
    { label: "S (38)", value: "S" },
    { label: "M (40)", value: "M" },
    { label: "L (42)", value: "L" },
    { label: "XL (44)", value: "XL" },
    { label: "XXL (46)", value: "XXL" },
  ]
};

// ============================================================
// ZOD VALIDATION SCHEMAS
// ============================================================

export const memberSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters").max(60),
  email: z.string().email("Valid institutional or personal email required"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit Indian phone number"),
  college: z.string().min(3, "College name must be at least 3 characters").max(100),
  department: z.string().min(2, "Department name is required"),
  yearOfStudy: z.string().min(1, "Please select year of study"),
  githubUrl: z.string().url("Valid URL required (e.g. https://github.com/...)").or(z.literal("")),
  linkedinUrl: z.string().url("Valid URL required (e.g. https://linkedin.com/in/...)").or(z.literal("")),
  tshirtSize: z.string().optional(),
});

export const registrationSchema = z.object({
  // STEP 1: Team Info
  teamName: z.string()
    .min(3, "Team name must be at least 3 characters")
    .max(40, "Team name cannot exceed 40 characters")
    .regex(/^[a-zA-Z0-9 _-]+$/, "Only letters, numbers, spaces, underscores, and hyphens allowed"),
  college: z.string()
    .min(3, "College name must be at least 3 characters")
    .max(120, "College name cannot exceed 120 characters"),
  cityState: z.string()
    .min(3, "City & State required (e.g. Coimbatore, Tamil Nadu)")
    .max(80),

  // STEP 2: Leader Info
  leaderName: z.string()
    .min(2, "Leader name must be at least 2 characters")
    .max(60),
  leaderEmail: z.string()
    .email("Valid institutional or personal email required"),
  leaderPhone: z.string()
    .regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit Indian mobile number"),
  leaderDepartment: z.string()
    .min(2, "Department/Branch is required (e.g. CSE, IT, ECE)"),
  leaderYear: z.string()
    .min(1, "Please select your academic year"),
  leaderGithub: z.string()
    .url("Valid URL required (e.g. https://github.com/username)")
    .or(z.literal("")),
  leaderLinkedin: z.string()
    .url("Valid URL required (e.g. https://linkedin.com/in/username)")
    .or(z.literal("")),
  leaderTshirtSize: z.string(),

  // STEP 3: Members (1 to 3 additional members)
  members: z.array(memberSchema)
    .min(REGISTRATION_CONFIG.limits.minAdditionalMembers, `At least ${REGISTRATION_CONFIG.limits.minAdditionalMembers} teammate required (Min team size 2)`)
    .max(REGISTRATION_CONFIG.limits.maxAdditionalMembers, `Maximum ${REGISTRATION_CONFIG.limits.maxAdditionalMembers} teammates allowed (Max team size 4)`),

  // STEP 4: Additional Information
  track: z.string().min(1, "Please select an innovation track"),
  projectTitle: z.string()
    .min(4, "Project or concept title must be at least 4 characters")
    .max(100),
  projectAbstract: z.string()
    .min(20, "Brief idea/abstract must be at least 20 characters")
    .max(1000, "Brief idea cannot exceed 1000 characters"),
  repoOrDriveUrl: z.string()
    .url("Provide a valid link (Google Drive, GitHub, or Notion)")
    .or(z.literal("")),
  dietaryPreference: z.string(),
  accommodationsNeeded: z.boolean(),
  agreedToRules: z.boolean().refine(val => val === true, {
    message: "You must agree to the Hackfest Rules and Code of Conduct"
  }),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;
export type MemberFormData = z.infer<typeof memberSchema>;
