import React from "react";

const BannerStats = ({ banners }) => {
  const stats = {
    total: banners.length,
    active: banners.filter(b => b.isActive).length,
    highPriority: banners.filter(b => b.priority >= 8).length,
  };

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-card p-4 rounded-xl border dark:border-gray-700 shadow-sm">
        <div className="text-2xl font-bold text-foreground">
          {stats.total}
        </div>
        <div className="text-sm text-muted-foreground">Total Banners</div>
      </div>
      <div className="bg-card p-4 rounded-xl border dark:border-gray-700 shadow-sm">
        <div className="text-2xl font-bold text-green-600 dark:text-green-500">
          {stats.active}
        </div>
        <div className="text-sm text-muted-foreground">Active</div>
      </div>
      <div className="bg-card p-4 rounded-xl border dark:border-gray-700 shadow-sm">
        <div className="text-2xl font-bold text-primary dark:text-blue-500">
          {stats.highPriority}
        </div>
        <div className="text-sm text-muted-foreground">High Priority</div>
      </div>
    </div>
  );
};

export default BannerStats;