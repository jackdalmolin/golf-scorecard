import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "./firebase";
import Navbar from "./components/Navbar.jsx";
import TournamentSelector from "./components/TournamentSelector.jsx";
import { useNavigate } from "react-router-dom";

const formatScore = (val) => {
  if (val === 0) return "E";
  return val > 0 ? `+${val}` : `${val}`;
};

const App = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState({});
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [teams, setTeams] = useState([]);
  const [course, setCourse] = useState(null);

  useEffect(() => {
    const dbRef = ref(db, "tournaments");
    onValue(dbRef, (snapshot) => {
      const data = snapshot.val() || {};
      setTournaments(data);

      const saved = localStorage.getItem("selected-tournament");
      if (saved && data[saved]) {
        setSelectedTournament(saved);
        setTeams(data[saved].teams || []);
        setCourse(data[saved].course || null);
      }
    });
  }, []);

  const handleTournamentSelect = (name) => {
    const selected = tournaments[name];
    if (selected) {
      setSelectedTournament(name);
      setCourse(selected.course);
      setTeams(selected.teams || []);
      localStorage.setItem("selected-tournament", name);
    }
  };

  const calculateStats = (team) => {
    const front9 = team.scores?.slice(0, 9) || [];
    const back9 = team.scores?.slice(9, 18) || [];

    const scoreDiff = (scores, pars) =>
      scores.reduce((acc, s, i) => acc + (s != null ? s - (pars[i] || 4) : 0), 0);

    const front = scoreDiff(front9, course?.holes?.slice(0, 9) || []);
    const back = scoreDiff(back9, course?.holes?.slice(9, 18) || []);
    const total = front + back;

    return { name: team.name, front, back, total };
  };

  const sortedStats = course
    ? teams.map(calculateStats).sort((a, b) => a.total - b.total)
    : [];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white p-6 max-w-5xl mx-auto font-serif">
        <h1 className="text-3xl font-bold text-green-800 mb-4">Leaderboard</h1>

        <label className="font-medium text-gray-700 mb-2 block">
          Select Tournament
        </label>
        <select
          className="border p-2 rounded w-full mb-6"
          value={selectedTournament || ""}
          onChange={(e) => handleTournamentSelect(e.target.value)}
        >
          <option value="" disabled>Select tournament</option>
          {Object.keys(tournaments).map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        {sortedStats.length > 0 ? (
          <div className="border border-gray-200 rounded-lg overflow-hidden shadow">
            <div className="bg-green-700 text-white font-semibold px-4 py-2 text-sm">
              🏆 Team Standings
            </div>
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="bg-green-700 text-white text-sm uppercase tracking-wide">
                  <th className="px-4 py-2 border">Pos</th>
                  <th className="px-4 py-2 border">Team</th>
                  <th className="px-4 py-2 border text-center">Front 9</th>
                  <th className="px-4 py-2 border text-center">Back 9</th>
                  <th className="px-4 py-2 border text-center">Total</th>
                </tr>
              </thead>
              <tbody>
                {sortedStats.map((team, idx) => (
                  <tr
                    key={idx}
                    className="even:bg-gray-50 odd:bg-white hover:bg-yellow-50 transition"
                  >
                    <td className="px-4 py-2 border">{idx + 1}</td>
                    <td className="px-4 py-2 border text-green-800 font-semibold">
                      <button
                        onClick={() => {
                          localStorage.setItem("focused-team-name", team.name);
                          navigate("/scorecard");
                        }}
                        className="hover:underline"
                      >
                        {team.name}
                      </button>
                    </td>
                    <td className="px-4 py-2 border text-center">{team.front}</td>
                    <td className="px-4 py-2 border text-center">{team.back}</td>
                    <td className="px-4 py-2 border text-center font-bold text-green-800">
                      {formatScore(team.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500 mt-6">No teams found for this tournament.</p>
        )}
      </div>
    </>
  );
};

export default App;
