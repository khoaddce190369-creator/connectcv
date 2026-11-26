const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');
const https = require('https');

const audioCache = new Map();
const MAX_CACHE_ENTRIES = 200;
const EDGE_TTS_TIMEOUT_MS = 3500;
const GOOGLE_TTS_TIMEOUT_MS = 3500;
const EDGE_COOLDOWN_MS = 300000;
let edgeCooldownUntil = 0;

function cleanTextForSpeech(text) {
  if (!text) return '';
  return text
    .replace(/[*_~`#>]/g, '')
    .replace(/\[(?:S|T|A|R)\]/g, ' ')
    .replace(/[\[\]()]/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getGoogleTTSChunk(text) {
  return new Promise((resolve, reject) => {
    const url = 'https://translate.google.com/translate_tts?ie=UTF-8&q=' + encodeURIComponent(text) + '&tl=vi&client=tw-ob';
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error('Google TTS status: ' + res.statusCode));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.setTimeout(GOOGLE_TTS_TIMEOUT_MS, () => {
      req.destroy();
      reject(new Error('Google TTS timeout'));
    });
  });
}

async function generateGoogleTTSFallback(text) {
  const sentences = text.match(/[^.!?]+[.!?]+|\S+/g) || [text];
  const parts = [];
  let current = '';
  for (const s of sentences) {
    if ((current + ' ' + s).length > 160) {
      if (current) parts.push(current.trim());
      current = s;
    } else {
      current = current ? current + ' ' + s : s;
    }
  }
  if (current) parts.push(current.trim());

  const audioBuffers = await Promise.all(parts.map(p => getGoogleTTSChunk(p)));
  return Buffer.concat(audioBuffers);
}

function fetchEdgeTTS(cleaned, voiceName, timeoutMs = EDGE_TTS_TIMEOUT_MS) {
  return new Promise(async (resolve, reject) => {
    let settled = false;
    let streamRef = null;
    const chunks = [];

    const finish = (err, buffer) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (streamRef) {
        try { streamRef.destroy(); } catch (e) {}
      }
      if (err) return reject(err);
      resolve(buffer);
    };

    const timer = setTimeout(() => {
      const partial = chunks.length > 0 ? Buffer.concat(chunks) : null;
      if (partial && partial.length > 1000) {
        return finish(null, partial);
      }
      finish(new Error('Edge TTS timeout'));
    }, timeoutMs);

    try {
      const tts = new MsEdgeTTS();
      await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
      if (settled) return;
      const { audioStream } = tts.toStream(cleaned);
      streamRef = audioStream;

      audioStream.on('data', (chunk) => {
        if (!settled) chunks.push(chunk);
      });

      audioStream.on('end', () => {
        finish(null, Buffer.concat(chunks));
      });

      audioStream.on('error', (err) => {
        const partial = chunks.length > 0 ? Buffer.concat(chunks) : null;
        if (partial && partial.length > 1000) {
          return finish(null, partial);
        }
        finish(err);
      });
    } catch (err) {
      finish(err);
    }
  });
}

async function generateSpeechMP3(text, voiceName = 'vi-VN-NamMinhNeural') {
  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) {
    throw new Error('Văn bản rỗng sau khi làm sạch');
  }

  const cacheKey = `${voiceName}:${cleaned}`;
  if (audioCache.has(cacheKey)) {
    return audioCache.get(cacheKey);
  }

  let buffer = null;

  if (Date.now() >= edgeCooldownUntil) {
    try {
      buffer = await fetchEdgeTTS(cleaned, voiceName);
      if (!buffer || buffer.length < 1000) {
        edgeCooldownUntil = Date.now() + EDGE_COOLDOWN_MS;
        buffer = null;
      }
    } catch (err) {
      edgeCooldownUntil = Date.now() + EDGE_COOLDOWN_MS;
      console.warn('[TTS] Edge TTS unavailable, using Google TTS fallback');
    }
  }

  if (!buffer || buffer.length < 1000) {
    try {
      buffer = await generateGoogleTTSFallback(cleaned);
    } catch (gErr) {
      console.error('[TTS] fallback_unavailable');
      throw new Error('Không thể tạo âm thanh giọng đọc từ tất cả nguồn TTS.');
    }
  }

  if (buffer && buffer.length > 0) {
    if (audioCache.size >= MAX_CACHE_ENTRIES) {
      const firstKey = audioCache.keys().next().value;
      audioCache.delete(firstKey);
    }
    audioCache.set(cacheKey, buffer);
    return buffer;
  }

  throw new Error('Không thể tạo file âm thanh');
}

module.exports = {
  generateSpeechMP3,
  cleanTextForSpeech,
  fetchEdgeTTS
};
