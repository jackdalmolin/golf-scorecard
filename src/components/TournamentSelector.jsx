import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const TournamentSelector = ({ onSelect }) => {
  const [tournaments, setTournaments] = useState([]);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    const fetchTournaments = async () => {
      const snapshot = await getDocs(collection(db, "tournaments"));
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTournaments(list);

      // Auto-select last tournament
      const lastSelected = localStorage.getItem("selected-tournament");
      const fallback = list[0];

      const toSelect = list.find((t) => t.id === lastSelected) || fallback;

      if (toSelect) {
        setSelected(toSelect.id);
        onSelect(toSelect);
      }
    };

    fetchTournaments();
  }, []);

  const handleChange = (e) => {
    const id = e.target.value;
    setSelected(id);

    const selectedTournament = tournaments.find((t) => t.id === id);
    localStorage.setItem("selected-tournament", id);
    onSelect(selectedTournament);
  };

  return (
    <div className="mb-6">
      <label className="block font-semibold mb-1 text-gray-700">
        Select Tournament
      </label>
      <select
        value={selected}
        onChange={handleChange}
        className="border border-gray-300 rounded p-2 w-full sm:w-64"
      >
        {tournaments.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TournamentSelector;
