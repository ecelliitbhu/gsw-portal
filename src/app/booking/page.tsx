"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useState } from "react";
import { BookingMatrixView } from "@/components/BookingMatrix";
import { TRACKS } from "@/lib/data";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function BookingPage() {
  const { data: session } = useSession();
  // @ts-ignore
  const userRole = session?.user?.role;
  // @ts-ignore
  const userTrackId = session?.user?.trackId;

  // Filter tracks if team leader, else show all
  const visibleTracks = userRole === "team_leader" && userTrackId
    ? TRACKS.filter(t => t.id === userTrackId)
    : TRACKS;

  const [activeTrack, setActiveTrack] = useState(visibleTracks[0]?.id || TRACKS[0].id);

  // If session loads and they are a team leader, switch to their track
  useEffect(() => {
    if (userRole === "team_leader" && userTrackId) {
      setActiveTrack(userTrackId);
    }
  }, [userRole, userTrackId]);

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Book Mentors</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Manage slot bookings across tracks. Changes are saved automatically.
            </p>
          </div>
        </div>

        {/* Track Tabs */}
        <div className="border-b border-zinc-800">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {visibleTracks.map((track) => (
              <button
                key={track.id}
                onClick={() => setActiveTrack(track.id)}
                className={`
                  whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
                  ${
                    activeTrack === track.id
                      ? "border-[#00b0f0] text-[#00b0f0]"
                      : "border-transparent text-zinc-400 hover:border-zinc-700 hover:text-zinc-300"
                  }
                `}
              >
                {track.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Matrix View */}
        <div className="mt-4">
          {visibleTracks.map((track) => (
             <div key={track.id} className={activeTrack === track.id ? "block" : "hidden"}>
                <BookingMatrixView trackId={track.id} />
             </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
