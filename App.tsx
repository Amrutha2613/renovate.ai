
import React, { useState, useEffect } from 'react';
import BuildingForm from './components/BuildingForm';
import ResultView from './components/ResultView';
import Chatbot from './components/Chatbot';
import { translations, Language } from './translations';
import { PlanningInput, GeneratedVisuals } from './types';
import { generateBuildingImages } from './services/geminiService';

// Removed declare global block for aistudio to avoid modifier mismatch with the environment's pre-configured types.
// We assume window.aistudio is accessible as per guidelines and use type casting where needed.

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [view, setView] = useState<'form' | 'result'>('form');
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  
  const [formData, setFormData] = useState<PlanningInput>({
    plotArea: '',
    plotLength: '',
    plotBreadth: '',
    buildingType: 'Residential',
    floors: '1',
    numRooms: '3',
    locationType: 'Urban',
    budget: 'Medium',
    style: 'Modern',
    primaryColor: 'White',
    shade: 'Light',
    accentColor: '',
    rooms: [
      { id: '1', name: 'Master Bedroom', color: 'Cream' },
      { id: '2', name: 'Kitchen', color: 'Light Gray' },
      { id: '3', name: 'Living Room', color: 'Beige' }
    ]
  });

  const [visuals, setVisuals] = useState<GeneratedVisuals | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const T = translations[lang];

  useEffect(() => {
    // Check if the user has already selected an API key. 
    // Using (window as any) to bypass local declaration conflicts with the platform's injected types.
    const checkKey = async () => {
      const selected = await (window as any).aistudio.hasSelectedApiKey();
      setHasKey(selected);
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    // Trigger the selection dialog and proceed assuming success as per the race condition guidelines.
    await (window as any).aistudio.openSelectKey();
    setHasKey(true);
  };

  const handleSubmit = async () => {
    if (!formData.plotArea || !formData.plotLength || !formData.plotBreadth) {
      alert(T.validationError);
      return;
    }

    setIsLoading(true);
    try {
      const result = await generateBuildingImages(formData, lang);
      setVisuals(result);
      setView('result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      console.error(error);
      // If the request fails due to key configuration, reset state to prompt selection again.
      if (error.message?.includes("Requested entity was not found")) {
        setHasKey(false);
        alert("API Key configuration error. Please re-select your key.");
      } else {
        alert(T.genericError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (hasKey === false) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex items-center justify-center p-6 z-[100]">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
            <i className="fas fa-key"></i>
          </div>
          <h2 className="text-2xl font-black mb-4 text-slate-900">API Key Required</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            To generate high-quality clear architectural visualizations, you must select an API key from a paid Google Cloud project.
          </p>
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-indigo-600 font-bold hover:underline block mb-8"
          >
            Learn about Gemini API billing
          </a>
          <button 
            onClick={handleSelectKey}
            className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-indigo-700 transition-all active:scale-95"
          >
            Select API Key
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12 bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-indigo-200 ring-2 ring-indigo-50">
              <i className="fas fa-drafting-compass"></i>
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">{T.title}</h1>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1 opacity-70">{T.subtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
            <button 
              onClick={() => setLang('en')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${lang === 'en' ? 'bg-white text-indigo-700 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
            >
              EN
            </button>
            <button 
              onClick={() => setLang('te')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${lang === 'te' ? 'bg-white text-indigo-700 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
            >
              తెలుగు
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        {view === 'form' ? (
          <BuildingForm 
            data={formData} 
            onChange={setFormData} 
            onSubmit={handleSubmit}
            isLoading={isLoading}
            lang={lang}
          />
        ) : (
          visuals && <ResultView visuals={visuals} onBack={() => setView('form')} lang={lang} />
        )}
      </main>

      {/* Persistent Chatbot */}
      <Chatbot designContext={formData} lang={lang} />
    </div>
  );
};

export default App;
