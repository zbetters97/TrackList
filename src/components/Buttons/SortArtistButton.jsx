import { useEffect, useRef, useState } from "react";
import { faSort } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function SortArtistButton({ artists, setArtists }) {
  const [showSort, setShowSort] = useState(false);
  const [initialArtists, setInitialAritsts] = useState([]);
  const sorterRef = useRef(null);

  const sortOptions = [
    { label: "Relevance", value: "relevant" },
    { label: "Popularity", value: "popular" },
    { label: "Followers", value: "followers" },
    { label: "A - Z", value: "alphabet" },
    { label: "Z - A", value: "rev-alphabet" },
  ];

  useEffect(() => {
    setInitialAritsts([...artists]);
  }, []);

  function sortArtists(sortValue) {
    const sortedArtists = artists.sort((a, b) => {
      switch (sortValue) {
        case "popular":
          return b.popularity > a.popularity;
        case "followers":
          return b.followers.total - a.followers.total;
        case "alphabet":
          return a.name > b.name;
        case "rev-alphabet":
          return b.name > a.name;
        default:
          return 0;
      }
    });

    sortValue === "relevant"
      ? setArtists([...initialArtists])
      : setArtists([...sortedArtists]);

    setShowSort(false);
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (sorterRef.current && !sorterRef.current.contains(event.target)) {
        setShowSort(false);
      }
    }

    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div ref={sorterRef} className="relative z-20 w-fit">
      <button
        onClick={() => setShowSort(!showSort)}
        className="flex cursor-pointer items-center gap-2 text-xl"
      >
        <FontAwesomeIcon icon={faSort} />
        <p>Sort by</p>
      </button>

      <div
        className={`absolute right-0 left-0 w-fit overflow-hidden rounded-lg bg-white text-black shadow-lg transition-all duration-300 ease-in-out ${
          showSort ? "max-h-screen p-2" : "max-h-0"
        }`}
      >
        {sortOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => sortArtists(option.value)}
            className="w-full rounded-sm px-3 py-1 text-left transition-all hover:bg-gray-300"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
