import { memo, useEffect, useState } from "react";
import { Tooltip } from "react-tooltip";
import RatingBar from "src/components/Review/RatingBar";
import { ReviewStars } from "src/components/Review/ReviewContent";
import { useReviewContext } from "src/context/Review/ReviewContext";
import { useSpotifyContext } from "src/context/Spotify/SpotifyContext";
import BannerButtons from "./BannerButtons";

function MediaBanner({ media, category }) {
  const { getAvgRating } = useReviewContext();
  const { getMediaLinks } = useSpotifyContext();

  const [rating, setRating] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!media) return;
    fetchRating();
  }, []);

  async function fetchRating() {
    const { avgRating, count } = (await getAvgRating(media.id)) || {};
    setRating({ avgRating, count });

    const fetchedData = getMediaLinks(media);
    setData(fetchedData);
  }

  if (!data) return;

  return (
    <div className="mt-10 mb-20 flex h-64 items-center text-center shadow-md shadow-black/50">
      <SpotifyImage
        image={data.image}
        spotifyURL={media.external_urls.spotify}
      />

      <div className="flex h-full w-fit flex-col items-center justify-between bg-black/40 p-4">
        <Title name={data.title} subtitle={data.subtitle} />

        <div className="flex flex-col gap-4">
          <Rating mediaId={media.id} rating={rating} />
          <BannerButtons
            mediaId={media.id}
            name={data.title}
            category={category}
          />
        </div>
      </div>
    </div>
  );
}

function SpotifyImage({ image, spotifyURL }) {
  const { DEFAULT_IMG } = useSpotifyContext();

  return (
    <div
      onClick={() => window.open(spotifyURL)}
      data-tooltip-id="media-tooltip"
      data-tooltip-content="Open in Spotify"
      className="cursor-pointer shadow-black/50 transition-all duration-300 hover:shadow-xl hover:shadow-black/75"
    >
      <img src={image || DEFAULT_IMG} className="h-64 w-64" />
      <Tooltip id="media-tooltip" place="top" type="dark" effect="float" />
    </div>
  );
}

function Title({ name, subtitle }) {
  return (
    <div className="m-auto flex max-w-150 min-w-80 flex-col items-center gap-1">
      <p className="text-4xl font-bold">{name}</p>
      <p className="text-gray-300">{subtitle}</p>
    </div>
  );
}

function Rating({ mediaId, rating }) {
  return (
    <div className="flex flex-col gap-2">
      <RatingBar mediaId={mediaId} />
      <div className="mt-auto flex items-center justify-center gap-1">
        <p>{rating.avgRating?.toFixed(1) || ""}</p>
        <ReviewStars rating={rating.avgRating || 0} />
        <p>{(rating.avgRating && `(${rating.count})`) || ""}</p>
      </div>
    </div>
  );
}

export default memo(MediaBanner);
