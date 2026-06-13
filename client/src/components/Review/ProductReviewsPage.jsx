import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import ReviewsComponent from "@/components/custom/ReviewsComponent";

const ProductReviewsPage = () => {
  const { productId } = useParams();

  if (!productId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Product not found.</p>
        <Link to="/" className="text-primary underline">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 dark:bg-card">
      <div className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                to={`/product/${productId}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to Product
              </Link>

              <Link
                to="/"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <Home className="h-5 w-5" />
                Home
              </Link>
            </div>

            <h1 className="text-xl font-bold text-foreground">Product Reviews</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ReviewsComponent productId={productId} fullPage />
      </div>
    </div>
  );
};

export default ProductReviewsPage;
