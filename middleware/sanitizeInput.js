// middleware/sanitizeInput.js
const xss = require('xss');

const sanitizeInput = (req, res, next) => {
  // Log bulk upload requests before sanitization
  if (req.path?.includes('bulk-upload')) {
    console.log("🧹 Before sanitization - Body keys:", Object.keys(req.body || {}));
    console.log("🧹 Before sanitization - transactionType:", req.body?.transactionType);
  }
  
  const isCorruptedObjectId = (val) => {
    return val && typeof val === 'object' && val.buffer && !Array.isArray(val.buffer);
  };

  const sanitize = (obj) => {
    if (!obj || typeof obj !== 'object') return;

    // Handle arrays
    if (Array.isArray(obj)) {
      obj.forEach(item => sanitize(item));
      return;
    }

    const protectedFields = ['createdAt', 'updatedAt', '__v'];
    
    for (const key in obj) {
      if (protectedFields.includes(key)) {
        console.log(`🧹 STRIPPING PROTECTED FIELD: ${key}`);
        delete obj[key];
        continue;
      }

      const val = obj[key];

      // Detect and strip corrupted ObjectId objects { buffer: { ... } }
      if (key === '_id' && isCorruptedObjectId(val)) {
        console.log(`🧹 STRIPPING CORRUPTED _id:`, JSON.stringify(val).substring(0, 100));
        delete obj[key];
        continue;
      }

      if (typeof val === 'string') {
        // ✅ Allow 'style' attribute for rich text fields (e.g. colors, alignment)
        obj[key] = xss(val, {
          whiteList: {
            ...xss.whiteList,
            span: ['style'],
            p: ['style'],
            div: ['style'],
            li: ['style'],
            ul: ['style'],
            ol: ['style'],
            h1: ['style'],
            h2: ['style'],
            h3: ['style'],
            h4: ['style'],
            h5: ['style'],
            h6: ['style'],
            a: ['href', 'title', 'target', 'style', 'rel'],
            img: ['src', 'alt', 'title', 'width', 'height', 'style'],
            blockquote: ['style'],
            pre: ['style'],
            code: ['style'],
          }
        });
      } else if (typeof val === 'object' && val !== null) {
        sanitize(val);
      }
    }
  };

  if (req.body) {
    sanitize(req.body);
  }
  if (req.params) sanitize(req.params);
  
  // Log bulk upload requests after sanitization
  if (req.path?.includes('bulk-upload')) {
    console.log("🧹 After sanitization - Body keys:", Object.keys(req.body || {}));
    console.log("🧹 After sanitization - transactionType:", req.body?.transactionType);
  }
  
  next();
};

module.exports = sanitizeInput;
