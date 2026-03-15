const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
 
  return (
    <div className="flex gap-2 flex-wrap justify-center">
      {/* PREV */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-1 border rounded disabled:opacity-40"
      >
        Prev
      </button>

      {/* PAGE NUMBERS */}
      {Array.from({ length: totalPages }, (_, i) => {
  const pageNo = i + 1;

  // 🔍 DEBUG: render ho raha hai ya nahi

  return (
    <button
      key={pageNo}
      onClick={() => {
        // 🔥 DEBUG: click ho raha hai ya nahi
      
        onPageChange(pageNo);
      }}
      className={`px-3 py-1 border rounded
        ${
          page === pageNo
            ? "bg-black text-white"
            : "hover:bg-gray-100"
        }`}
    >
      {pageNo}
    </button>
  );
})}


      {/* NEXT */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-1 border rounded disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
