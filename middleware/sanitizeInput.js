// middleware/sanitizeInput.js
const xss = require('xss');

const sanitizeInput = (req, res, next) => {
  // Log bulk upload requests before sanitization
  if (req.path?.includes('bulk-upload')) {
    console.log("🧹 Before sanitization - Body keys:", Object.keys(req.body || {}));
    console.log("🧹 Before sanitization - transactionType:", req.body?.transactionType);
  }
  
  const sanitize = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = xss(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };

  if (req.body) sanitize(req.body);
  if (req.params) sanitize(req.params);
  
  // Log bulk upload requests after sanitization
  if (req.path?.includes('bulk-upload')) {
    console.log("🧹 After sanitization - Body keys:", Object.keys(req.body || {}));
    console.log("🧹 After sanitization - transactionType:", req.body?.transactionType);
  }
  
  next();
};

module.exports = sanitizeInput;
