"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseStore";
import { Search, Loader2 } from "lucide-react";

interface Participant {
  id: string; // Townscript uniqueOrderId (guaranteed unique for React keys)
  firebaseId: string; // Firebase doc ID (for Firestore updates)
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  location: string;
  size: string;
  kitGiven: boolean;
  tshirtGiven: boolean;
  townscriptTxn?: string;
  rollNo?: string;
  college?: string;
}

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch from Firebase
        const usersSnapshot = await getDocs(collection(db, "users_2026"));
        let firebaseUsers: any[] = [];
        usersSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.formFilled) {
            firebaseUsers.push({ id: doc.id, ...data });
          }
        });

        // Fetch from Townscript
        const tsRes = await fetch("/api/fetch-townscript");
        const tsData = await tsRes.json();
        
        console.log("Raw Townscript API Response:", tsData);
        
        let tsUsers: any[] = [];
        try {
          if (typeof tsData.data === "string") {
            tsUsers = JSON.parse(tsData.data);
          } else if (Array.isArray(tsData.data)) {
            tsUsers = tsData.data;
          } else if (Array.isArray(tsData)) {
            tsUsers = tsData;
          }
        } catch (e) {
          console.error("Failed to parse tsData.data", e);
        }

        console.log("Parsed Townscript Users Array:", tsUsers);

        // Merge data using Townscript as the source of truth
        const merged: Participant[] = tsUsers.map((tsUser: any) => {
          // Find matching firebase record by email
          const fbMatch = firebaseUsers.find((fb: any) => fb.email === tsUser.userEmailId);
          let rollNo = "";
          let college = "";
          
          if (Array.isArray(tsUser.answerList)) {
             const rollAnswer = tsUser.answerList.find((a: any) => a.question && a.question.toLowerCase().includes("roll no"));
             const collegeAnswer = tsUser.answerList.find((a: any) => a.question && a.question.toLowerCase().includes("college"));
             
             rollNo = rollAnswer ? rollAnswer.answer : "";
             college = collegeAnswer ? collegeAnswer.answer : "";
          }

          return {
            id: tsUser.uniqueOrderId, // ALWAYS unique per ticket
            firebaseId: fbMatch ? fbMatch.id : tsUser.uniqueOrderId, // Where to save in Firebase
            firstname: fbMatch ? fbMatch.firstname : tsUser.userName,
            lastname: fbMatch ? fbMatch.lastname : "",
            email: tsUser.userEmailId,
            phone: fbMatch ? fbMatch.phone : "N/A",
            location: fbMatch ? fbMatch.location : "N/A",
            size: fbMatch ? fbMatch.size : "N/A",
            kitGiven: fbMatch ? fbMatch.kitGiven : false,
            tshirtGiven: fbMatch ? fbMatch.tshirtGiven : false,
            townscriptTxn: tsUser.uniqueOrderId,
            rollNo,
            college
          };
        });

        // We no longer need to filter because we are ONLY iterating over people who have paid (Townscript attendees)
        setParticipants(merged);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCheckbox = async (userId: string, firebaseId: string, field: "kitGiven" | "tshirtGiven", value: boolean) => {
    // Optimistic UI update using unique React key
    setParticipants(prev => prev.map(p => p.id === userId ? { ...p, [field]: value } : p));
    
    // Firebase update using actual Firebase Document ID
    try {
      await setDoc(doc(db, "users_2026", firebaseId), {
        [field]: value
      }, { merge: true });
    } catch (error) {
      console.error("Error updating document:", error);
      // Revert on error
      setParticipants(prev => prev.map(p => p.id === userId ? { ...p, [field]: !value } : p));
    }
  };

  const filteredParticipants = participants.filter((p) => {
    const query = search.toLowerCase();
    return (
      p.firstname.toLowerCase().includes(query) ||
      p.lastname.toLowerCase().includes(query) ||
      p.email.toLowerCase().includes(query) ||
      p.townscriptTxn?.toLowerCase().includes(query) ||
      p.rollNo?.toLowerCase().includes(query)
    );
  });

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Participants</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Manage all registered participants. Check off their kit and t-shirt distribution.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-zinc-500" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-3 bg-zinc-900 text-white placeholder-zinc-500 focus:ring-2 focus:ring-[#00b0f0] sm:text-sm shadow-sm"
            placeholder="Search by name, email, roll no, or txn id..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 shadow">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#00b0f0]" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-800">
                <thead className="bg-zinc-900/80">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Participant</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Txn / Details</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Kit Given</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">T-Shirt Given</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 bg-transparent">
                  {filteredParticipants.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                            <span className="text-zinc-300 font-medium text-sm">{p.firstname.charAt(0)}{p.lastname ? p.lastname.charAt(0) : ""}</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-zinc-200">{p.firstname} {p.lastname}</div>
                            <div className="text-xs text-zinc-500">{p.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-zinc-300">{p.phone}</div>
                        <div className="text-xs text-zinc-500">{p.location}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-mono text-emerald-400">{p.townscriptTxn}</div>
                        <div className="text-xs text-zinc-400">
                          {p.rollNo ? `Roll: ${p.rollNo}` : (p.college ? p.college : "N/A")}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex items-center rounded-md bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-300 ring-1 ring-inset ring-zinc-700">
                          {p.size}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center h-5">
                          <input
                            type="checkbox"
                            className="h-5 w-5 rounded border-zinc-700 bg-zinc-900 text-[#00b0f0] focus:ring-[#00b0f0] focus:ring-offset-zinc-900 cursor-pointer"
                            checked={p.kitGiven}
                            onChange={(e) => handleCheckbox(p.id, p.firebaseId, "kitGiven", e.target.checked)}
                          />
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                         <div className="flex items-center h-5">
                          <input
                            type="checkbox"
                            className="h-5 w-5 rounded border-zinc-700 bg-zinc-900 text-[#00b0f0] focus:ring-[#00b0f0] focus:ring-offset-zinc-900 cursor-pointer"
                            checked={p.tshirtGiven}
                            onChange={(e) => handleCheckbox(p.id, p.firebaseId, "tshirtGiven", e.target.checked)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredParticipants.length === 0 && !loading && (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-zinc-500">
                        No participants found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
