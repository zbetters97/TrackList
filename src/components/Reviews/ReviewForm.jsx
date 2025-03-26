import { useRef, useState } from "react";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import StarRating from "../StarRating";
import { useAuthContext } from "../../context/Auth/AuthContext";
import { useReviewContext } from "../../context/Review/ReviewContext";
import { useSpotifyContext } from "../../context/Spotify/SpotifyContext";
import { useNavigate } from "react-router-dom";

export default function ReviewForm({ onClose }) {
  const { globalUser, getUserById } = useAuthContext();
  const { searchByName, getMediaById } = useSpotifyContext();
  const { addReview, setReviews } = useReviewContext();

  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [mediaId, setMediaId] = useState("");
  const [mediaImage, setMediaImage] = useState("/images/default-img.jpg");
  const [rating, setRating] = useState(null);

  const formRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);

  async function submitReview() {
    const content = textareaRef?.current?.value.trim();

    if (content === "") return;

    const reviewInfo = {
      content,
      userId: globalUser.uid,
      category: "artist",
      mediaId,
      rating,
      likes: [],
      dislikes: [],
      comments: [],
    };

    const newReview = await addReview(reviewInfo);
    const username = (await getUserById(globalUser.uid)).username;
    const media = await getMediaById(reviewInfo.mediaId, reviewInfo.category);

    setReviews((prevData) => [
      {
        id: newReview.id,
        ...newReview.data(),
        username,
        media,
      },
      ...prevData,
    ]);

    formRef.current.reset();
    navigate("/");
    onClose();
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!globalUser || !mediaId || !textareaRef || rating <= 0) return;

    submitReview();
  }

  async function handleSearch() {
    const data = await searchByName(inputRef?.current?.value, "artist");
    setResults(data?.artists?.items || []);
  }

  function handleClick(media) {
    inputRef.current.value = media.name;
    setMediaId(media.id);
    setMediaImage(media?.images[0].url);
    setResults([]);
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="m-auto flex w-4/5 flex-col items-center justify-center gap-6 py-6"
    >
      <p className="text-3xl font-bold">Add a review</p>
      <div className="flex w-full items-center justify-center gap-6">
        <img
          src={mediaImage || "/images/default-img.jpg"}
          className="h-[175px] w-[175px] shadow-lg"
        />
        <div className="flex h-[150px] flex-col justify-center gap-2">
          <div className="relative">
            <input
              ref={inputRef}
              type="search"
              placeholder="Search for an artist..."
              onKeyUp={handleSearch}
              className="bg-white text-black"
            />
            <div className="absolute top-10 right-0 left-0 flex flex-col bg-green-900">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleClick(result, result.id)}
                  className="px-2 py-1 text-start hover:bg-gray-600"
                >
                  <p>{result.name}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="text-xl">
            <StarRating rating={rating} setRating={setRating} />
          </div>
        </div>
      </div>

      <textarea
        ref={textareaRef}
        placeholder="Write your review..."
        rows="5"
        className="w-full bg-white text-black"
      ></textarea>

      <button
        type="submit"
        className="flex items-center gap-1 rounded-md bg-green-900 p-3 text-2xl hover:text-gray-400"
      >
        <FontAwesomeIcon icon={faPlus} />
        <p>Add Post</p>
      </button>
    </form>
  );
}
