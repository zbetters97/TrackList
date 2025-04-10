import { useEffect, useState } from "react";
import Loading from "src/components/Loading";
import ProfileCard from "src/components/Cards/ProfileCard";
import { useAuthContext } from "src/context/Auth/AuthContext";

export default function FriendsList(activeTab) {
  const { globalUser, getFollowingById, getFollowersById, getUserById } =
    useAuthContext();

  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState(null);

  useEffect(() => {
    const fetchFriends = async () => {
      if (!globalUser) return;

      setIsLoading(true);

      try {
        const fetchedUsers =
          activeTab === "following"
            ? await getFollowingById(globalUser.uid)
            : await getFollowersById(globalUser.uid);

        const fetchedUsersDetails = await Promise.all(
          fetchedUsers?.map(async (id) => {
            const user = await getUserById(id);
            return {
              id,
              ...user,
            };
          }) || [],
        );

        setUsers(fetchedUsersDetails);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFriends();
  }, [globalUser, activeTab]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="h-screen overflow-y-scroll">
      {users &&
        (users.length > 0 ? (
          <ul className="flex w-full flex-col gap-4">
            {users.map((user) => {
              return <ProfileCard key={user.id} user={user} />;
            })}
          </ul>
        ) : (
          <p className="m-20 text-center text-2xl text-gray-300 italic">
            {activeTab === "following"
              ? "You're not following anyone yet."
              : "You don't have any followers yet."}
          </p>
        ))}
    </div>
  );
}
