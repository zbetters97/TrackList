import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuthContext } from "../context/Auth/AuthContext";

export function useComment() {
  const { getUserById } = useAuthContext();

  async function getCommentsByReviewId(reviewId) {
    try {
      const reviewRef = doc(db, "reviews", reviewId);
      const reviewDoc = await getDoc(reviewRef);

      if (!reviewDoc.exists() || reviewDoc.data().comments.length === 0) return;

      const comments = await Promise.all(
        reviewDoc.data().comments.map(async (doc) => {
          const comment = await getCommentById(doc);
          if (!comment) return null;
          const username = (await getUserById(comment?.userId))?.username;
          return {
            id: doc,
            ...comment,
            username,
          };
        }),
      );

      // Sort comments by date descending, returns empty array if none found
      const sortedComments = comments?.filter(Boolean).sort((a, b) => {
        return b.createdAt - a.createdAt;
      });

      return sortedComments || [];
    } catch (error) {
      console.error(error);
    }
  }

  async function getCommentById(commentId) {
    const commentRef = doc(db, "comments", commentId);
    const commentDoc = await getDoc(commentRef);

    return commentDoc.data();
  }

  async function addComment(commentInfo, reviewId) {
    try {
      const comment = { ...commentInfo, reviewId, createdAt: new Date() };
      const commentRef = collection(db, "comments");

      const commentDoc = await addDoc(commentRef, comment);
      const newComment = await getDoc(commentDoc);

      const reviewRef = doc(db, "reviews", reviewId);
      await updateDoc(reviewRef, {
        comments: arrayUnion(newComment.id),
      });
    } catch (error) {
      console.error(error.message);
    }
  }

  async function deleteComment(commentId, reviewId) {
    try {
      const commentRef = doc(db, "comments", commentId);
      const commentDoc = await getDoc(commentRef);

      if (!commentDoc.exists()) return;

      // Delete from Firestore
      await deleteDoc(commentRef);

      const reviewRef = doc(db, "reviews", reviewId);
      const reviewDoc = await getDoc(reviewRef);

      if (!reviewDoc.exists()) return;

      await updateDoc(reviewRef, {
        comments: arrayRemove(commentId),
      });
    } catch (error) {
      console.error(error.message);
    }
  }

  async function likeComment(commentId, uid) {
    try {
      const commentRef = doc(db, "comments", commentId);
      const commentDoc = await getDoc(commentRef);

      if (commentDoc.exists()) {
        const likes = commentDoc.data().likes;
        const dislikes = commentDoc.data().dislikes;

        // User already liked comment, remove like
        if (likes.includes(uid)) {
          await updateDoc(commentRef, {
            likes: arrayRemove(uid),
          });
        } else {
          // User disliked comment, remove dislike
          if (dislikes.includes(uid)) {
            await updateDoc(commentRef, {
              dislikes: arrayRemove(uid),
            });
          }

          // Add user ID to likes array
          await updateDoc(commentRef, {
            likes: arrayUnion(uid),
          });
        }

        return (await getDoc(commentRef)).data();
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  async function dislikeComment(commentId, uid) {
    try {
      const commentRef = doc(db, "comments", commentId);
      const commentDoc = await getDoc(commentRef);

      if (commentDoc.exists()) {
        const dislikes = commentDoc.data().dislikes;
        const likes = commentDoc.data().likes;

        // User already disliked comment, remove dislike
        if (dislikes.includes(uid)) {
          await updateDoc(commentRef, {
            dislikes: arrayRemove(uid),
          });
        } else {
          // User liked comment, remove like
          if (likes.includes(uid)) {
            await updateDoc(commentRef, {
              likes: arrayRemove(uid),
            });
          }

          // Add user ID to dislikes array
          await updateDoc(commentRef, {
            dislikes: arrayUnion(uid),
          });
        }

        return (await getDoc(commentRef)).data();
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  return {
    getCommentsByReviewId,
    getCommentById,
    addComment,
    deleteComment,
    likeComment,
    dislikeComment,
  };
}
