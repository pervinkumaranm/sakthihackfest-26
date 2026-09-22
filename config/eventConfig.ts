/**
 * SAKTHI HACKFEST 2K26 - Central Event Configuration
 * 
 * Official Hackathon Dates: OCTOBER 10–11, 2026
 * Sree Sakthi Engineering College (Autonomous), Karamadai, Coimbatore
 */

export interface EventConfigType {
  eventName: string;
  edition: string;
  tagline: string;
  eventDate: string;
  startDate: string;
  endDate: string;
  eventStartDateTime: string;
  eventEndDateTime: string;
  registrationDeadline: string;
  registrationFee: number;
  currency: string;
  feeDisplay: string;
  college: {
    name: string;
    shortName: string;
    autonomous: boolean;
    campus: string;
    address: string;
    city: string;
    pincode: string;
    bannerImage: string;
    mapUrl: string;
  };
  teamSizeOptions: {
    label: string;
    value: number;
  }[];
  departments: string[];
  academicYears: string[];
  publicPaymentQrUrl: string;
  upiId: string;
  upiPayeeName: string;
  contact: {
    email: string;
    phone: string;
    studentCoordinators: { name: string; role: string; phone: string }[];
    facultyCoordinators: { name: string; department: string; phone: string }[];
  };
  socialLinks: {
    instagram: string;
    linkedin: string;
    website: string;
    github?: string;
  };
}

export const EVENT_CONFIG: EventConfigType = {
  eventName: "SAKTHI HACKFEST'26",
  edition: "'26",
  tagline: 'BUILD. BREAK. INNOVATE.',
  eventDate: 'October 10–11, 2026',
  startDate: '2026-10-10',
  endDate: '2026-10-11',
  eventStartDateTime: '2026-10-10T00:00:00+05:30',
  eventEndDateTime: '2026-10-11T23:59:59+05:30',
  // Registration deadline is separate from event date
  // TODO: Update when official registration closing deadline is announced
  registrationDeadline: 'October 05, 2026',
  registrationFee: 1000,
  currency: 'INR',
  feeDisplay: '₹1,000',
  college: {
    name: 'Sree Sakthi Engineering College',
    shortName: 'SSEC',
    autonomous: true,
    campus: 'Technical Campus - Karamadai',
    address: 'Ooty Main Road, Karamadai, Coimbatore, Tamil Nadu - 641104',
    city: 'Coimbatore, Tamil Nadu',
    pincode: '641104',
    bannerImage: '/college-banner.jpg',
    mapUrl: 'https://maps.google.com/?q=Sree+Sakthi+Engineering+College+Karamadai+Coimbatore',
  },
  teamSizeOptions: [
    { label: '2 Members', value: 2 },
    { label: '3 Members', value: 3 },
    { label: '4 Members', value: 4 },
  ],
  departments: [
    'Computer Science & Engineering (CSE)',
    'Information Technology (IT)',
    'Artificial Intelligence & Data Science (AI & DS)',
    'Electronics & Communication Engineering (ECE)',
    'Electrical & Electronics Engineering (EEE)',
    'Mechanical Engineering',
    'Civil Engineering',
    'Robotics & Automation',
    'Biotechnology / Biomedical',
    'Other Engineering Department',
  ],
  academicYears: [
    '1st Year',
    '2nd Year',
    '3rd Year',
    '4th Year',
  ],
  // Organizers can set the actual hosted payment QR URL or use local fallback
  publicPaymentQrUrl: '/payment-qr.png',
  upiId: 'Ms Sree Sakthi Engineering College Hackfest', // TODO: Official event UPI ID
  upiPayeeName: 'Ms Sree Sakthi Engineering College Hackfest',
  contact: {
    email: 'sakthihackfest@gmail.com',
    phone: '+91 98422 12345',
    studentCoordinators: [
      { name: 'Jeevanandh.', role: 'Lead Student Coordinator', phone: '+91 63812 06466' },
      { name: 'Harini.', role: 'Technical Coordinator', phone: '+91 74181 12402' },
    ],
    facultyCoordinators: [
      { name: 'Dr. M. Senthil Kumar', department: 'Professor & Head, CSE', phone: '+91 94433 22110' },
      { name: 'Prof. R. Kavitha', department: 'Associate Professor, CSE', phone: '+91 98420 33221' },
    ],
  },
  socialLinks: {
    instagram: 'https://www.instagram.com/ssec_karamadai_official/?utm_source=ig_web_button_share_sheet',
    linkedin: 'https://linkedin.com/school/sree-sakthi-engineering-college',
    website: 'https://sreesakthi.edu.in/',
    github: 'https://github.com/sakthi-hackfest',
  },
};

export const eventConfig = EVENT_CONFIG;

