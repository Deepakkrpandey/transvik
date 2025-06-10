import fs from 'fs';
import path from 'path';
import { IncomingForm } from 'formidable';
import { promises as fsPromises } from 'fs';
import translate from '@vitalets/google-translate-api';

export const config = {
  api: {
    bodyParser: false, 
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new IncomingForm({ uploadDir: '/tmp', keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error parsing form data' });
    }

    try {
      const file = files.file;
      const filePath = file.filepath; // NOTE: `filepath` for formidable v3
      const text = await fsPromises.readFile(filePath, 'utf-8');

      const sourceLang = fields.sourceLang || 'auto';
      const targetLang = fields.targetLang || 'en';

      const result = await translate(text, {
        from: sourceLang,
        to: targetLang,
      });

      res.status(200).json({ translatedText: result.text });
    } catch (e) {
      res.status(500).json({ error: 'Translation failed', details: e.message });
    }
  });
}
