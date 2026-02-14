// utils/handlar/AsyncHandler.js - ISSE BADLO:

// ❌ YE NAMED EXPORT HAI
// module.exports.AsyncHandler = (fn) => (req, res, next) => {
//   Promise.resolve(fn(req, res, next)).catch(next);
// };

// ✅ YEH DEFAULT EXPORT KARO
const AsyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = AsyncHandler;  // ✅ DEFAULT EXPORT