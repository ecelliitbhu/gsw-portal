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
  tech: Array.from({ length: 5 }).map((_, i) => ({ id: `tech_mentor_${i+1}`, name: `Tech Mentor ${i+1}` })),
  commerce: Array.from({ length: 5 }).map((_, i) => ({ id: `comm_mentor_${i+1}`, name: `Commerce Mentor ${i+1}` })),
  sustainability: Array.from({ length: 5 }).map((_, i) => ({ id: `sust_mentor_${i+1}`, name: `Sustainability Mentor ${i+1}` })),
};
