const fs = require('fs');
const multer = require('multer');
const upload = multer({ dest: '/tmp' }); // Vercel allows only /tmp
const translate = require('@vitalets/google-translate-api');

module.exports = (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) return res.status(500).json({ error: 'Upload error' });

    try {
      const { sourceLang, targetLang } = req.body;
      const text = fs.readFileSync(req.file.path, 'utf-8');
      const result = await translate(text, { from: sourceLang, to: targetLang });
      res.status(200).json({ translatedText: result.text });
    } catch (error) {
      res.status(500).json({ error: 'Translation failed', details: error.message });
    }
  });
};
