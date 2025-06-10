// backend/app.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
require('dotenv').config();

const translateRoute = require('./routes/translate');
const pdfToWordRoute = require('./routes/pdfToWord');
const splitPdfRoute = require('./routes/splitPdf');
const pdfToJpgRoute = require('./routes/pdfToJpg');
const compressImageRoute = require('./routes/compressImage');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/outputs', express.static('outputs'));

// Routes
app.use('/translate', translateRoute);
app.use('/pdf-to-word', pdfToWordRoute);
app.use('/split-pdf', splitPdfRoute);
app.use('/pdf-to-jpg', pdfToJpgRoute);
app.use('/compress-image', compressImageRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// --- routes/translate.js ---
const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const translate = require('@vitalets/google-translate-api');

const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { sourceLang, targetLang } = req.body;
    const filePath = req.file.path;
    const text = fs.readFileSync(filePath, 'utf-8');

    const result = await translate(text, { from: sourceLang, to: targetLang });

    const outputPath = path.join('outputs', `translated-${Date.now()}.txt`);
    fs.writeFileSync(outputPath, result.text);

    res.json({ downloadUrl: `/${outputPath}` });
  } catch (error) {
    res.status(500).json({ error: 'Translation failed.' });
  }
});

module.exports = router;

// --- routes/pdfToWord.js ---
const express2 = require('express');
const router2 = express2.Router();
const multer2 = require('multer');
const path2 = require('path');
const fs2 = require('fs-extra');

const upload2 = multer2({ dest: 'uploads/' });

router2.post('/', upload2.single('file'), (req, res) => {
  try {
    const inputPath = req.file.path;
    const outputPath = path2.join('outputs', `converted-${Date.now()}.docx`);

    // Dummy logic: copy same file (replace with actual PDF-to-Word logic)
    fs2.copySync(inputPath, outputPath);

    res.json({ downloadUrl: `/${outputPath}` });
  } catch (error) {
    res.status(500).json({ error: 'PDF to Word failed.' });
  }
});

module.exports = router2;

// --- routes/splitPdf.js ---
const express3 = require('express');
const router3 = express3.Router();
const multer3 = require('multer');
const fs3 = require('fs-extra');
const { PDFDocument } = require('pdf-lib');
const path3 = require('path');

const upload3 = multer3({ dest: 'uploads/' });

router3.post('/', upload3.single('file'), async (req, res) => {
  try {
    const pdfBytes = fs3.readFileSync(req.file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const pages = pdfDoc.getPages();
    const splitPaths = [];

    for (let i = 0; i < pages.length; i++) {
      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
      newPdf.addPage(copiedPage);
      const newBytes = await newPdf.save();
      const outputPath = path3.join('outputs', `page-${i + 1}-${Date.now()}.pdf`);
      fs3.writeFileSync(outputPath, newBytes);
      splitPaths.push(`/${outputPath}`);
    }

    res.json({ files: splitPaths });
  } catch (error) {
    res.status(500).json({ error: 'PDF split failed.' });
  }
});

module.exports = router3;

// --- routes/pdfToJpg.js ---
const express4 = require('express');
const router4 = express4.Router();
const multer4 = require('multer');
const fs4 = require('fs');
const { fromPath } = require('pdf2pic');
const path4 = require('path');

const upload4 = multer4({ dest: 'uploads/' });

router4.post('/', upload4.single('file'), async (req, res) => {
  const inputPath = req.file.path;
  const outputDir = 'outputs';

  const options = {
    density: 100,
    saveFilename: `output-${Date.now()}`,
    savePath: outputDir,
    format: 'jpg',
    width: 600,
    height: 800,
  };

  try {
    const convert = fromPath(inputPath, options);
    const result = await convert.bulk(-1);
    const filePaths = result.map(r => `/${r.path}`);
    res.json({ images: filePaths });
  } catch (error) {
    res.status(500).json({ error: 'PDF to JPG conversion failed.' });
  }
});

module.exports = router4;

// --- routes/compressImage.js ---
const express5 = require('express');
const router5 = express5.Router();
const multer5 = require('multer');
const path5 = require('path');
const sharp = require('sharp');
const fs5 = require('fs-extra');

const upload5 = multer5({ dest: 'uploads/' });

router5.post('/', upload5.single('file'), async (req, res) => {
  try {
    const inputPath = req.file.path;
    const outputPath = path5.join('outputs', `compressed-${Date.now()}.jpg`);

    await sharp(inputPath)
      .resize(800)
      .jpeg({ quality: 30 })
      .toFile(outputPath);

    res.json({ downloadUrl: `/${outputPath}` });
  } catch (error) {
    res.status(500).json({ error: 'Image compression failed.' });
  }
});

module.exports = router5;
