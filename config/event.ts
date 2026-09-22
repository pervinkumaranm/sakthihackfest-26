/**
 * SAKTHI HACKFEST 2K26 - Central Event Configuration
 * 
 * IMPORTANT:
 * All official event data supplied by the organizer is configured here.
 * Sections requiring final organizer confirmation are explicitly marked with:
 * // TODO: OFFICIAL EVENT DATA
 */

export interface PrizeItem {
  rank: string;
  title: string;
  amount: string; // TODO: OFFICIAL EVENT DATA
  perks: string[];
  highlight?: boolean;
}

export interface TimelineStage {
  id: string;
  stage: string;
  date: string; // TODO: OFFICIAL EVENT DATA
  time: string;
  description: string;
  status: 'completed' | 'active' | 'upcoming';
}

export interface EventRule {
  id: string;
  question: string;
  answer: string;
  category: 'Eligibility' | 'Teams' | 'Tech' | 'Guidelines' | 'Evaluation';
}

export interface EventConfig {
  eventName: string;
  shortName: string;
  edition: string;
  tagline: string;
  subTagline: string;
  college: {
    name: string;
    fullName: string;
    campus: string;
    location: string;
    address: string;
    mapUrl: string;
  };
  dates: {
    displayDate: string; // TODO: OFFICIAL EVENT DATA
    registrationOpen: string;
    registrationDeadline: string; // TODO: OFFICIAL EVENT DATA
    hackathonStart: string;
    hackathonEnd: string;
  };
  venue: {
    displayVenue: string; // TODO: OFFICIAL EVENT DATA
    hall: string;
    city: string;
  };
  teamSize: {
    min: number;
    max: number;
    recommended: number;
    note: string;
  };
  prizePool: {
    totalDisplay: string; // TODO: OFFICIAL EVENT DATA
    prizes: PrizeItem[];
  };
  stats: {
    label: string;
    sublabel?: string;
    value: string;
    suffix?: string;
  }[];
  challenges: {
    id: string;
    number: string;
    label: string;
    title: string;
    description: string;
    secondaryDescription?: string;
    bullets: string[];
    highlight: string;
  }[];
  pillars: {
    title: string;
    subtitle: string;
    description: string;
    icon: string;
  }[];
  timeline: TimelineStage[];
  rules: EventRule[];
  contact: {
    email: string; // TODO: OFFICIAL EVENT DATA
    phone: string; // TODO: OFFICIAL EVENT DATA
    studentCoordinators: {
      name: string; // TODO: OFFICIAL EVENT DATA
      role: string;
      phone: string;
    }[];
    facultyCoordinators: {
      name: string; // TODO: OFFICIAL EVENT DATA
      department: string;
      phone: string;
    }[];
  };
  socialLinks: {
    instagram: string;
    linkedin: string;
    website: string;
    github?: string;
  };
}

export const EVENT_CONFIG: EventConfig = {
  eventName: "SAKTHI HACKFEST'26",
  shortName: "SHF'26",
  edition: "2026",
  tagline: "BUILD. BREAK. INNOVATE.",
  subTagline: "The premier national-level hackathon empowering bold engineering minds to architect the next technological era.",

  college: {
    name: "Sree Sakthi Engineering College",
    fullName: "Sree Sakthi Engineering College, Karamadai",
    campus: "Karamadai Campus",
    location: "Coimbatore, Tamil Nadu, India",
    address: "Bettathapuram, Bilichi Post, Karamadai, Coimbatore, Tamil Nadu 641104",
    mapUrl: "https://maps.google.com/?q=Sree+Sakthi+Engineering+College+Karamadai",
  },

  // Official Hackathon Dates: OCTOBER 10–11, 2026
  dates: {
    displayDate: "OCTOBER 10–11, 2026",
    registrationOpen: "SEPTEMBER 01, 2026",
    registrationDeadline: "OCTOBER 05, 2026", // Separate registration deadline
    hackathonStart: "2026-10-10T09:00:00+05:30",
    hackathonEnd: "2026-10-11T17:00:00+05:30",
  },

  // TODO: OFFICIAL EVENT DATA - Venue specifications
  venue: {
    displayVenue: "APJ Abdul Kalam Auditorium & Innovation Hub", // TODO: OFFICIAL EVENT DATA
    hall: "Central Tech Complex, Main Block",
    city: "Karamadai, Coimbatore",
  },

  teamSize: {
    min: 2,
    max: 4,
    recommended: 4,
    note: "2 to 4 members per team (interdisciplinary & cross-college teams welcome)", // TODO: OFFICIAL EVENT DATA
  },

  // TODO: OFFICIAL EVENT DATA - Official Prize values as determined by organizers
  prizePool: {
    totalDisplay: "TBA", // TODO: OFFICIAL EVENT DATA
    prizes: [
      {
        rank: "01",
        title: "1ST PRIZE",
        amount: "TBA", // TODO: OFFICIAL EVENT DATA
        perks: [
          "Cash Prize & Grand Trophy",
          "Direct Incubation / PoC Mentorship",
          "Exclusive SHF'26 Winner Badges & Certificates",
          "Cloud & Tooling Credits"
        ],
        highlight: true,
      },
      {
        rank: "02",
        title: "2ND PRIZE",
        amount: "TBA", // TODO: OFFICIAL EVENT DATA
        perks: [
          "Cash Prize & Silver Trophy",
          "Industry Mentor Fast-Track Sessions",
          "Merit Certificates & Tech Goodies",
          "API & Infrastructure Perks"
        ],
      },
      {
        rank: "03",
        title: "3RD PRIZE",
        amount: "TBA", // TODO: OFFICIAL EVENT DATA
        perks: [
          "Cash Prize & Bronze Trophy",
          "Investor & Industry Networking Access",
          "Merit Certificates & Swag Kits",
          "Partner Sponsor Perks"
        ],
      },
      {
        rank: "SP",
        title: "SPECIAL AWARDS",
        amount: "TBA", // TODO: OFFICIAL EVENT DATA
        perks: [
          "Best All-Women Team Award",
          "Most Innovative Hardware/IoT Prototype",
          "Best UI/UX & Product Design",
          "Best Fresher Innovation"
        ],
      }
    ]
  },

  stats: [
    { label: "HOURS OF CODE", value: "24", suffix: "HRS" },
    { label: "PRIZE POOL", value: "TBA", suffix: "" }, // TODO: OFFICIAL EVENT DATA
    { label: "TEAMS SELECTED", sublabel: "(FIRST COME FIRST SERVE)", value: "40", suffix: "TEAMS" },
    { label: "INNOVATION TRACKS", value: "05", suffix: "TRACKS" },
  ],

  challenges: [
    {
      id: "challenge-01",
      number: "01",
      label: "CHALLENGE 01",
      title: "DECODE THE MYSTERY",
      description:
        "No problem statement at Hour 0, only a scenario. Clues are revealed over time, and the real problem comes last. Read between the lines and start building before everyone else figures it out.",
      secondaryDescription:
        "In a hurry? Unlock clues early, but every shortcut costs you points. Think harder, or pay the price. Your call.",
      bullets: [
        "Start with only the scenario",
        "Discover clues as the challenge progresses",
        "Unlock clues early at a points cost",
        "Identify the real problem before others",
      ],
      highlight: "THINK HARDER. OR PAY THE PRICE.",
    },
    {
      id: "challenge-02",
      number: "02",
      label: "CHALLENGE 02",
      title: "ADAPT OR FALL BEHIND",
      description:
        "Just when you think you have it figured out, the rules change. New constraints drop at every phase, and your solution has to keep up.",
      bullets: [
        "New constraints arrive at every phase",
        "Adapt your solution without losing momentum",
        "Handle changing requirements under pressure",
        "Keep building while the rules evolve",
      ],
      highlight: "THE BEST BUILDERS DON'T JUST BUILD. THEY ADAPT.",
    },
  ],

  pillars: [
    {
      title: "BUILD REAL SOLUTIONS",
      subtitle: "Production-Grade Engineering",
      description: "Move past toy projects. Build production-grade architectures designed to withstand enterprise traffic, security audits, and edge deployments.",
      icon: "Cpu"
    },
    {
      title: "MEET INNOVATORS",
      subtitle: "High-Caliber Network",
      description: "Collaborate with premier developers, systems engineers, and designers across top technology institutions in India.",
      icon: "Users"
    },
    {
      title: "SHOWCASE YOUR SKILLS",
      subtitle: "Jury from Tier-1 Tech",
      description: "Have your codebase, architectural decisions, and creative problem-solving scrutinized directly by seasoned tech architects.",
      icon: "Code2"
    },
    {
      title: "WIN RECOGNITION",
      subtitle: "Capital & Industry Access",
      description: "Compete for cash rewards, direct mentorship, cloud sponsorships, and fast-track hiring consideration with corporate sponsors.",
      icon: "Trophy"
    }
  ],

  timeline: [
    {
      id: "t1",
      stage: "REGISTRATION OPENS",
      date: "SEP 01, 2026", // TODO: OFFICIAL EVENT DATA
      time: "09:00 AM IST",
      description: "Online portal opens for team registration and preliminary idea submissions.",
      status: "completed"
    },
    {
      id: "t2",
      stage: "REGISTRATION CLOSES",
      date: "OCT 05, 2026",
      time: "11:59 PM IST",
      description: "Final deadline to submit registration and verify team member details on the Grid portal.",
      status: "active"
    },
    {
      id: "t3",
      stage: "HACKATHON BEGINS",
      date: "OCT 10, 2026",
      time: "08:30 AM IST",
      description: "Reporting, security badge verification, breakfast, and grand opening ceremony.",
      status: "upcoming"
    },
    {
      id: "t4",
      stage: "BUILD PHASE (24-HR NON-STOP)",
      date: "OCT 10, 2026",
      time: "10:30 AM IST",
      description: "Hack clocks begin ticking. Continuous Wi-Fi 6, power grids, midnight refreshments, and mentor checkpoints.",
      status: "upcoming"
    },
    {
      id: "t5",
      stage: "SUBMISSION FREEZE",
      date: "OCT 11, 2026",
      time: "10:30 AM IST",
      description: "Code commit freeze. Public GitHub repository link and working deployment submitted to the portal.",
      status: "upcoming"
    },
    {
      id: "t6",
      stage: "FINAL DEMO",
      date: "OCT 11, 2026",
      time: "02:30 PM IST",
      description: "Top 10 finalist teams present on the main auditorium stage before the grand jury panel.",
      status: "upcoming"
    },
    {
      id: "t7",
      stage: "WINNERS & PRIZE CEREMONY",
      date: "OCT 11, 2026",
      time: "04:30 PM IST",
      description: "Announcement of 1st, 2nd, 3rd prizes, special awards, trophy handovers, and closing address.",
      status: "upcoming"
    }
  ],

  // Official rules strictly matching standard technical fest protocols
  rules: [
    {
      id: "rule-1",
      category: "Eligibility",
      question: "Who can participate?",
      answer: "All current undergraduate (B.E., B.Tech, B.Sc, BCA) and postgraduate (M.E., M.Tech, MCA, M.Sc) students currently enrolled in recognized colleges/universities are eligible. Valid college identity cards must be presented at the check-in desk."
    },
    {
      id: "rule-2",
      category: "Teams",
      question: "What is the team size?",
      answer: "Teams must consist of a minimum of 2 and a maximum of 4 members. Cross-department and inter-college team formations are permitted and actively encouraged."
    },
    {
      id: "rule-3",
      category: "Tech",
      question: "What technologies can be used?",
      answer: "Any modern technology stack is allowed (React, Next.js, Node.js, Python, Go, Rust, Flutter, React Native, TensorFlow, PyTorch). Open source libraries and frameworks are welcomed provided they are declared."
    },
    {
      id: "rule-4",
      category: "Guidelines",
      question: "What should participants bring?",
      answer: "Participants must bring their personal laptops, chargers, extension cords, and their official college photo identity cards. High-speed networking, power outlets, meals, and overnight resting facilities are provided."
    },
    {
      id: "rule-5",
      category: "Guidelines",
      question: "What are the submission requirements?",
      answer: "All code must be authored during the 24-hour sprint. Teams must submit a public GitHub repository link containing a descriptive README, architectural overview, clean commits, and a live web/app URL."
    },
    {
      id: "rule-6",
      category: "Evaluation",
      question: "Judges' Decision",
      answer: "The decision of the judges and organizing committee is final and binding on all participants."
    }
  ],

  contact: {
    email: "sakthihackfest@gmail.com",
    phone: "+91 63812 06466",
    studentCoordinators: [
      { name: "Jeevanandh", role: "Student Coordinator", phone: "63812 06466" },
      { name: "Harini", role: "Student Coordinator", phone: "74181 12402" }
    ],
    facultyCoordinators: [
      { name: "Dr. K. S. Ramanathan", department: "Computer Science & Engineering", phone: "+91 94421 00000" },
      { name: "Prof. S. Priyadharshini", department: "Information Technology", phone: "+91 94422 00000" }
    ]
  },

  socialLinks: {
    instagram: "https://instagram.com/sakthihackfest", // TODO: OFFICIAL EVENT DATA
    linkedin: "https://linkedin.com/company/sreesakthi-engineering-college", // TODO: OFFICIAL EVENT DATA
    website: "https://www.sreesakthi.edu.in",
    github: "https://github.com/sakthi-hackfest"
  }
};
