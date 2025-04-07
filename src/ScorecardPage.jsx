import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar.jsx";
import TournamentSelector from "./components/TournamentSelector.jsx";
import { ref, onValue, set } from "firebase/database";
import { db } from "./firebase";

const ScorecardPage = () => {
  const [tournaments, setTournaments] = useState({});
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [selectedTeamName, setSelectedTeamName] = useState(null);
  const [course, setCourse] = useState(null);
  const [teams, setTeams] = useState([]);

  // Fetch tournaments once at mount
  useEffect(() => {
    const tournamentRef = ref(db, "tournaments");
    onValue(tournamentRef, (snapshot) => {
      const data = snapshot.val() || {};
      setTournaments(data);

      const keys = Object.keys(data);
      if (keys.length > 0) {
        const mostRecent = keys.sort().reverse()[0];
        setSelectedTournament(mostRecent);
      }
    });
  }, []);

  // Update selected tournament
  useEffect(() => {
    if (selectedTournament && tournaments[selectedTournament]) {
      const { course, teams } = tournaments[selectedTournament];
      setCourse(course);
      setTeams(teams || []);
    }
  }, [selectedTournament, tournaments]);

  const updateScore = (holeIdx, val) => {
    const updated = [...teams];
    const teamIndex = updated.findIndex((t) => t.name === selectedTeamName);
    if (teamIndex === -1) return;

    updated[teamIndex].scores[holeIdx] = val;
    setTeams(updated);

    set(ref(db, `tournaments/${selectedTournament}/teams/${teamIndex}/scores`), updated[teamIndex].scores);
  };

  const updateNote = (holeIdx, val) => {
    const updated = [...teams];
    const teamIndex = updated.findIndex((t) => t.name === selectedTeamName);
    if (teamIndex === -1) return;

    updated[teamIndex].notes[holeIdx] = val;
    setTeams(updated);

    set(ref(db, `tournaments/${selectedTournament}/teams/${teamIndex}/notes`), updated[teamIndex].notes);
  };

  const updatePar = (holeIdx, val) => {
    const updated = [...(course?.holes || [])];
    updated[holeIdx] = val || 4;
    const newCourse = { ...course, holes: updated };
    setCourse(newCourse);

    set(ref(db, `tournaments/${selectedTournament}/course/holes`), updated);
  };

  const calculateTotal = (scores, holes) =>
    scores.reduce((acc, s, i) => (s != null ? acc + (s - holes[i]) : acc), 0);

  const getResultStyle = (score, par) => {
    if (score == null) return "text-gray-400";
    const diff = score - par;
    if (diff === -2) return "border-2 border-green-700 rounded-full px-2 font-bold text-green-800";
    if (diff === -1) return "border border-green-700 rounded-full px-2 text-green-800";
    if (diff === 1) return "border border-red-600 px-2 text-red-600";
    if (diff >= 2) return "border-2 border-red-600 px-2 text-red-600";
    return "text-gray-500";
  };

  const renderScorecard = () => {
    const teamList = Array.isArray(teams) ? teams : Object.values(teams);
    let team = teamList.find((t) => t.name === selectedTeamName);

if (team && (!team.scores || !team.notes)) {
  const teamIndex = teamList.findIndex((t) => t.name === selectedTeamName);
  const fallbackScores = Array(18).fill(null);
  const fallbackNotes = Array(18).fill("");

  if (!team.scores) team.scores = fallbackScores;
  if (!team.notes) team.notes = fallbackNotes;

  set(ref(db, `tournaments/${selectedTournament}/teams/${teamIndex}/scores`), team.scores);
  set(ref(db, `tournaments/${selectedTournament}/teams/${teamIndex}/notes`), team.notes);
}


    if (!team || !team.scores || !course?.holes)
      return <p className="text-gray-600">No team or score data found.</p>;

    const total = calculateTotal(team.scores, course.holes);

    return (
      <div className="mt-6 border rounded-md overflow-hidden shadow-md">
        <div className="bg-green-800 text-white text-lg font-semibold px-4 py-2">
          Total: {total >= 0 ? `+${total}` : total}
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-800 font-semibold">
            <tr>
              <th className="p-2 border">Hole</th>
              <th className="p-2 border">Par</th>
              <th className="p-2 border">Score</th>
              <th className="p-2 border">Result</th>
              <th className="p-2 border">Notes</th>
            </tr>
          </thead>
          <tbody>
            {course.holes.map((par, idx) => (
              <tr key={idx} className="even:bg-white odd:bg-gray-50">
                <td className="p-2 text-center border">{idx + 1}</td>
                <td className="p-2 text-center border">
                  <input
                    type="number"
                    value={par}
                    onChange={(e) => updatePar(idx, parseInt(e.target.value))}
                    className="w-12 text-center border rounded"
                  />
                </td>
                <td className="p-2 text-center border">
                  <input
                    type="number"
                    value={team.scores[idx] ?? ""}
                    onChange={(e) =>
                      updateScore(idx, e.target.value === "" ? null : parseInt(e.target.value))
                    }
                    placeholder="-"
                    className="w-12 text-center border rounded"
                  />
                </td>
                <td className="p-2 text-center border">
                  {team.scores[idx] != null ? (
                    <span className={getResultStyle(team.scores[idx], par)}>
                      {team.scores[idx]}
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="p-2 border">
                  <input
                    type="text"
                    value={team.notes[idx] ?? ""}
                    onChange={(e) => updateNote(idx, e.target.value)}
                    placeholder="Add notes..."
                    className="w-full border rounded p-1 text-sm"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 font-serif">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-green-800 mb-4">Scorecard</h1>

          <div className="mb-4">
            <label className="block font-medium mb-1">Select Tournament</label>
            <select
              value={selectedTournament || ""}
              onChange={(e) => {
                setSelectedTournament(e.target.value);
                setSelectedTeamName(null);
              }}
              className="w-full p-2 border rounded"
            >
              <option value="" disabled>Select a tournament</option>
              {Object.keys(tournaments).map((name, idx) => (
                <option key={idx} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {selectedTournament && (
            <div className="mb-6">
              <label className="block font-medium mb-1">Select Team</label>
              <select
                value={selectedTeamName || ""}
                onChange={(e) => setSelectedTeamName(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="" disabled>Select team</option>
                {teams.map((team, idx) => (
                  <option key={idx} value={team.name}>{team.name}</option>
                ))}
              </select>
            </div>
          )}

          {selectedTeamName && renderScorecard()}
        </div>
      </div>
    </>
  );
};

export default ScorecardPage;
