import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "src/components/Loading";
import BackButton from "src/components/Buttons/BackButton";
import { useReviewContext } from "src/context/Review/ReviewContext";
import { ReviewButtons } from "src/components/Review/ReviewContent";
import CommentList from "./components/CommentList";
import MediaDetails from "./components/MediaDetails";
import ReviewDetails from "./components/ReviewDetails";

export default function ReviewPage() {
  const params = useParams();
  const reviewId = params?.reviewId;

  const navigate = useNavigate();

  const { getReviewById } = useReviewContext();

  const [isLoading, setIsLoading] = useState(true);
  const [review, setReview] = useState({});

  useEffect(() => {
    const fetchReview = async () => {
      setIsLoading(true);

      try {
        const fetchedReview = await getReviewById(reviewId);
        setReview(fetchedReview);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReview();
  }, []);

  if (isLoading) return <Loading />;

  if (!review) {
    navigate("/404");
  }

  return (
    <div className="m-auto mt-6 flex h-full w-3/5 flex-col gap-6">
      <BackButton />
      <Review review={review} />
      <CommentList review={review} />
    </div>
  );
}

function Review({ review }) {
  return (
    <div className="flex w-full items-center gap-2 border-b-1 border-white pb-4">
      <MediaDetails review={review} />

      <div className="flex h-full w-full flex-col justify-between overflow-auto">
        <ReviewDetails review={review} />
        <ReviewButtons review={review} onPage={true} />
      </div>
    </div>
  );
}
