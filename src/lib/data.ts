export const TRACKS = [
  { id: "tech", name: "Tech" },
  { id: "commerce", name: "Commerce" },
  { id: "sustainability", name: "Sustainability" },
];

export const TEAMS: Record<string, { id: string; name: string }[]> = {
  tech: Array.from({ length: 6 }).map((_, i) => ({ id: `tech_team_${i+1}`, name: `Tech Team ${i+1}` })),
  commerce: Array.from({ length: 6 }).map((_, i) => ({ id: `comm_team_${i+1}`, name: `Commerce Team ${i+1}` })),
  sustainability: Array.from({ length: 6 }).map((_, i) => ({ id: `sust_team_${i+1}`, name: `Sustainability Team ${i+1}` })),
};

export const MENTORS: Record<string, { id: string; name: string; avatar?: string }[]> = {
  tech: [
    { id: "tech_mentor_1", name: "Mohammad Atif" },
    { id: "tech_mentor_2", name: "Akshay Shukla" },
    { id: "tech_mentor_3", name: "Sanjeev Kumar" },
    { id: "tech_mentor_4", name: "Ankit Kumar" },
    { id: "tech_mentor_5", name: "Akshay Kumar" },
  ],
  commerce: [
    { id: "comm_mentor_1", name: "Arpit Tiwari" },
    { id: "comm_mentor_2", name: "Mrityunjay Pandey" },
    { id: "comm_mentor_3", name: "Aparna Agarwal" },
    { id: "comm_mentor_4", name: "Rishabh Jaiswal" },
    { id: "comm_mentor_5", name: "Divyansh Raghuwanshi" },
  ],
  sustainability: [
    { id: "sust_mentor_1", name: "Karan Gupta" },
    { id: "sust_mentor_2", name: "Rohit Kumar Mittal" },
    { id: "sust_mentor_3", name: "Dr. Niraj Jha" },
    { id: "sust_mentor_4", name: "Gaurav Mishra" },
    { id: "sust_mentor_5", name: "Mohan Lal Keshri" },
  ],
};
