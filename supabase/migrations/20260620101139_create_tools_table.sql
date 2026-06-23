CREATE TABLE public.tools (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  name text NOT NULL,
  tagline text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  credits integer NOT NULL,
  popular boolean DEFAULT false,
  input_label text NOT NULL,
  input_placeholder text NOT NULL,
  sample_output text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT tools_pkey PRIMARY KEY (id),
  CONSTRAINT tools_slug_key UNIQUE (slug)
);

-- Enable RLS
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;

-- Allow read access for everyone
CREATE POLICY "Allow public read access" ON public.tools
  FOR SELECT
  USING (true);

-- Seed data
INSERT INTO public.tools (slug, name, tagline, description, category, credits, popular, input_label, input_placeholder, sample_output) VALUES
('sales-lead-qualifier', 'Sales Lead Qualifier', 'Qualify LinkedIn leads instantly', 'Provide a LinkedIn URL and your qualification criteria — get an AI-powered fit assessment.', 'Data', 5, true, 'LinkedIn URL', 'https://www.linkedin.com/in/...', ''),
('pdf-extractor', 'PDF Extractor', 'Extract text & data from PDFs', 'Upload a PDF and pull out clean text, tables, or specific fields using AI.', 'Data', 4, true, 'PDF file', 'Upload a PDF', ''),
('blog-post-writer', 'Blog Post Writer', 'Long-form articles in seconds', 'Generate well-structured, SEO-friendly blog posts from a single topic line.', 'Writing', 5, true, 'Topic or title', 'e.g. The rise of edge AI in 2026', '# The Rise of Edge AI in 2026

Edge AI has moved from buzzword to backbone. In 2026, inference happens where the data is born — on phones, sensors, and cars — slashing latency and costs while keeping data private...'),
('ad-copy-generator', 'Ad Copy Generator', 'High-converting ads, instantly', 'Create Facebook, Google, and X ad variations tuned to your audience.', 'Writing', 3, true, 'Product or offer', 'e.g. Wireless ergonomic mouse for designers', 'Headline: Designed for designers.
Body: A mouse that disappears under your hand. 70-hour battery, silent click, infinite scroll.
CTA: Get yours →'),
('image-upscaler', 'Image Upscaler 4x', 'Sharpen and enlarge images', 'Upscale photos to 4x resolution while preserving fine details.', 'Image', 8, true, 'Image URL', 'https://...', '✓ Upscaled to 4096×4096 — download link ready.'),
('logo-generator', 'Logo Generator', 'Brandable logos from a prompt', 'Generate unique, vector-friendly logos from a short brief.', 'Image', 10, false, 'Brand brief', 'e.g. Modern fintech for freelancers, minimal, warm', '✓ Generated 4 logo concepts.'),
('code-explainer', 'Code Explainer', 'Understand any snippet', 'Paste any code and get a line-by-line plain English explanation.', 'Code', 2, false, 'Code snippet', 'Paste your code here...', 'This function defines a recursive Fibonacci. Line 1 declares the function with one argument n. Lines 2–3 are the base case returning n when n < 2...'),
('sql-from-prompt', 'SQL from Prompt', 'Plain English → SQL', 'Describe what you want and get clean, optimized SQL.', 'Code', 4, true, 'What do you want to query?', 'e.g. Top 10 customers by revenue this quarter', 'SELECT customer_id, SUM(amount) AS revenue
FROM orders
WHERE created_at >= date_trunc(''quarter'', now())
GROUP BY customer_id
ORDER BY revenue DESC
LIMIT 10;'),
('audio-transcriber', 'Audio Transcriber', 'Audio → text, 99% accuracy', 'Transcribe interviews, meetings, and podcasts with speaker labels.', 'Audio', 6, false, 'Audio file URL', 'https://...', '[00:00] Speaker 1: Welcome back to the show...
[00:08] Speaker 2: Thanks for having me...'),
('voice-cloner', 'Voice Cloner', 'Clone a voice from 30s', 'Clone any voice with a short sample and generate speech.', 'Audio', 12, false, 'Text to speak', 'Type what the cloned voice should say...', '✓ Generated 14 seconds of audio. Download ready.'),
('video-summarizer', 'Video Summarizer', 'TL;DR for any video', 'Get key points, chapters, and quotes from any video URL.', 'Video', 7, false, 'Video URL', 'https://youtube.com/...', 'Summary:
• Founder explains the pivot from B2C to B2B
• Revenue grew 4x post-pivot
• Key takeaway: focus beats features'),
('subtitle-translator', 'Subtitle Translator', 'Translate subtitles to 40+ languages', 'Upload an SRT and get back accurate, timed translations.', 'Video', 5, false, 'Target language', 'e.g. Spanish', '✓ Translated 312 subtitle lines to Spanish.'),
('csv-cleaner', 'CSV Cleaner', 'Fix messy spreadsheets', 'Detect duplicates, fill missing values, and normalize columns.', 'Data', 4, false, 'CSV URL or paste', 'Paste CSV content...', '✓ Removed 47 duplicate rows. Normalized 3 columns. Filled 12 missing values.'),
('chart-from-data', 'Chart from Data', 'Auto-pick the right chart', 'Paste data and get the right chart with annotations.', 'Data', 3, false, 'Data', 'Paste CSV or JSON...', '✓ Generated a stacked bar chart. Insight: Q4 doubled Q3.');
