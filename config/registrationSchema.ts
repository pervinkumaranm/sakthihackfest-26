import { z } from 'zod';

export const ACADEMIC_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'] as const;

const whatsappSchema = z.string().regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian WhatsApp number');
const emailSchema = z.string().email('Valid email address required');
const departmentSchema = z
  .string()
  .trim()
  .min(1, 'Please enter your department / branch.')
  .max(100, 'Department name cannot exceed 100 characters');
const yearSchema = z.string().min(1, 'Year of study is required');

// Member schema (no college)
export const memberInfoSchema = z.object({
  name: z.string().trim().min(2, 'Full name must be at least 2 characters').max(60),
  department: departmentSchema,
  yearOfStudy: yearSchema,
  whatsapp: whatsappSchema,
  email: emailSchema,
});

// Full registration form schema — 3 Steps
export const registrationFormSchema = z.object({
  // ── STEP 1: Team & Leader ──────────────────────────────
  teamName: z
    .string()
    .trim()
    .min(2, 'Team name must be at least 2 characters')
    .max(40, 'Team name cannot exceed 40 characters'),

  teamSize: z.number().min(2).max(4),

  // Leader details
  leaderName: z.string().trim().min(2, 'Leader full name is required').max(60),
  leaderDepartment: departmentSchema,
  leaderYear: yearSchema,
  leaderWhatsapp: whatsappSchema,
  leaderEmail: emailSchema,

  // ── STEP 2: Team Members ───────────────────────────────
  members: z.array(memberInfoSchema),

  // ── STEP 3: Payment & Verification ─────────────────────
  paymentScreenshotData: z.string().min(1, 'Please upload your payment screenshot'),
  paymentScreenshotName: z.string().optional(),
  upiTransactionId: z.string().trim().min(4, 'Please enter a valid UPI transaction / UTR reference number'),
  confirmedCorrect: z.boolean().refine(val => val === true, {
    message: 'You must confirm that all information provided is accurate',
  }),
});

export type RegistrationFormValues = z.infer<typeof registrationFormSchema>;
export type MemberFormValues = z.infer<typeof memberInfoSchema>;
