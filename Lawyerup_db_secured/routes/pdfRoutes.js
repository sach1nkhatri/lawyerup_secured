const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const PdfModel = require('../models/pdf');

// 📁 Ensure uploads/pdf exists
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const pdfPath = path.join(__dirname, '../uploads/pdf');
    if (!fs.existsSync(pdfPath)) fs.mkdirSync(pdfPath, { recursive: true });
    cb(null, pdfPath);
  },
  filename: (req, file, cb) => {
    const ext = '.pdf'; // always save as .pdf
    const uniqueName = `${Date.now()}-${file.fieldname}${ext}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') cb(null, true);
  else cb(new Error('Only PDF files are allowed'));
};

const upload = multer({ storage, fileFilter });

// 📤 Upload PDF
router.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    const { title } = req.body;
    const filePath = `/uploads/pdf/${req.file.filename}`;

    const pdfDoc = new PdfModel({ title, url: filePath });
    await pdfDoc.save();

    res.status(201).json({ message: 'PDF uploaded successfully', pdf: pdfDoc });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'PDF upload failed', details: err.message });
  }
});

// 📚 Get All PDFs
router.get('/', async (req, res) => {
  try {
    const pdfs = await PdfModel.find().sort({ uploadedAt: -1 });
    res.json(pdfs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch PDFs' });
  }
});

// ❌ Delete PDF (DB + File)
router.delete('/:id', async (req, res) => {
  try {
    const pdf = await PdfModel.findById(req.params.id);
    if (!pdf) return res.status(404).json({ error: 'PDF not found' });

    const filePath = path.join(__dirname, '../..', pdf.url); // actual path on disk
    console.log('Deleting file:', filePath);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await PdfModel.findByIdAndDelete(req.params.id);
    res.json({ message: 'PDF deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete PDF', details: err.message });
  }
});

module.exports = router;
