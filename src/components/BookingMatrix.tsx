"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseStore";
import { BookingMatrix, SLOTS, validateMove, checkCellBlocked } from "@/lib/bookingConstraints";
import { TEAMS, MENTORS } from "@/lib/data";
import { Loader2, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";

export function BookingMatrixView({ trackId }: { trackId: string }) {
  const { data: session } = useSession();
  // @ts-ignore
  const userRole = session?.user?.role;
  // @ts-ignore
  const userTeamId = session?.user?.teamId;

  const [matrix, setMatrix] = useState<BookingMatrix>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const teams = TEAMS[trackId] || [];
  const mentors = MENTORS[trackId] || [];

  useEffect(() => {
    // Listen to real-time updates for this track
    const unsubscribe = onSnapshot(doc(db, "bookings", trackId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMatrix(data.matrix || {});
      } else {
        // Initialize if doesn't exist
        setMatrix({});
      }
      setLoading(false);
    }, (err) => {
      console.error("Firestore error:", err);
      setError("Failed to connect to database for real-time updates.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [trackId]);

  const handleCellChange = async (slotId: string, teamId: string, mentorId: string | null) => {
    setError(null);
    const validation = validateMove(matrix, teamId, slotId, mentorId);
    
    if (!validation.valid) {
      setError(validation.message || "Invalid move");
      return;
    }

    // Optimistically update local state? Not strictly necessary because Firestore onSnapshot is fast, 
    // but we will do it through Firestore to ensure consistency.
    const newMatrix = JSON.parse(JSON.stringify(matrix)) as BookingMatrix;
    if (!newMatrix[slotId]) {
      newMatrix[slotId] = {};
    }
    
    if (mentorId) {
      newMatrix[slotId][teamId] = mentorId;
    } else {
      delete newMatrix[slotId][teamId];
    }

    try {
      await setDoc(doc(db, "bookings", trackId), { matrix: newMatrix }, { merge: true });
    } catch (err) {
      console.error("Update failed:", err);
      setError("Failed to update booking. Are you offline?");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00b0f0]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-md bg-red-500/10 p-3 text-red-500 border border-red-500/20">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/50 shadow">
        <table className="min-w-full divide-y divide-zinc-800">
          <thead className="bg-zinc-900/80">
            <tr>
              <th className="px-4 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider w-32 border-r border-zinc-800">
                Time Slots
              </th>
              {teams.map((team) => (
                <th key={team.id} className="px-4 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider min-w-[150px]">
                  {team.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 bg-transparent">
            {SLOTS.map((slotId, index) => (
              <tr key={slotId} className="hover:bg-zinc-800/20 transition-colors">
                <td className="whitespace-nowrap px-4 py-4 border-r border-zinc-800">
                  <div className="text-sm font-medium text-zinc-300">Slot {index + 1}</div>
                  <div className="text-xs text-zinc-500">20 mins</div>
                </td>
                {teams.map((team) => {
                  const selectedMentorId = matrix[slotId]?.[team.id] || "";
                  let isDisabled = userRole === "team_leader" && team.id !== userTeamId;
                  let cellLabel = "-- Available --";

                  if (!isDisabled && !selectedMentorId) {
                    const blockCheck = checkCellBlocked(matrix, team.id, slotId);
                    if (blockCheck.blocked) {
                      isDisabled = true;
                      cellLabel = `-- Blocked (${blockCheck.reason}) --`;
                    }
                  }
                  
                  return (
                    <td key={team.id} className="whitespace-nowrap px-4 py-3">
                      <select
                        className={`w-full rounded-lg border-0 py-2 pl-3 pr-8 focus:ring-2 focus:ring-[#00b0f0] sm:text-sm shadow-sm border border-zinc-700/50 appearance-none transition-colors
                          ${isDisabled 
                            ? "bg-zinc-900/50 text-zinc-600 cursor-not-allowed border-zinc-800/50" 
                            : "bg-zinc-950 text-zinc-300"
                          }
                        `}
                        value={selectedMentorId}
                        onChange={(e) => handleCellChange(slotId, team.id, e.target.value || null)}
                        disabled={isDisabled}
                      >
                        <option value="">{cellLabel}</option>
                        {mentors.map((mentor) => (
                          <option key={mentor.id} value={mentor.id}>
                            {mentor.name}
                          </option>
                        ))}
                      </select>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
        <h3 className="text-sm font-medium text-white mb-2">Booking Rules</h3>
        <ul className="text-sm text-zinc-400 list-disc list-inside space-y-1">
          <li>A team can book exactly 3 mentors across 5 slots.</li>
          <li>A team cannot book 3 consecutive slots.</li>
          <li>A mentor can only visit a team once.</li>
          <li>A mentor can take a maximum of 4 teams total.</li>
          <li>Real-time conflicts will automatically be prevented.</li>
        </ul>
      </div>
    </div>
  );
}
