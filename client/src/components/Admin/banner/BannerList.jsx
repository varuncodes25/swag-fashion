import React from "react";
import { ImageIcon } from "lucide-react";
import BannerCard from "./BannerCard";

const BannerList = ({
  banners,
  onEdit,
  onDelete,
  onToggleActive,
  onUpdatePriority,
  loading,
}) => {
  if (loading && banners.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block w-8 h-8 border-4 border-primary dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-2 text-muted-foreground">Loading banners...</p>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
          <ImageIcon size={32} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          No banners yet
        </h3>
        <p className="text-muted-foreground mb-4">
          Create your first banner to display on homepage
        </p>
      </div>
    );
  }

  const sortedBanners = [...banners].sort((a, b) => b.priority - a.priority);

  return (
    <div className="bg-card rounded-xl border dark:border-gray-700 shadow-sm">
      <div className="p-6 border-b dark:border-gray-700">
        <h2 className="text-xl font-semibold text-foreground">
          All Banners ({banners.length})
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Drag to reorder (priority), click to edit
        </p>
      </div>

      <div className="divide-y dark:divide-gray-700">
        {sortedBanners.map((banner, index) => (
          <BannerCard
            key={banner._id}
            banner={banner}
            index={index}
            total={banners.length}
            onEdit={() => onEdit(banner)}
            onDelete={() => onDelete(banner._id)}
            onToggleActive={() => onToggleActive(banner._id, banner.isActive)}
            onIncreasePriority={() => onUpdatePriority(banner._id, banner.priority + 1)}
            onDecreasePriority={() => onUpdatePriority(banner._id, banner.priority - 1)}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerList;