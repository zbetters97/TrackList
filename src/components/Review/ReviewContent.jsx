import { Link } from "react-router-dom";
import { getTimeSince } from "src/utils/date";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";
import { useAuthContext } from "src/context/Auth/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useReviewContext } from "src/context/Review/ReviewContext";
import { useCommentContext } from "src/context/Comment/CommentContext";
import { faComment, faUserCircle } from "@fortawesome/free-solid-svg-icons";
import VoteButton from "../Buttons/VoteButton";
import DeleteButton from "../Buttons/DeleteButton";

function ReviewUser({ review, showIcon = true }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex cursor-pointer items-center gap-1 hover:text-gray-400">
        {showIcon && <FontAwesomeIcon icon={faUserCircle} />}
        <Link
          to={`/users/${review.userId}`}
          className="font-semibold hover:text-gray-300"
        >
          {review.username}
        </Link>
      </div>
      <p className="text-sm font-light text-gray-400">
        {getTimeSince(review.createdAt.toDate())}
      </p>
    </div>
  );
}

function ReviewMediaTitle({ titleLink, subtitleLink, title, subtitle }) {
  return (
    <div className="flex flex-col">
      <Link to={titleLink} className="text-2xl font-bold hover:text-gray-400">
        {title}
      </Link>
      <Link to={subtitleLink} className="font-light hover:text-gray-400">
        {subtitle}
      </Link>
    </div>
  );
}

function ReviewStars({ rating = 0, size = 20 }) {
  rating = Math.round(rating * 2) / 2;

  function getStarColor(ratingValue) {
    return ratingValue <= rating ? "#ffc107" : "#e4e5e9";
  }

  return (
    <div className="flex flex-row gap-1">
      {[...Array(5)].map((_, i) => {
        const ratingValue = i + 1;
        const isHalf = rating === ratingValue - 0.5;

        return (
          <span key={i}>
            {isHalf ? (
              <FaStarHalfAlt size={size} color="#ffc107" />
            ) : (
              <FaStar size={size} color={getStarColor(ratingValue)} />
            )}
          </span>
        );
      })}
    </div>
  );
}

function ReviewContent({ review, showComment = true }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-lg">{review.content}</p>
      <ReviewButtons review={review} showComment={showComment} />
    </div>
  );
}

function ReviewButtons({ review, showComment = true }) {
  const { globalUser, globalData, likeContent, unlikeContent } =
    useAuthContext();
  const { deleteComment } = useCommentContext();
  const {
    updateReviewState,
    likeReview,
    dislikeReview,
    setReviews,
    getReviews,
    deleteReview,
  } = useReviewContext();

  async function handleLike(reviewId, userId) {
    if (!globalData) return;

    await likeReview(reviewId, userId);

    if (globalData.likes.find((like) => like.contentId === reviewId)) {
      await unlikeContent(reviewId, userId);
    } else {
      await likeContent(reviewId, "reviews", userId);
    }
  }

  async function handleDislike(reviewId, userId) {
    if (!globalData) return;

    await dislikeReview(reviewId, userId);

    if (globalData.likes.find((like) => like.contentId === reviewId)) {
      await unlikeContent(reviewId, userId);
    }
  }

  async function handleDelete() {
    const comments = review.comments;

    if (!review.id) return;

    // Delete each comment from comments db
    if (comments.length > 0) {
      await Promise.all(
        comments.map(async (comment) => {
          await deleteComment(comment);
        }),
      );
    }

    // Delete review
    await deleteReview(review.id);

    // Fetch updated review from Firestore
    const reviewData = await getReviews();

    // Filter out any reviews from useState not found in Firestore state
    setReviews((prevReviews) =>
      prevReviews.filter((r) =>
        reviewData.some((review) => review.id === r.id),
      ),
    );

    window.location.reload();
  }

  return (
    <div className="ml-1 flex items-center gap-4">
      <div className="flex items-center">
        <VoteButton
          content={review}
          type="like"
          handleContent={handleLike}
          updateContent={updateReviewState}
        />
        <VoteButton
          content={review}
          type="dislike"
          handleContent={handleDislike}
          updateContent={updateReviewState}
        />
      </div>

      {showComment && (
        <Link
          to={`/reviews/${review.id}`}
          className="flex items-center gap-1 transition-colors duration-150 hover:text-gray-400"
        >
          <FontAwesomeIcon icon={faComment} />
          <p>{review?.comments.length || 0}</p>
        </Link>
      )}

      {globalUser && globalUser.uid === review.userId && (
        <DeleteButton type="review" deleteContent={handleDelete} />
      )}
    </div>
  );
}

export {
  ReviewUser,
  ReviewMediaTitle,
  ReviewStars,
  ReviewContent,
  ReviewButtons,
};
