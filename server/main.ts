import express from 'express';
import cors from 'cors';
import sharp from 'sharp';
import compression from 'compression';

const app = express();
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '25mb' }));

const GFPGAN_API_URL = 'https://free-version-of-api-key.replit.app';
const API_KEY = process.env.FREE_API_LUMINASCALE;

const log = (requestId: string, message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${requestId}] ${message}`, data ? JSON.stringify(data) : '');
};

app.post('/api/enhance', async (req, res) => {
  const requestId = Math.random().toString(36).substring(7);
  const startTime = Date.now();
  
  try {
    const { image, style } = req.body;
    
    if (!image || !image.base64) {
      log(requestId, 'ERROR: Missing image data');
      return res.status(400).json({ error: 'Missing image data' });
    }
    
    if (!API_KEY) {
      log(requestId, 'ERROR: FREE_API_LUMINASCALE not configured');
      return res.status(500).json({ error: 'Configuration Error: API key not set' });
    }
    
    let imageBuffer = Buffer.from(image.base64, 'base64');
    const inputSize = (imageBuffer.length / 1024 / 1024).toFixed(2);
    log(requestId, `Received image: ${inputSize}MB`);
    
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width || 1024;
    const height = metadata.height || 1024;
    log(requestId, `Original dimensions: ${width}x${height}`);
    
    const maxInputPixels = 1024 * 1024;
    const currentPixels = width * height;
    
    if (currentPixels > maxInputPixels) {
      const scale = Math.sqrt(maxInputPixels / currentPixels);
      const newWidth = Math.round(width * scale);
      const newHeight = Math.round(height * scale);
      
      log(requestId, `Resizing from ${width}x${height} to ${newWidth}x${newHeight}`);
      imageBuffer = await sharp(imageBuffer)
        .resize(newWidth, newHeight, { fit: 'inside' })
        .png()
        .toBuffer();
    } else {
      imageBuffer = await sharp(imageBuffer).png().toBuffer();
    }
    
    const scale = style === 'maximum' ? 4 : 2;
    log(requestId, `Calling GFPGAN API (${scale}x upscale)...`);
    
    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: 'image/png' });
    formData.append('file', blob, 'image.png');
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);
    
    const response = await fetch(`${GFPGAN_API_URL}/enhance?scale=${scale}`, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY
      },
      body: formData,
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    
    if (!response.ok) {
      const errorText = await response.text();
      log(requestId, `API Error: ${response.status}`, { error: errorText });
      
      if (response.status === 429) {
        return res.status(429).json({ error: 'Daily quota exceeded. Please try again tomorrow.' });
      }
      if (response.status === 401) {
        return res.status(500).json({ error: 'API authentication failed.' });
      }
      throw new Error(`GFPGAN API error: ${response.status}`);
    }
    
    const quotaUsed = response.headers.get('X-Quota-Used');
    const quotaLimit = response.headers.get('X-Quota-Limit');
    log(requestId, `API quota: ${quotaUsed}/${quotaLimit}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const outputBuffer = await sharp(Buffer.from(arrayBuffer))
      .jpeg({ quality: 92 })
      .toBuffer();
    
    const enhancedBase64 = outputBuffer.toString('base64');
    const resultSize = (outputBuffer.length / 1024 / 1024).toFixed(2);
    
    log(requestId, `SUCCESS: Enhanced to ${resultSize}MB in ${Date.now() - startTime}ms`);
    
    return res.json({ 
      enhancedImage: `data:image/jpeg;base64,${enhancedBase64}` 
    });

  } catch (error: any) {
    log(requestId, `Server error: ${error.message}`, { stack: error.stack });
    
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: 'Enhancement timed out. Please try a smaller image.' });
    }
    
    if (error.message.includes('Input buffer contains unsupported image format')) {
      return res.status(400).json({ error: 'File Error: Unsupported or corrupted image format.' });
    }
    
    return res.status(500).json({ 
      error: 'Enhancement failed. Please try again.', 
      retryable: true 
    });
  }
});

app.get('/api/health', async (req, res) => {
  try {
    const healthCheck = await fetch(`${GFPGAN_API_URL}/health`, { 
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    const isApiHealthy = healthCheck.ok;
    
    res.json({ 
      status: isApiHealthy ? 'ok' : 'degraded', 
      hasApiKey: !!API_KEY,
      provider: 'GFPGAN (Real-ESRGAN)',
      apiStatus: isApiHealthy ? 'connected' : 'unreachable',
      timestamp: new Date().toISOString()
    });
  } catch {
    res.json({ 
      status: 'degraded', 
      hasApiKey: !!API_KEY,
      provider: 'GFPGAN (Real-ESRGAN)',
      apiStatus: 'unreachable',
      timestamp: new Date().toISOString()
    });
  }
});

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`GFPGAN API configured: ${!!API_KEY}`);
  console.log(`API endpoint: ${GFPGAN_API_URL}`);
});
