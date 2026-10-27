import React, { useState } from 'react';
import { X, Globe, Copy, Check, ExternalLink, Heart, Sparkles, Smartphone, Monitor } from 'lucide-react';

interface PublishGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
}

export const PublishGuideModal: React.FC<PublishGuideModalProps> = ({
  isOpen,
  onClose,
  recipientName,
}) => {
  const [activeTab, setActiveTab] = useState<'vercel' | 'github' | 'netlify' | 'preview'>('preview');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="glass-panel-deep rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-white/80 scrapbook-paper relative">
        {/* Header */}
        <div className="p-5 border-b border-pink-200/50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-pink-600" />
            <div>
              <h3 className="font-serif-romantic text-xl sm:text-2xl font-bold text-slate-900">
                Beginner&apos;s Publishing &amp; Sharing Guide
              </h3>
              <p className="text-xs text-slate-600">
                How to host and share this romantic surprise with {recipientName || 'your girlfriend'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-white/60 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs with Glassmorphism */}
        <div className="flex items-center gap-1.5 px-5 py-2.5 bg-white/40 backdrop-blur-xs border-b border-pink-200/50 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'preview' ? 'glass-panel text-pink-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900 glass-button'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fastest: Send Direct Link</span>
          </button>
          <button
            onClick={() => setActiveTab('vercel')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'vercel' ? 'glass-panel text-pink-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900 glass-button'
            }`}
          >
            <span>Vercel (Free 1-Click)</span>
          </button>
          <button
            onClick={() => setActiveTab('netlify')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'netlify' ? 'glass-panel text-pink-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900 glass-button'
            }`}
          >
            <span>Netlify (Drag &amp; Drop)</span>
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'github' ? 'glass-panel text-pink-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900 glass-button'
            }`}
          >
            <span>GitHub Pages</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs sm:text-sm text-slate-700">
          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl glass-panel-subtle border border-white/60">
                <h4 className="font-semibold text-pink-900 mb-1 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                  <span>Immediate Sharing via AI Studio Shared URL</span>
                </h4>
                <p className="text-pink-800 leading-relaxed text-xs">
                  Your app is already hosted live! You can share the link directly with your girlfriend right now. It works seamlessly on Android phones, iPhones, tablets, and computers.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl glass-panel-subtle border border-white/60">
                  <div className="text-xs text-slate-700 mb-1 font-semibold">How she experiences it:</div>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600">
                    <li>She opens the link on her phone or computer.</li>
                    <li>The playful question appears: &ldquo;Do you want a surprise?&rdquo;</li>
                    <li>If she tries clicking &ldquo;No&rdquo;, the cute pleading kitten begs her to retry! 🐱</li>
                    <li>When she taps &ldquo;YES&rdquo;, the romantic music box starts playing, and the digital scrapbook opens.</li>
                    <li>She can flip through polaroid memories, unfold your love letter, flip reason cards, and unwrap her birthday cake and pass!</li>
                  </ol>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 pt-2">
                  <span className="flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-pink-500" /> Mobile &amp; Android Optimized
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Monitor className="w-4 h-4 text-pink-500" /> Desktop &amp; Tablet Ready
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vercel' && (
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900">
                Publishing to Vercel (100% Free Custom Domain)
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Vercel is the easiest, fastest free hosting for React/Vite websites.
              </p>

              <ol className="list-decimal list-inside space-y-2 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <li>Create a free account on <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-pink-600 underline">vercel.com</a></li>
                <li>Push this repository or upload the project folder to GitHub.</li>
                <li>In Vercel dashboard, click <strong>&ldquo;Add New... Project&rdquo;</strong> and select your repository.</li>
                <li>Vercel auto-detects Vite:
                  <div className="bg-slate-900 text-slate-200 p-2.5 rounded-lg mt-1 font-mono text-[11px] flex justify-between items-center">
                    <span>Build Command: npm run build</span>
                    <button onClick={() => copyToClipboard('npm run build', 1)} className="hover:text-white">
                      {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </li>
                <li>Click <strong>&ldquo;Deploy&rdquo;</strong>! In under 60 seconds, you get a custom URL like <code className="text-pink-600">sarah-birthday.vercel.app</code>!</li>
              </ol>
            </div>
          )}

          {activeTab === 'netlify' && (
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900">
                Publishing to Netlify (Drag &amp; Drop Option)
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                You don&apos;t even need Git for this method!
              </p>

              <ol className="list-decimal list-inside space-y-2 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <li>Run <code className="bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded">npm run build</code> in the terminal. This creates a <code className="font-mono">dist</code> folder.</li>
                <li>Go to <a href="https://app.netlify.com/drop" target="_blank" rel="noreferrer" className="text-pink-600 underline">app.netlify.com/drop</a> (free Netlify Drop).</li>
                <li>Drag and drop the <code className="font-mono">dist</code> folder right into the browser window.</li>
                <li>Netlify instantly gives you a live public link to share!</li>
              </ol>
            </div>
          )}

          {activeTab === 'github' && (
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900">
                Publishing to GitHub Pages
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <li>Commit and push the code to a public GitHub repository.</li>
                <li>In your repository, go to <strong>Settings &gt; Pages</strong>.</li>
                <li>Under <strong>Build and deployment</strong>, choose <strong>GitHub Actions</strong>.</li>
                <li>Select the <strong>Vite / Static HTML</strong> workflow template and click <strong>Commit changes</strong>.</li>
                <li>Your site will be live at <code className="text-pink-600">username.github.io/repo-name</code>.</li>
              </ol>
            </div>
          )}
        </div>

        {/* Footer with Glassmorphism */}
        <div className="p-4 border-t border-pink-200/50 flex items-center justify-between bg-white/40 backdrop-blur-md">
          <span className="text-xs text-slate-700 font-handwriting text-base">
            Made with all the love in the world 💖
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-medium text-white glass-button-primary shadow-lg shadow-pink-400/30 cursor-pointer transition-all"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
