import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || "",
  withCredentials: true,
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export const dummyUser = {
  _id: "user-1",
  name: "Alex Rivera",
  email: "alex@example.com",
  credits: 20,
  plan: "pro",
  avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Alex",
};

export const initialProjects = [
  {
    _id: "proj-1",
    name: "SaaSify Landing Page",
    description: "A modern SaaS landing page with dark mode accents, hero section, bento grid features, pricing table, and testimonials.",
    version: 1,
    status: "completed",
    published: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    messages: [
      {
        role: "user",
        content: "Create a modern SaaS landing page for an AI productivity platform called SaaSify",
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        role: "assistant",
        content: "I have built the SaaSify landing page with a modern design system including Hero, Features, Pricing, and Testimonial components.",
        timestamp: new Date(Date.now() - 86400000 * 2 + 5000).toISOString(),
      },
    ],
    files: {
      "/App.js": `import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Pricing from './components/Pricing';
import Footer from './components/Footer';
import './styles.css';

export default function App() {
  return (
    <div className='min-h-screen bg-white text-zinc-900 font-sans antialiased selection:bg-red-500 selection:text-white'>
      <Header />
      <main>
        <Hero />
        <Features />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}`,
      "/components/Header.js": `import React from 'react';

export default function Header() {
  return (
    <header className='sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100'>
      <div className='max-w-7xl mx-auto px-6 h-16 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <div className='size-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm'>
            S
          </div>
          <span className='font-bold text-xl tracking-tight text-zinc-900'>SaaSify</span>
        </div>
        <nav className='hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600'>
          <a href='#features' className='hover:text-zinc-900 transition'>Features</a>
          <a href='#pricing' className='hover:text-zinc-900 transition'>Pricing</a>
          <a href='#about' className='hover:text-zinc-900 transition'>About</a>
        </nav>
        <div className='flex items-center gap-4'>
          <button className='text-sm font-medium text-zinc-700 hover:text-zinc-900 transition hidden sm:block'>Sign in</button>
          <button className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow-sm transition cursor-pointer'>
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
}`,
      "/components/Hero.js": `import React from 'react';

export default function Hero() {
  return (
    <section className='relative py-20 md:py-28 max-w-7xl mx-auto px-6 text-center overflow-hidden'>
      <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-700 text-xs font-semibold mb-6'>
        <span className='size-2 rounded-full bg-red-600 animate-pulse'></span>
        Introducing SaaSify v2.0 AI Platform
      </div>
      <h1 className='text-5xl md:text-7xl font-bold tracking-tighter text-zinc-950 leading-[1.08] max-w-4xl mx-auto mb-6'>
        Build AI Workflows <br className='hidden sm:block' />
        <span className='bg-linear-to-r from-red-600 to-pink-600 bg-clip-text text-transparent'>10x Faster Than Ever</span>
      </h1>
      <p className='text-lg md:text-xl text-zinc-600 max-w-2xl mx-auto mb-10 leading-relaxed'>
        Automate your business processes, analyze data instantly, and scale your operations with enterprise-grade autonomous AI agents.
      </p>
      <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
        <button className='w-full sm:w-auto px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-base shadow-lg hover:shadow-red-500/25 transition cursor-pointer'>
          Start Free Trial
        </button>
        <button className='w-full sm:w-auto px-8 py-3.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold rounded-xl text-base transition cursor-pointer'>
          Watch Demo
        </button>
      </div>
    </section>
  );
}`,
      "/components/Features.js": `import React from 'react';

export default function Features() {
  const features = [
    { title: "Autonomous Agents", desc: "Deploy intelligent agents that handle complex multi-step workflows automatically." },
    { title: "Real-time Analytics", desc: "Gain deep insights into your operations with live telemetry and custom dashboards." },
    { title: "Enterprise Security", desc: "SOC2 Type II compliant with end-to-end encryption for all data in transit." }
  ];

  return (
    <section id='features' className='py-20 bg-zinc-50/80 border-y border-zinc-100'>
      <div className='max-w-7xl mx-auto px-6'>
        <div className='text-center max-w-2xl mx-auto mb-16'>
          <h2 className='text-3xl font-bold tracking-tight text-zinc-900 mb-3'>Engineered for Modern Teams</h2>
          <p className='text-zinc-600 text-base'>Everything you need to deploy, monitor, and scale your AI automation infrastructure.</p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {features.map((f, i) => (
            <div key={i} className='p-8 bg-white rounded-2xl border border-zinc-200/80 shadow-sm hover:shadow-md transition'>
              <div className='size-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-xl mb-6'>
                0{i + 1}
              </div>
              <h3 className='text-xl font-bold text-zinc-900 mb-2'>{f.title}</h3>
              <p className='text-zinc-600 text-sm leading-relaxed'>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`,
      "/components/Pricing.js": `import React from 'react';

export default function Pricing() {
  return (
    <section id='pricing' className='py-20 max-w-7xl mx-auto px-6'>
      <div className='text-center max-w-2xl mx-auto mb-16'>
        <h2 className='text-3xl font-bold tracking-tight text-zinc-900 mb-3'>Simple, Transparent Pricing</h2>
        <p className='text-zinc-600 text-base'>No hidden fees. Scale up or down anytime.</p>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto'>
        <div className='p-8 rounded-2xl border border-zinc-200 bg-white shadow-sm'>
          <h3 className='text-xl font-bold text-zinc-900 mb-2'>Starter</h3>
          <p className='text-zinc-500 text-sm mb-6'>Perfect for small projects and side hustles</p>
          <div className='text-4xl font-bold text-zinc-950 mb-6'>$29 <span className='text-base font-normal text-zinc-500'>/mo</span></div>
          <button className='w-full py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold rounded-xl transition'>Choose Starter</button>
        </div>
        <div className='p-8 rounded-2xl border-2 border-red-600 bg-white shadow-md relative'>
          <span className='absolute -top-3 right-6 px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full'>POPULAR</span>
          <h3 className='text-xl font-bold text-zinc-900 mb-2'>Pro</h3>
          <p className='text-zinc-500 text-sm mb-6'>For growing businesses demanding full power</p>
          <div className='text-4xl font-bold text-zinc-950 mb-6'>$79 <span className='text-base font-normal text-zinc-500'>/mo</span></div>
          <button className='w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-sm transition'>Choose Pro</button>
        </div>
      </div>
    </section>
  );
}`,
      "/components/Footer.js": `import React from 'react';

export default function Footer() {
  return (
    <footer className='py-12 bg-zinc-900 text-zinc-400 text-sm border-t border-zinc-800'>
      <div className='max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4'>
        <div className='flex items-center gap-2'>
          <span className='font-bold text-white text-lg'>SaaSify</span>
          <span className='text-zinc-500'>— Built with Ignited Minds</span>
        </div>
        <p className='text-zinc-500'>© {new Date().getFullYear()} SaaSify Inc. All rights reserved.</p>
      </div>
    </footer>
  );
}`,
      "/styles.css": `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

body {
  font-family: 'Inter', sans-serif;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}`,
    },
  },
];

// Fallback Mock Adapter (activates when backend server is not running)
export const mockAdapter = async (config) => {
  await new Promise((resolve) => setTimeout(resolve, 150));

  const method = (config.method || "get").toLowerCase();
  const url = config.url || "";
  const body = config.data ? (typeof config.data === "string" ? JSON.parse(config.data) : config.data) : {};

  const getProjects = () => {
    try {
      const saved = localStorage.getItem("mock_projects");
      return saved ? JSON.parse(saved) : initialProjects;
    } catch {
      return initialProjects;
    }
  };

  const saveProjects = (projects) => {
    localStorage.setItem("mock_projects", JSON.stringify(projects));
  };

  const getUser = () => {
    try {
      const saved = localStorage.getItem("mock_user");
      return saved ? JSON.parse(saved) : dummyUser;
    } catch {
      return dummyUser;
    }
  };

  const saveUser = (user) => {
    if (user) {
      localStorage.setItem("mock_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("mock_user");
    }
  };

  let responseData = null;
  let status = 200;

  // 1. Auth routes
  if (url === "/api/auth/me") {
    const user = getUser();
    if (user) {
      responseData = { user };
    } else {
      status = 401;
      responseData = { error: "Unauthorized" };
    }
  } else if (url === "/api/auth/login") {
    const loggedInUser = {
      _id: "user-1",
      name: body.email?.split("@")[0] || "User",
      email: body.email,
      credits: 20,
      plan: "pro",
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(body.email || "U")}`
    };
    saveUser(loggedInUser);
    localStorage.setItem("token", "mock_jwt_token_user_1");
    responseData = { user: loggedInUser, token: "mock_jwt_token_user_1" };
  } else if (url === "/api/auth/register") {
    const newUser = {
      _id: `user-${Date.now()}`,
      name: body.name || "User",
      email: body.email,
      credits: 20,
      plan: "free",
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(body.name || "U")}`
    };
    saveUser(newUser);
    localStorage.setItem("token", `mock_jwt_token_${newUser._id}`);
    responseData = { user: newUser, token: `mock_jwt_token_${newUser._id}` };
  } else if (url === "/api/auth/logout") {
    saveUser(null);
    localStorage.removeItem("token");
    responseData = { message: "Logged out" };
  }

  // 2. Project routes
  else if (url === "/api/projects" && method === "get") {
    const projects = getProjects();
    responseData = projects;
  } else if (url === "/api/projects" && method === "post") {
    const prompt = body.prompt || "New Project";
    const projName = prompt.length > 28 ? prompt.slice(0, 28) + "..." : prompt;
    const newProject = {
      _id: `proj-${Date.now()}`,
      name: projName,
      description: prompt,
      version: 1,
      status: "completed",
      published: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        { role: "user", content: prompt, timestamp: new Date().toISOString() },
        {
          role: "assistant",
          content: `Generated custom website structure for: "${prompt}".`,
          timestamp: new Date().toISOString(),
        },
      ],
      files: {
        "/App.js": `import React, { useState } from 'react';\nimport Header from './components/Header';\nimport Hero from './components/Hero';\nimport Features from './components/Features';\nimport Pricing from './components/Pricing';\nimport Footer from './components/Footer';\nimport './styles.css';\n\nexport default function App() {\n  const [darkMode, setDarkMode] = useState(false);\n  return (\n    <div className={\`min-h-screen font-sans transition-colors duration-300 \${darkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-white text-zinc-900'}\`}>\n      <Header darkMode={darkMode} setDarkMode={setDarkMode} title="${projName}" />\n      <main>\n        <Hero darkMode={darkMode} title="${projName}" prompt="${prompt}" />\n        <Features darkMode={darkMode} />\n        <Pricing darkMode={darkMode} />\n      </main>\n      <Footer darkMode={darkMode} title="${projName}" />\n    </div>\n  );\n}`,
        "/components/Header.js": `import React from 'react';\n\nexport default function Header({ darkMode, setDarkMode, title }) {\n  return (\n    <header className={\`sticky top-0 z-50 backdrop-blur-md border-b \${darkMode ? 'bg-zinc-950/80 border-zinc-800' : 'bg-white/80 border-zinc-100'}\`}>\n      <div className='max-w-7xl mx-auto px-6 h-16 flex items-center justify-between'>\n        <div className='flex items-center gap-2'>\n          <div className='size-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm'>\n            {title.charAt(0)}\n          </div>\n          <span className='font-bold text-xl tracking-tight'>{title}</span>\n        </div>\n        <div className='flex items-center gap-4'>\n          <button onClick={() => setDarkMode(!darkMode)} className='p-2 rounded-lg border text-sm'>\n            {darkMode ? '☀️' : '🌙'}\n          </button>\n          <button className='px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition'>\n            Get Started\n          </button>\n        </div>\n      </div>\n    </header>\n  );\n}`,
        "/components/Hero.js": `import React from 'react';\n\nexport default function Hero({ darkMode, title, prompt }) {\n  return (\n    <section className='relative py-20 md:py-28 max-w-7xl mx-auto px-6 text-center'>\n      <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-6'>\n        🚀 Powered by Ignited Minds\n      </div>\n      <h1 className='text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight'>\n        ${prompt}\n      </h1>\n      <p className='text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto mb-10'>\n        A high-performance modern platform ready to scale your ideas into reality.\n      </p>\n      <div className='flex justify-center gap-4'>\n        <button className='px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-base shadow-lg transition'>\n          Explore Features\n        </button>\n      </div>\n    </section>\n  );\n}`,
        "/components/Features.js": `import React from 'react';\n\nexport default function Features({ darkMode }) {\n  const list = [\n    { title: 'Lightning Fast', desc: 'Engineered for sub-millisecond response times.' },\n    { title: 'Enterprise Secure', desc: 'End-to-end encryption with automated compliance.' },\n    { title: 'Modern Design', desc: 'Crafted with Tailwind CSS and responsive design.' }\n  ];\n  return (\n    <section className='py-20 bg-zinc-50 dark:bg-zinc-900 border-y border-zinc-200 dark:border-zinc-800'>\n      <div className='max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8'>\n        {list.map((f, i) => (\n          <div key={i} className='p-8 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm'>\n            <h3 className='text-xl font-bold mb-2'>{f.title}</h3>\n            <p className='text-sm text-zinc-500 dark:text-zinc-400'>{f.desc}</p>\n          </div>\n        ))}\n      </div>\n    </section>\n  );\n}`,
        "/components/Pricing.js": `import React from 'react';\n\nexport default function Pricing() {\n  return (\n    <section className='py-20 max-w-5xl mx-auto px-6 text-center'>\n      <h2 className='text-3xl font-bold mb-10'>Simple Pricing</h2>\n      <div className='grid md:grid-cols-2 gap-8'>\n        <div className='p-8 rounded-2xl border bg-white dark:bg-zinc-800'>\n          <h3 className='text-xl font-bold mb-2'>Starter</h3>\n          <div className='text-4xl font-bold my-4'>$0 <span className='text-sm font-normal text-zinc-500'>/mo</span></div>\n          <button className='w-full py-3 bg-zinc-100 dark:bg-zinc-700 rounded-xl font-semibold'>Choose Starter</button>\n        </div>\n        <div className='p-8 rounded-2xl border-2 border-indigo-600 bg-white dark:bg-zinc-800'>\n          <h3 className='text-xl font-bold mb-2'>Pro</h3>\n          <div className='text-4xl font-bold my-4'>$19 <span className='text-sm font-normal text-zinc-500'>/mo</span></div>\n          <button className='w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold'>Choose Pro</button>\n        </div>\n      </div>\n    </section>\n  );\n}`,
        "/components/Footer.js": `import React from 'react';\n\nexport default function Footer({ title }) {\n  return (\n    <footer className='py-8 text-center text-sm text-zinc-400 border-t border-zinc-100 dark:border-zinc-800'>\n      © ${new Date().getFullYear()} ${title}. Built with Ignited Minds.\n    </footer>\n  );\n}`,
        "/styles.css": `@import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700;800;900&display=swap');\n@import url('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css');\nbody { font-family: 'Urbanist', sans-serif; }`,
      },
    };

    const projects = getProjects();
    const updated = [newProject, ...projects];
    saveProjects(updated);
    responseData = newProject;
    status = 201;
  } else if (url.match(/\/api\/projects\/public\/[^/]+$/) && method === "get") {
    const id = url.split("/").pop();
    const projects = getProjects();
    const found = projects.find((p) => p._id === id);
    if (found) {
      responseData = found;
    } else {
      status = 404;
      responseData = { error: "Website unavailable or not published yet" };
    }
  } else if (url.match(/\/api\/projects\/[^/]+\/chat$/) && method === "post") {
    const id = url.split("/")[3];
    const prompt = body.prompt || "";
    const projects = getProjects();
    const foundIndex = projects.findIndex((p) => p._id === id);
    if (foundIndex !== -1) {
      const found = projects[foundIndex];
      const updatedMessages = [
        ...found.messages,
        { role: "user", content: prompt, timestamp: new Date().toISOString() },
        {
          role: "assistant",
          content: `Updated project for: "${prompt}". Applied layout and component adjustments!`,
          timestamp: new Date().toISOString(),
        },
      ];
      const updatedProject = {
        ...found,
        version: found.version + 1,
        status: "completed",
        updatedAt: new Date().toISOString(),
        messages: updatedMessages,
      };
      projects[foundIndex] = updatedProject;
      saveProjects(projects);
      responseData = updatedProject;
    } else {
      status = 404;
      responseData = { error: "Project not found" };
    }
  } else if (url.match(/\/api\/projects\/[^/]+\/publish$/) && method === "post") {
    const id = url.split("/")[3];
    const projects = getProjects();
    const foundIndex = projects.findIndex((p) => p._id === id);
    if (foundIndex !== -1) {
      const newState = !projects[foundIndex].published;
      projects[foundIndex].published = newState;
      saveProjects(projects);
      responseData = { published: newState, project: projects[foundIndex] };
    } else {
      status = 404;
      responseData = { error: "Project not found" };
    }
  } else if (url.match(/\/api\/projects\/[^/]+\/files$/) && method === "put") {
    const id = url.split("/")[3];
    const files = body.files;
    const projects = getProjects();
    const foundIndex = projects.findIndex((p) => p._id === id);
    if (foundIndex !== -1) {
      projects[foundIndex].files = files;
      projects[foundIndex].updatedAt = new Date().toISOString();
      saveProjects(projects);
      responseData = { success: true, project: projects[foundIndex] };
    } else {
      status = 404;
      responseData = { error: "Project not found" };
    }
  } else if (url.match(/\/api\/projects\/[^/]+$/) && method === "get") {
    const id = url.split("/").pop();
    const projects = getProjects();
    const found = projects.find((p) => p._id === id);
    if (found) {
      responseData = found;
    } else {
      status = 404;
      responseData = { error: "Project not found" };
    }
  } else if (url.match(/\/api\/projects\/[^/]+$/) && method === "delete") {
    const id = url.split("/").pop();
    const projects = getProjects();
    const filtered = projects.filter((p) => p._id !== id);
    saveProjects(filtered);
    responseData = { message: "Project deleted" };
  }

  // 3. Payment routes
  else if (url === "/api/payments/plans" && method === "get") {
    responseData = {
      plans: [
        {
          id: "free",
          name: "Starter",
          priceUSD: 0,
          priceINR: 0,
          credits: 20,
          features: ["5 AI Generated Websites", "20 Starter Credits", "Full React Code Export (ZIP)", "Live Sandpack Preview", "Community Support"]
        },
        {
          id: "pro",
          name: "Pro Builder",
          priceUSD: 19,
          priceINR: 799,
          credits: 200,
          popular: true,
          features: ["Unlimited AI Website Builds", "200 Monthly Generation Credits", "Priority Gemini 1.5 Flash AI Engine", "Instant Public Domain Sharing", "No Watermark", "Priority Chat Iteration"]
        },
        {
          id: "enterprise",
          name: "Agency Scale",
          priceUSD: 49,
          priceINR: 2499,
          credits: 1000,
          features: ["Unlimited AI Websites & Workspaces", "1,000 Generation Credits / mo", "Commercial Resale License", "Multi-User Collaboration", "Dedicated Engineering Support", "Custom Design Tokens"]
        }
      ]
    };
  } else if (url === "/api/payments/create-order" && method === "post") {
    responseData = {
      orderId: `order_${Date.now()}`,
      amount: body.planId === "enterprise" ? 49 : 19,
      currency: "USD",
      planId: body.planId,
    };
  } else if (url === "/api/payments/verify" && method === "post") {
    const user = getUser();
    const creditsToAdd = body.planId === "enterprise" ? 1000 : 200;
    const updatedUser = {
      ...user,
      plan: body.planId,
      credits: (user.credits || 0) + creditsToAdd,
    };
    saveUser(updatedUser);
    responseData = {
      success: true,
      message: `🎉 Successfully upgraded to ${body.planId}!`,
      user: updatedUser
    };
  }

  if (status >= 400) {
    const err = new Error(responseData?.error || "Request failed");
    err.response = { data: responseData, status, headers: {}, config };
    throw err;
  }

  return {
    data: responseData,
    status,
    statusText: "OK",
    headers: {},
    config,
  };
};

// Response Interceptor: If backend server is unreachable or offline, automatically fallback to mockAdapter!
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const isProxyError = error.response && (error.response.status === 500 || error.response.status === 502 || error.response.status === 504) && !error.response.data?.user && !error.response.data?.error;
    const isNetworkError = !error.response || error.code === 'ERR_NETWORK';

    if (isNetworkError || isProxyError) {
      console.warn("Backend server not responding, fulfilling via fallback local engine:", error.config?.url);
      return mockAdapter(error.config);
    }
    return Promise.reject(error);
  }
);

// Initial check for backend availability
const checkBackend = async () => {
  try {
    const res = await fetch("/api/health");
    if (res.ok) {
      console.log("🔗 Connected to live Ignited Minds Backend API");
      return;
    }
  } catch (e) {
    // Offline
  }
  console.log("⚡ Standalone mode active: Local engine running");
  api.defaults.adapter = mockAdapter;
};

checkBackend();

export default api;
