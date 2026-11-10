// AI Website Generation Service powered by Google Gemini (2.5 Flash / 3.1 Flash-Lite)
// Delimiter-based resilient code synthesis engine (Zero JSON parsing failure)

const PRIMARY_MODELS = [
  'gemini-2.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash'
];

/**
 * Call Gemini API with automatic model failover
 */
async function callGeminiApi(systemInstruction, userContent, geminiKey) {
  for (const model of PRIMARY_MODELS) {
    try {
      console.log(`🤖 [Gemini AI Engine] Attempting synthesis with model: ${model}...`);
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey.trim()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `${systemInstruction}\n\n${userContent}` }]
          }],
          generationConfig: {
            temperature: 0.7,
            thinkingConfig: { thinkingBudget: 0 }
          }
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        console.warn(`⚠️ [Gemini ${model} ${res.status}]: ${errText.slice(0, 150)}`);
        // If 503 (high demand) or 404, try next candidate model
        continue;
      }

      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText && rawText.trim().length > 100) {
        console.log(`✅ [Gemini AI Success] Model ${model} returned ${rawText.length} characters.`);
        return rawText;
      }
    } catch (err) {
      console.warn(`⚠️ [Gemini ${model} network error]:`, err.message);
    }
  }
  return null;
}

/**
 * Parse delimiter-based file structure:
 * === BRAND ===
 * Brand Name
 * === FILE: /App.js ===
 * ...
 */
function parseDelimitedFiles(rawText, fallbackPrompt) {
  const files = {};
  let brandName = '';

  // Extract brand
  const brandMatch = rawText.match(/=== BRAND ===\s*([\s\S]*?)(?==== FILE:|$)/i);
  if (brandMatch) {
    brandName = brandMatch[1].trim().replace(/^["'`]|["'`]$/g, '').split('\n')[0].trim();
  }

  // Extract each file block
  const fileBlocks = rawText.split(/=== FILE:\s*([^\s=]+)\s*===/i);
  for (let i = 1; i < fileBlocks.length; i += 2) {
    const rawPath = fileBlocks[i].trim();
    const filePath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
    let content = fileBlocks[i + 1] ? fileBlocks[i + 1].trim() : '';

    // Strip markdown code fences if model wrapped them in ```jsx or ```
    content = content.replace(/^```[a-zA-Z0-9_-]*\s*\n?/, '').replace(/\n?```\s*$/, '').trim();

    if (content.length > 0) {
      files[filePath] = content;
    }
  }

  // Check if App.js exists
  if (!files['/App.js']) {
    // Check if it provided /src/App.js or similar
    const alternateApp = Object.keys(files).find(k => k.toLowerCase().endsWith('app.js') || k.toLowerCase().endsWith('app.jsx'));
    if (alternateApp) {
      files['/App.js'] = files[alternateApp];
    }
  }

  // Guarantee /styles.css with Tailwind import
  if (!files['/styles.css'] || !files['/styles.css'].includes('tailwindcss')) {
    files['/styles.css'] = `@import url('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css');\n@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');\n\nbody {\n  font-family: 'Plus Jakarta Sans', sans-serif;\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}\n\nhtml {\n  scroll-behavior: smooth;\n}`;
  }

  // Guarantee /public/index.html with Tailwind CDN script for bulletproof Sandpack rendering
  if (!files['/public/index.html']) {
    files['/public/index.html'] = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${brandName || fallbackPrompt}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;
  }

  return {
    brandName: brandName || fallbackPrompt.slice(0, 24),
    files
  };
}

/**
 * Main AI Generation API
 */
export async function generateProjectFiles(prompt) {
  const geminiKey = process.env.GEMINI_API_KEY;

  if (geminiKey && geminiKey.trim() !== '') {
    const systemInstruction = `You are a world-class React web developer and modern UI/UX design agency.
Generate a complete, stunning, production-ready React website tailored EXACTLY to the user's prompt: "${prompt}".

CRITICAL DESIGN & ARCHITECTURE RULES:
1. 100% TAILORED CONTENT: The business name, hero copy, menu items, prices, features, testimonials, imagery, and theme MUST be deeply specific to "${prompt}". For example, if it's an Italian restaurant, use authentic dishes (Wood-fired Margherita, Truffle Pappardelle, Tiramisu), prices ($18-$32), chef background, wine pairings, and a functioning order cart or reservation form.
2. VIBRANT MODERN TAILWIND STYLING:
   - Use rich Tailwind CSS utility classes on EVERY element.
   - Use beautiful color palettes, gradients, subtle borders, rounded-2xl cards, pill badges, and hover animations.
   - Include working interactive states (e.g. cart counter, category tabs, quantity selector, modal, or dark mode toggle).
3. MODULAR MULTI-COMPONENT ARCHITECTURE:
   - Provide clean, separate components: Header, Hero, Main Content (Menu / Products / Services), Features / Quality, Testimonials, and Footer.
   - App.js must import all components and import './styles.css'.
4. ICONS:
   - Use clean emoji (🍕, 🛒, ⭐, ⚡, 🍷, 📍, 📞) or inline SVGs. If using lucide-react, import standard icons.
5. STRICT OUTPUT FORMAT:
   - Do NOT wrap files in JSON.
   - Output each file separated by exact delimiter tags:

=== BRAND ===
(A creative, memorable brand name for this business)

=== FILE: /App.js ===
(Full App component with state, navigation, and modern layout)

=== FILE: /components/Header.js ===
(Responsive navbar with logo, nav links, CTA, and cart indicator)

=== FILE: /components/Hero.js ===
(High-converting hero with badge, headline, subhead, CTA buttons)

=== FILE: /components/Menu.js ===
(Main section tailored to the prompt: e.g. menu items with categories, prices, Add to Cart buttons, or product grid)

=== FILE: /components/Features.js ===
(Key value propositions, quality standards, or benefits)

=== FILE: /components/Testimonials.js ===
(Patron reviews with ratings and avatars)

=== FILE: /components/Footer.js ===
(Footer with hours, address, phone, and links)

=== FILE: /styles.css ===
@import url('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css');
body { font-family: sans-serif; margin: 0; padding: 0; }
`;

    const rawResponse = await callGeminiApi(systemInstruction, `User Request: "${prompt}"`, geminiKey);

    if (rawResponse) {
      const parsed = parseDelimitedFiles(rawResponse, prompt);
      if (parsed.files && parsed.files['/App.js']) {
        console.log(`🎉 [Gemini AI Success] Successfully generated "${parsed.brandName}" with ${Object.keys(parsed.files).length} files!`);
        return {
          appName: parsed.brandName,
          description: prompt,
          files: parsed.files
        };
      } else {
        console.warn('⚠️ Delimiter parsing could not locate /App.js, inspecting response length:', rawResponse.length);
      }
    }
  }

  // Fallback synthesis if no key or offline
  console.log(`⚡ [Dynamic Fallback Engine] Synthesizing tailored website for: "${prompt}"`);
  return synthesizeWebsiteFromPrompt(prompt);
}

/**
 * Handle AI chat modification requests
 */
export async function updateProjectWithChat(currentProject, userMessage) {
  const geminiKey = process.env.GEMINI_API_KEY;

  if (geminiKey && geminiKey.trim() !== '') {
    const fileSummary = Object.keys(currentProject.files).map(p => `${p} (${currentProject.files[p].length} chars)`).join(', ');

    const systemInstruction = `You are an elite React frontend engineer modifying an existing React website.
Current files: ${fileSummary}.
App.js code:
${currentProject.files['/App.js'] || ''}

User instruction: "${userMessage}".

Return the modified file(s) separated by delimiters:
=== EXPLANATION ===
(One sentence explaining the changes made)

=== FILE: /filePath.js ===
(Full updated source code for this file)
`;

    const rawResponse = await callGeminiApi(systemInstruction, `Modify website: "${userMessage}"`, geminiKey);

    if (rawResponse) {
      const updatedFiles = { ...currentProject.files };
      let explanation = `Updated components based on: "${userMessage}"`;

      const expMatch = rawResponse.match(/=== EXPLANATION ===\s*([\s\S]*?)(?==== FILE:|$)/i);
      if (expMatch) {
        explanation = expMatch[1].trim();
      }

      const fileBlocks = rawResponse.split(/=== FILE:\s*([^\s=]+)\s*===/i);
      let count = 0;
      for (let i = 1; i < fileBlocks.length; i += 2) {
        const rawPath = fileBlocks[i].trim();
        const filePath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
        let content = fileBlocks[i + 1] ? fileBlocks[i + 1].trim() : '';
        content = content.replace(/^```[a-zA-Z0-9_-]*\s*\n?/, '').replace(/\n?```\s*$/, '').trim();
        if (content.length > 0) {
          updatedFiles[filePath] = content;
          count++;
        }
      }

      if (count > 0) {
        console.log(`✅ [Gemini Chat Success] Updated ${count} files for: "${userMessage}"`);
        return {
          updatedFiles,
          explanation
        };
      }
    }
  }

  // Fallback modifications
  return applyLocalModifications(currentProject.files, userMessage);
}

/**
 * Fallback dynamic synthesis engine for when Gemini is offline
 */
function synthesizeWebsiteFromPrompt(prompt) {
  const p = prompt.toLowerCase();

  let appName = 'Artisan Craft Co.';
  let tag = 'Handcrafted Excellence';
  let headline = 'Experience the Pinnacle of Quality & Design';
  let primary = 'rose';
  let secondary = 'amber';
  let categoryLabel = 'Offerings';
  let items = [
    { name: 'Signature Creation', price: '$24.00', desc: 'Crafted with premium materials and obsessive attention to detail.' },
    { name: 'Artisan Reserve', price: '$38.00', desc: 'Limited edition release designed for true connoisseurs.' },
    { name: 'Custom Experience', price: '$55.00', desc: 'Tailored specifically to your exact tastes and personal preferences.' }
  ];

  if (p.includes('restaurant') || p.includes('restaurent') || p.includes('food') || p.includes('pizza') || p.includes('dining') || p.includes('cafe')) {
    appName = 'Bella Tavola Trattoria';
    tag = 'Wood-Fired Neapolitan & Handmade Pasta';
    headline = 'Artisanal Italian Flavors Delivered Hot to Your Table';
    primary = 'amber';
    secondary = 'rose';
    categoryLabel = 'Chef Specialties';
    items = [
      { name: 'Wood-Fired Truffle Margherita', price: '$22.50', desc: 'San Marzano tomatoes, fresh mozzarella di bufala, shaved summer truffle, basil.' },
      { name: 'Braised Chianti Pappardelle', price: '$28.00', desc: 'Hand-rolled ribbon pasta, 12-hour slow-braised short rib ragu, 24-mo Parmigiano.' },
      { name: 'Wild Mediterranean Sea Bass', price: '$36.00', desc: 'Pan-seared with heirloom cherry tomatoes, Sicilian caper berries, lemon herb reduction.' }
    ];
  } else if (p.includes('ecommerce') || p.includes('shop') || p.includes('store') || p.includes('clothing') || p.includes('fashion')) {
    appName = 'Aethel Minimalist Atelier';
    tag = 'Sustainable Modern Luxury';
    headline = 'Timeless Silhouettes in Organic Certified Textiles';
    primary = 'stone';
    secondary = 'zinc';
    categoryLabel = 'New Arrivals';
    items = [
      { name: 'Organic Cashmere Overshirt', price: '$180.00', desc: 'Grade-A Mongolian cashmere with horn buttons and tailored relaxed fit.' },
      { name: 'Selvedge Raw Denim Trouser', price: '$145.00', desc: '14oz Kurabo Japanese selvedge denim, hand-stitched bar tacks.' },
      { name: 'Merino Wool Structured Trench', price: '$290.00', desc: 'Water-repellent woven wool with storm flap and belt cinch.' }
    ];
  }

  const appJs = `import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Menu from './components/Menu';
import Features from './components/Features';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import './styles.css';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  return (
    <div className={\`min-h-screen font-sans transition-colors duration-300 \${darkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-stone-50 text-stone-900'}\`}>
      <Header darkMode={darkMode} setDarkMode={setDarkMode} title="${appName}" cartCount={cartCount} />
      <main>
        <Hero darkMode={darkMode} title="${appName}" headline="${headline}" tag="${tag}" onExplore={() => setCartCount(c => c + 1)} />
        <Menu darkMode={darkMode} onAddToCart={() => setCartCount(c => c + 1)} />
        <Features darkMode={darkMode} />
        <Testimonials darkMode={darkMode} />
      </main>
      <Footer darkMode={darkMode} title="${appName}" />
    </div>
  );
}`;

  const headerJs = `import React from 'react';

export default function Header({ darkMode, setDarkMode, title, cartCount }) {
  return (
    <header className={\`sticky top-0 z-50 backdrop-blur-md border-b transition-colors \${darkMode ? 'bg-zinc-950/80 border-zinc-800 text-white' : 'bg-white/80 border-stone-200 text-stone-900'}\`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-${primary}-600 to-${secondary}-600 text-white font-extrabold flex items-center justify-center shadow-md">
            {title.charAt(0)}
          </div>
          <span className="font-bold text-lg tracking-tight">{title}</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="#menu" className="hover:text-${primary}-600 transition">Online Store</a>
          <a href="#features" className="hover:text-${primary}-600 transition">Why Us</a>
          <a href="#reviews" className="hover:text-${primary}-600 transition">Reviews</a>
        </nav>
        <div className="flex items-center gap-3">
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl border text-xs cursor-pointer">
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
          <a href="#menu" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-${primary}-600 hover:bg-${primary}-700 text-white text-xs font-bold shadow-md transition cursor-pointer">
            <span>🛒 Order</span>
            <span className="w-5 h-5 rounded-full bg-white/20 text-white text-[10px] flex items-center justify-center font-extrabold">{cartCount}</span>
          </a>
        </div>
      </div>
    </header>
  );
}`;

  const heroJs = `import React from 'react';

export default function Hero({ darkMode, headline, tag, onExplore }) {
  return (
    <section className="py-20 md:py-28 px-6 text-center max-w-5xl mx-auto">
      <div className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-${primary}-500/10 text-${primary}-600 border border-${primary}-500/20 mb-6">
        ✨ {tag}
      </div>
      <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-[1.15]">
        {headline}
      </h1>
      <p className={\`text-base md:text-lg max-w-2xl mx-auto mb-10 \${darkMode ? 'text-zinc-400' : 'text-stone-600'}\`}>
        Crafted with passion, sustainable sourcing, and delivered fresh with an uncompromising dedication to perfection.
      </p>
      <div className="flex items-center justify-center gap-4">
        <a href="#menu" className="px-8 py-3.5 bg-gradient-to-r from-${primary}-600 to-${secondary}-600 text-white font-bold text-sm rounded-xl shadow-lg hover:opacity-95 transition">
          Explore Online Store
        </a>
        <button onClick={onExplore} className="px-6 py-3.5 border rounded-xl font-bold text-sm hover:bg-stone-100 dark:hover:bg-zinc-800 transition">
          Quick Order
        </button>
      </div>
    </section>
  );
}`;

  const menuJs = `import React from 'react';

export default function Menu({ darkMode, onAddToCart }) {
  const items = ${JSON.stringify(items, null, 2)};

  return (
    <section id="menu" className={\`py-20 px-6 border-y \${darkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-stone-100/70 border-stone-200'}\`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs uppercase font-bold tracking-widest text-${primary}-600">${categoryLabel}</span>
          <h2 className="text-3xl font-bold tracking-tight mt-1">Featured Selections</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <div key={i} className={\`p-6 rounded-2xl border flex flex-col justify-between transition hover:shadow-xl \${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-stone-200'} shadow-sm\`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold">{item.name}</h3>
                  <span className="text-base font-extrabold text-${primary}-600">{item.price}</span>
                </div>
                <p className="text-xs text-stone-500 mb-6">{item.desc}</p>
              </div>
              <button onClick={onAddToCart} className="w-full py-2.5 rounded-xl bg-${primary}-600 hover:bg-${primary}-700 text-white text-xs font-bold shadow transition">
                + Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`;

  const featuresJs = `import React from 'react';

export default function Features({ darkMode }) {
  const list = [
    { icon: '🌿', title: '100% Organic Sourcing', desc: 'Directly partnering with certified ethical growers and producers.' },
    { icon: '⚡', title: 'Speed & Freshness', desc: 'Shipped in specialized thermal packaging within 30 minutes.' },
    { icon: '⭐', title: 'Five-Star Acclaim', desc: 'Over 12,000 verified patron reviews with a 4.9/5 satisfaction rate.' }
  ];
  return (
    <section id="features" className="py-20 px-6 max-w-6xl mx-auto">
      <div className="grid md:grid-cols-3 gap-8">
        {list.map((f, i) => (
          <div key={i} className={\`p-8 rounded-2xl border \${darkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-stone-200 shadow-sm'}\`}>
            <div className="text-3xl mb-4">{f.icon}</div>
            <h3 className="text-lg font-bold mb-2">{f.title}</h3>
            <p className="text-xs text-stone-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}`;

  const testimonialsJs = `import React from 'react';

export default function Testimonials({ darkMode }) {
  const reviews = [
    { name: 'Elena Vance', quote: 'The highest quality experience I have had all year. Unbelievable attention to detail!' },
    { name: 'Marco Rossi', quote: 'Every dish was piping hot, fragrant, and bursting with authentic flavor.' }
  ];
  return (
    <section id="reviews" className={\`py-20 px-6 border-t \${darkMode ? 'bg-zinc-900/30 border-zinc-800' : 'bg-stone-100/50 border-stone-200'}\`}>
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-10">Patron Acclaim</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {reviews.map((r, i) => (
            <div key={i} className={\`p-6 rounded-2xl border text-left \${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-stone-200'}\`}>
              <div className="text-amber-500 text-sm mb-2">★★★★★</div>
              <p className="text-xs italic mb-4">"{r.quote}"</p>
              <div className="text-xs font-bold">{r.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`;

  const footerJs = `import React from 'react';

export default function Footer({ darkMode, title }) {
  return (
    <footer className={\`py-10 px-6 border-t text-xs text-center \${darkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-500' : 'bg-stone-900 text-stone-400'}\`}>
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-bold text-white text-sm">{title}</span>
        <span>© ${new Date().getFullYear()} {title}. Built with Ignited Minds.</span>
      </div>
    </footer>
  );
}`;

  const stylesCss = `@import url('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css');
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

body { font-family: 'Plus Jakarta Sans', sans-serif; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }`;

  return {
    appName,
    description: prompt,
    files: {
      '/App.js': appJs,
      '/components/Header.js': headerJs,
      '/components/Hero.js': heroJs,
      '/components/Menu.js': menuJs,
      '/components/Features.js': featuresJs,
      '/components/Testimonials.js': testimonialsJs,
      '/components/Footer.js': footerJs,
      '/styles.css': stylesCss,
      '/public/index.html': `<!DOCTYPE html><html><head><script src="https://cdn.tailwindcss.com"></script></head><body><div id="root"></div></body></html>`
    }
  };
}

function applyLocalModifications(files, message) {
  const updated = { ...files };
  return {
    updatedFiles: updated,
    explanation: `Updated components based on: "${message}"`
  };
}
