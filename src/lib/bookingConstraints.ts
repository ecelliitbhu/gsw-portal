export type BookingMatrix = {
  [slotId: string]: {
    [teamId: string]: string | null; // mentorId or null
  }
};

// 5 slots total (0 to 4)
export const SLOTS = ["slot_1", "slot_2", "slot_3", "slot_4", "slot_5"];

export type ValidationResult = {
  valid: boolean;
  message?: string;
};

export function validateMove(
  matrix: BookingMatrix,
  teamId: string,
  slotId: string,
  mentorId: string | null
): ValidationResult {
  // If we are clearing a cell, it's always allowed (as long as it was valid before, but let's assume it was)
  if (!mentorId) {
    return { valid: true };
  }

  // Deep clone matrix to simulate the move
  const newMatrix = JSON.parse(JSON.stringify(matrix)) as BookingMatrix;
  if (!newMatrix[slotId]) {
    newMatrix[slotId] = {};
  }
  newMatrix[slotId][teamId] = mentorId;

  // 1. Team can only book 3 mentors in total
  let teamBookings = 0;
  for (const slot of SLOTS) {
    if (newMatrix[slot]?.[teamId]) {
      teamBookings++;
    }
  }
  if (teamBookings > 3) {
    return { valid: false, message: "A team can only book a maximum of 3 slots." };
  }

  // 2. A team cannot book 3 consecutive slots
  // We check all sequences of 3 consecutive slots (1-2-3, 2-3-4, 3-4-5)
  for (let i = 0; i < SLOTS.length - 2; i++) {
    if (
      newMatrix[SLOTS[i]]?.[teamId] &&
      newMatrix[SLOTS[i+1]]?.[teamId] &&
      newMatrix[SLOTS[i+2]]?.[teamId]
    ) {
      return { valid: false, message: "A team cannot book 3 consecutive slots." };
    }
  }

  // 3. A mentor can only work with 4 teams maximum (appear 4 times in the whole matrix)
  let mentorCount = 0;
  for (const slot of SLOTS) {
    for (const team of Object.keys(newMatrix[slot] || {})) {
      if (newMatrix[slot][team] === mentorId) {
        mentorCount++;
      }
    }
  }
  if (mentorCount > 4) {
    return { valid: false, message: "This mentor is fully booked (max 4 teams)." };
  }

  // 4. A mentor can visit a specific team only once (cannot appear twice in the same column)
  let mentorVisitsToTeam = 0;
  for (const slot of SLOTS) {
    if (newMatrix[slot]?.[teamId] === mentorId) {
      mentorVisitsToTeam++;
    }
  }
  if (mentorVisitsToTeam > 1) {
    return { valid: false, message: "A mentor can only visit a specific team once." };
  }

  // 5. A mentor can only be assigned to one team per time slot (cannot appear twice in the same row)
  let mentorInSlotCount = 0;
  for (const team of Object.keys(newMatrix[slotId] || {})) {
    if (newMatrix[slotId][team] === mentorId) {
      mentorInSlotCount++;
    }
  }
  if (mentorInSlotCount > 1) {
    return { valid: false, message: "This mentor is already booked for this slot by another team." };
  }

  return { valid: true };
}

export function checkCellBlocked(
  matrix: BookingMatrix,
  teamId: string,
  slotId: string
): { blocked: boolean; reason?: string } {
  // If the cell is already filled, it's not "blocked" (it's occupied)
  if (matrix[slotId]?.[teamId]) {
    return { blocked: false };
  }

  // 1. Check max bookings
  let teamBookings = 0;
  for (const slot of SLOTS) {
    if (matrix[slot]?.[teamId]) {
      teamBookings++;
    }
  }
  if (teamBookings >= 3) {
    return { blocked: true, reason: "Max 3 slots" };
  }

  // 2. Check 3 consecutive slots rule by simulating a booking
  const newMatrix = JSON.parse(JSON.stringify(matrix)) as BookingMatrix;
  if (!newMatrix[slotId]) {
    newMatrix[slotId] = {};
  }
  newMatrix[slotId][teamId] = "dummy";

  for (let i = 0; i < SLOTS.length - 2; i++) {
    if (
      newMatrix[SLOTS[i]]?.[teamId] &&
      newMatrix[SLOTS[i+1]]?.[teamId] &&
      newMatrix[SLOTS[i+2]]?.[teamId]
    ) {
      return { blocked: true, reason: "Consecutive slots" };
    }
  }

  return { blocked: false };
}

