import React from "react";
import { useSelector } from "react-redux";
import { Package } from "lucide-react";

const Items = () => {
  const { items = [] } = useSelector((s) => s.checkout);

  if (!items.length) {
    return (
      <div className="text-center py-6 px-4">
        <div className="text-gray-400 dark:text-gray-600 text-sm">
          No items in cart
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Package className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">
          Items ({items.length})
        </span>
      </div>

      {items.map((item) => (
  <div
    key={item.productId}
    className="flex items-center justify-between p-3 bg-card border border-border rounded-lg"
  >
    <div className="flex items-center gap-3">
      <img
        src={item.image}
        alt={item.name}
        className="w-14 h-14 object-cover rounded-lg border border-gray-100 dark:border-gray-700"
      />
      <div>
        <p className="text-sm font-medium text-foreground truncate max-w-[140px]">
          {item.name}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-muted-foreground">
            Qty: {item.quantity}
          </span>

          {item.discountPercent > 0 && (
            <span className="text-xs font-medium text-success">
              {item.discountPercent}% OFF
            </span>
          )}
        </div>
      </div>
    </div>

    <div className="text-right">
      <p className="text-sm font-semibold text-foreground">
        ₹{item.lineTotal.toFixed(2)}
      </p>

      {item.discountAmount > 0 && (
        <p className="text-xs text-muted-foreground line-through">
          ₹{(item.price * item.quantity).toFixed(2)}
        </p>
      )}
    </div>
  </div>
))}

    </div>
  );
};

export default Items;