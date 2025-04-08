import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CSS } from "@dnd-kit/utilities";
import Loading from "src/components/Loading";
import { closestCenter, DndContext } from "@dnd-kit/core";
import { useAuthContext } from "src/context/Auth/AuthContext";
import { useListContext } from "src/context/List/ListContext";
import MediaListCard from "src/components/Cards/MediaListCard";
import { useSpotifyContext } from "src/context/Spotify/SpotifyContext";
import {
  arrayMove,
  rectSwappingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faCircleMinus,
  faMinus,
  faPen,
  faX,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

export default function AccountList() {
  const { globalUser } = useAuthContext();
  const { getListById } = useListContext();
  const { defaultImg, getMediaById } = useSpotifyContext();

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [list, setList] = useState(null);
  const [mediaList, setMediaList] = useState({
    link: "",
    image: defaultImg,
  });

  const params = useParams();
  const listId = params?.listId;

  useEffect(() => {
    if (!globalUser || !listId) return;

    const fetchData = async () => {
      setIsLoading(true);

      try {
        const fetchedList = await getListById(listId, globalUser.uid);
        setList(fetchedList);

        const mediaData = await Promise.all(
          fetchedList.media.map(async (media) => {
            const fetchedMedia = await getMediaById(media.id, media.category);
            const artist = fetchedMedia.artists?.[0] || fetchedMedia || {};
            const artistURL = `/artists/${artist?.id}`;

            return {
              id: fetchedMedia.id,
              category: media.category,
              title: fetchedMedia.name,
              subtitle:
                fetchedMedia.type === "track" ? "song" : fetchedMedia.type,
              link:
                fetchedMedia.type === "artist"
                  ? artistURL
                  : fetchedMedia.type === "album"
                    ? `${artistURL}/albums/${fetchedMedia.id}`
                    : `${artistURL}/albums/${fetchedMedia.album?.id}/tracks/${fetchedMedia.id}`,
              image:
                fetchedMedia.images?.[0]?.url ||
                fetchedMedia.album?.images?.[0]?.url ||
                defaultImg,
            };
          }),
        );

        setMediaList(mediaData);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [globalUser, listId]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <ListHeader
        listId={list.id}
        mediaList={mediaList}
        name={list.name}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        tags={list.tags}
      />
      <div className="overflow-y-scroll border-t-1 border-white py-10">
        {list && (
          <MediaList
            listId={list.id}
            mediaList={mediaList}
            setMediaList={setMediaList}
            isEditing={isEditing}
            isRanking={list.isRanking}
          />
        )}
      </div>
    </div>
  );
}

function ListHeader({
  listId,
  mediaList,
  name,
  isEditing,
  setIsEditing,
  tags,
}) {
  const { globalUser } = useAuthContext();
  const { reorderListItems } = useListContext();

  async function reorderList() {
    const newOrder = mediaList.map((item) => {
      return {
        category: item.category,
        id: item.id,
      };
    });

    await reorderListItems(globalUser.uid, listId, newOrder);
  }

  async function handleClick() {
    if (isEditing) await reorderList();

    setIsEditing(!isEditing);
  }

  return (
    <div className="flex items-center justify-between align-middle">
      <div className="flex items-center gap-4">
        <p className="text-2xl text-white">{name}</p>

        <button
          onClick={handleClick}
          className="flex items-center gap-2 rounded-md bg-green-700 px-3 py-1 hover:text-gray-400"
        >
          <FontAwesomeIcon icon={isEditing ? faCheck : faPen} />
          {isEditing ? "Done" : "Edit"}
        </button>
      </div>

      <div className="flex gap-2">
        {tags.map((tag, index) => {
          return (
            <p key={index} className="rounded-sm bg-gray-600 p-2">
              {tag}
            </p>
          );
        })}
      </div>
    </div>
  );
}

function MediaList({ mediaList, setMediaList, listId, isEditing, isRanking }) {
  return (
    <div className="flex flex-wrap gap-6">
      {mediaList?.length > 0 ? (
        isEditing ? (
          <DraggableList
            listId={listId}
            listItems={mediaList}
            setListItems={setMediaList}
            isRanking={isRanking}
          />
        ) : (
          mediaList.map((item, index) => (
            <Link key={item.id} to={item.link} className="w-48">
              <MediaListCard
                title={item.title}
                subtitle={item.subtitle}
                image={item.image}
                index={isRanking && index + 1}
              />
            </Link>
          ))
        )
      ) : (
        <p className="m-20 text-center text-2xl text-gray-300 italic">
          {`This list is empty.`}
        </p>
      )}
    </div>
  );
}

function DraggableList({ listId, listItems, setListItems, isRanking }) {
  const { globalUser } = useAuthContext();
  const { deleteListItem } = useListContext();

  function handleDragEnd(event) {
    const { active, over } = event;
    if (active.id === over.id) return;

    setListItems((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  }

  async function handleDelete(itemId) {
    await deleteListItem(globalUser.uid, listId, itemId);

    setListItems(
      listItems.filter((item) => {
        return item.id !== itemId;
      }),
    );
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={listItems} strategy={rectSwappingStrategy}>
        {listItems.map((item, index) => (
          <div key={item.id} className="flex flex-col items-center gap-2">
            <button
              onClick={() => handleDelete(item.id)}
              className="flex w-fit items-center gap-1 rounded-sm bg-gray-600 px-2 py-1 text-sm font-bold hover:bg-gray-800"
            >
              <FontAwesomeIcon icon={faXmark} />
              <p>Remove</p>
            </button>

            <SortableItem item={item} index={index} isRanking={isRanking} />
          </div>
        ))}
      </SortableContext>
    </DndContext>
  );
}

function SortableItem({ item, isRanking, index }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transition,
    cursor: "grab",
    opacity: isDragging ? 1 : 0.5,
    transform: CSS.Transform.toString(transform),
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <MediaListCard
        title={item.title}
        subtitle={item.subtitle}
        image={item.image}
        index={isRanking && index + 1}
      />
    </div>
  );
}
