// backend/routes/returnsRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// --- Multer Configuration ---
const storage = multer.diskStorage({
  destination(req, file, cb) { cb(null, 'uploads/'); },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (extname && mimetype) { return cb(null, true); } 
  else { cb('Error: Images Only!'); }
}
const upload = multer({ storage, fileFilter: function (req, file, cb) { checkFileType(file, cb); } });


// --- Controller Functions ---
const {
  lookupOrder,
  createReturnRequest,
  getReturnRequests,
  approveReturnRequest,
  rejectReturnRequest, // <-- IMPORT THE NEW FUNCTION
} = require('../controllers/returnsController');

// --- Public Customer Routes ---
router.post('/lookup', lookupOrder);
router.post('/create', upload.single('image'), createReturnRequest);

// --- Admin Dashboard Routes ---
router.get('/admin/requests', getReturnRequests);
router.post('/admin/requests/:id/approve', approveReturnRequest);
router.post('/admin/requests/:id/reject', rejectReturnRequest); // <-- ADD THIS NEW ROUTE

module.exports = router;
