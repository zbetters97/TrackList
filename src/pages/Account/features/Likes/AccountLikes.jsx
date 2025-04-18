import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import Tabs from "src/components/Tabs";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import LikedMedia from "./components/LikedMedia";
import LikedReviews from "./components/LikedReviews";

export default function AccountLikes() {
  const { user, canEdit } = useOutletContext();
  const [activeTab, setActiveTab] = useState("artist");

  const tabs = [
    { id: "artist", label: "Artists" },
    { id: "album", label: "Albums" },
    { id: "track", label: "Tracks" },
    { id: "review", label: "Reviews" },
  ];

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <Header canEdit={canEdit} />

      <div>
        <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        <LikedContent activeTab={activeTab} user={user} />
      </div>
    </div>
  );
}

function Header({ canEdit }) {
  return (
    <div className="flex items-center justify-between border-b-1 border-white pb-4 align-middle">
      <p className="text-2xl text-white">Likes</p>
      {canEdit && (
        <Link
          to="/search"
          className="flex cursor-pointer items-center gap-1 rounded-md border-2 border-white px-2 py-1 text-lg hover:text-gray-400"
        >
          <FontAwesomeIcon icon={faSearch} />
          <p>Find more</p>
        </Link>
      )}
    </div>
  );
}

function LikedContent({ activeTab, user }) {
  return (
    <div className="p-4">
      {activeTab === "review" ? (
        <LikedReviews user={user} />
      ) : (
        <LikedMedia user={user} activeTab={activeTab} />
      )}
    </div>
  );
}
