import { formatDateMDYLong } from "../../utils/date";
import { useSpotifyContext } from "../../context/Spotify/SpotifyContext";

export default function AlbumCard({ album }) {
  const { getAlbumTracks } = useSpotifyContext();

  async function getTracks() {
    const tracks = await getAlbumTracks(album.id);
    console.log(tracks);
  }

  return (
    <div
      onClick={getTracks}
      className="flex min-h-[400px] w-[300px] cursor-pointer flex-col justify-between bg-white p-2 text-black transition-all duration-200 hover:scale-110"
    >
      <div className="flex grow-1 flex-col justify-between gap-2 py-2 text-center">
        <p className="text-xl font-bold">{album.name}</p>
        <p className="text-sm font-light">
          {formatDateMDYLong(album.release_date)}
        </p>
      </div>
      <img src={album.images[0].url} className="h-[300px] w-[300px]" />
    </div>
  );
}
