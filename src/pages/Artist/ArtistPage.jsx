import { useEffect, useState } from "react";
import { getPalette } from "react-palette";
import { Outlet, useParams } from "react-router-dom";
import Loading from "src/components/Loading";
import { useReviewContext } from "src/context/Review/ReviewContext";
import { useSpotifyContext } from "src/context/Spotify/SpotifyContext";
import MediaReviews from "./MediaReviews";
import ArtistNavigation from "./ArtistNavigation";

export default function ArtistPage() {
  const { getArtistById, getAlbumById, getTrackById } = useSpotifyContext();
  const { getReviewsByMediaId } = useReviewContext();

  const [colors, setColors] = useState({
    light: "#ffffff",
    dark: "#000000",
    text: "#000000",
  });
  const [palette, setPalette] = useState([]);

  const params = useParams();
  const [media, setMedia] = useState({});
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const artistId = params.artistId;
        const albumId = params.albumId;
        const trackId = params.trackId;

        const mediaId = trackId || albumId || artistId;
        const category = trackId ? "track" : albumId ? "album" : "artist";

        const fetchedMedia = await Promise.all([
          artistId && getArtistById(artistId),
          albumId && getAlbumById(albumId),
          trackId && getTrackById(trackId),
        ]);

        setMedia({
          id: mediaId,
          category,
          artist: fetchedMedia[0] || null,
          album: fetchedMedia[1] || null,
          track: fetchedMedia[2] || null,
        });

        const imageURL =
          fetchedMedia[1]?.images[0].url || fetchedMedia[0].images[0].url;

        const palette = await getPalette(imageURL);
        const colors = Object.keys(palette).map((key) => {
          return {
            name: key,
            color: palette[key],
          };
        });

        setPalette(colors);
        setColors({
          light: palette.vibrant,
          dark: palette.darkMuted,
          text: palette.lightMuted,
        });

        const fetchedReviews = await getReviewsByMediaId(mediaId);
        setReviews(
          [...fetchedReviews].sort((a, b) => b.createdAt - a.createdAt),
        );
      } catch (error) {
        console.log(error);
      }
    };

    fetchMedia();
  }, [params]);

  if (!media.id) {
    return <Loading />;
  }

  return (
    <div className="mx-10 mt-6 flex flex-col gap-2">
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `linear-gradient(to bottom left, ${colors.light}, ${colors.dark})`,
          filter: "blur(100px)",
          zIndex: -1,
        }}
      />

      <ArtistNavigation
        media={media}
        category={media.category}
        color={colors.text}
      />

      {/*
      <div className="flex gap-2">
        {palette &&
          palette.map((color) => {
            return (
              <div
                key={color.name}
                style={{
                  backgroundColor: color.color,
                  padding: 5,
                  height: 50,
                }}
              >
                {color.name}
              </div>
            );
          })}
      </div> */}

      <div className="flex gap-8">
        <Outlet context={media} />

        <MediaReviews
          key={media.id}
          mediaId={media.id}
          reviews={reviews}
          category={media.category}
        />
      </div>
    </div>
  );
}
