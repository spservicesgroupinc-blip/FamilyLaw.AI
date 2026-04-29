import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import DisclaimerModal from './components/DisclaimerModal';
import { Auth } from './components/Auth';
import { OnboardingWizard } from './components/OnboardingWizard';
import { ViewMode, CaseFile, ChatMessage, UserProfile } from './types';
import { Icons } from './constants';
import { geminiService } from './services/geminiService';
import { Part } from '@google/genai';
import { generatePDF } from './lib/pdf';
import { api, UserSession } from './services/api';

// --- FILE MANAGER COMPONENT ---
const FileManager: React.FC<{ files: CaseFile[]; tenantId: string; onUpload: (f: CaseFile) => void; onDelete: (id: string) => void }> = ({ files, tenantId, onUpload, onDelete }) => {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
        const uploadedFile = await api.uploadFile(tenantId, file);
        const newFile: CaseFile = {
            id: uploadedFile.id,
            name: uploadedFile.name,
            type: uploadedFile.type,
            content: "[Cloud File]",
            dateAdded: uploadedFile.dateAdded,
        };
        onUpload(newFile);
    } catch (error) {
        alert("Error uploading file.");
        console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
      try {
          await api.deleteFile(tenantId, id);
          onDelete(id);
      } catch (e) {
          alert("Error deleting file.");
          console.error(e);
      }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto h-full overflow-y-auto legal-scroll">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
        <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-legal-900">Case Files</h2>
            <p className="text-sm md:text-base text-legal-600 mt-1 md:mt-2">Upload motions, orders, and evidence (PDF, Text, Images). Files are saved to your account and accessible from any device.</p>
        </div>
        <label className="w-full sm:w-auto flex justify-center items-center gap-2 bg-legal-900 hover:bg-legal-800 text-legal-50 px-4 py-3 md:py-2 rounded-lg cursor-pointer transition shadow-sm border border-legal-800">
          <Icons.Upload className="w-4 h-4" />
          <span className="text-sm font-medium uppercase tracking-wider">Upload Document</span>
          <input 
            type="file" 
            className="hidden" 
            onChange={handleFileChange} 
            accept=".txt,.md,.json,.csv,.pdf,.jpg,.jpeg,.png" 
          />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {files.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white rounded-xl border-2 border-dashed border-legal-200">
                <Icons.Document className="w-8 h-8 mx-auto text-legal-300" />
                <p className="text-legal-500 mt-4">No files stored. Upload documents to give the AI context.</p>
            </div>
        )}
        {files.map(file => (
          <div key={file.id} className="bg-white p-6 rounded-xl shadow-sm border border-legal-200 hover:border-legal-400 hover:shadow-md transition relative group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-legal-50 text-legal-700 rounded-lg border border-legal-100">
                <Icons.Document className="w-5 h-5" />
              </div>
              <button 
                onClick={() => handleDelete(file.id)} 
                className="text-legal-300 hover:text-red-600 transition-colors"
                title="Delete File"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
              </button>
            </div>
            <h3 className="font-serif font-bold text-legal-900 truncate" title={file.name}>{file.name}</h3>
            <p className="text-xs text-legal-500 mt-1 uppercase tracking-wider">Added: {new Date(file.dateAdded).toLocaleDateString()}</p>
            <div className="mt-4 pt-4 border-t border-legal-100">
                <div className="flex items-center gap-2 text-xs text-legal-700 bg-legal-50 p-2 rounded border border-legal-100">
                    <span className="font-bold uppercase tracking-wider">{file.type.split('/')[1]}</span>
                    <span className="text-legal-400">• Saved to Cloud</span>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- RESEARCH COMPONENT ---
const ResearchTool: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ text: string; sources: { title: string; uri: string }[] } | null>(null);

  const handleResearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await geminiService.researchLegalPrecedent(query);
      setResult(data);
    } catch (e) {
      alert("Research failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-legal-900">Deep Legal Research</h2>
        {result && (
          <button 
            onClick={() => generatePDF('research-report', 'Legal_Research_Report.pdf')}
            className="w-full sm:w-auto flex justify-center items-center gap-2 bg-legal-100 hover:bg-legal-200 text-legal-800 px-4 py-2 rounded-lg font-medium transition-colors border border-legal-200 text-sm uppercase tracking-wider"
          >
            <Icons.Download className="w-4 h-4" />
            Save PDF
          </button>
        )}
      </div>
      <p className="text-sm md:text-base text-legal-600 mb-6 md:mb-8">
        <span className="bg-legal-100 text-legal-800 border border-legal-200 text-[10px] px-2 py-1 rounded-full font-bold mr-2 uppercase tracking-wider">MULTI-MODEL</span>
        Running parallel analysis with Gemini 3 Pro (Case Law) and Gemini 3 Flash (Statutes).
      </p>

      <div className="relative mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row gap-2">
            <input
            type="text"
            className="w-full p-3 md:p-4 pl-4 md:pl-5 rounded-lg border border-legal-200 focus:border-legal-500 focus:ring-1 focus:ring-legal-500 outline-none shadow-sm font-serif text-sm md:text-base"
            placeholder="e.g., Criteria for modifying child custody in Indiana when parent relocates..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleResearch()}
            />
            <button 
                onClick={handleResearch}
                disabled={loading}
                className="w-full sm:w-auto bg-legal-900 text-legal-50 px-8 py-3 md:py-0 rounded-lg font-medium hover:bg-legal-800 disabled:opacity-50 transition-colors uppercase tracking-wider text-sm border border-legal-800"
            >
                {loading ? 'Analyzing...' : 'Research'}
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto legal-scroll bg-white rounded-xl shadow-sm border border-legal-200 p-4 md:p-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-legal-400 animate-pulse">
            <Icons.Search className="w-8 h-8 mb-4" />
            <p className="font-serif font-bold text-lg text-legal-800">Deploying Multi-Agent Swarm...</p>
            <p className="text-sm mt-2 text-legal-500">Gemini 3 Pro: Analyzing Case Law</p>
            <p className="text-sm text-legal-500">Gemini 3 Flash: Checking Title 31</p>
          </div>
        ) : result ? (
          <div id="research-report" className="space-y-6 p-4">
             <div className="prose max-w-none text-legal-800 font-serif leading-relaxed whitespace-pre-wrap">
                <div dangerouslySetInnerHTML={{ __html: result.text
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/^# (.*)/gm, '<h1 class="text-2xl font-bold text-legal-900 mb-4 pb-2 border-b border-legal-200">$1</h1>')
                    .replace(/^## (.*)/gm, '<h2 class="text-xl font-bold text-legal-800 mb-3 mt-6">$1</h2>') 
                    .replace(/Case Law Analysis/g, '🏛️ Case Law Analysis')
                    .replace(/Statutory & Procedural Framework/g, '📜 Statutory & Procedural Framework')
                }} />
             </div>
             
             {result.sources.length > 0 && (
                 <div className="mt-8 pt-6 border-t border-legal-100">
                     <h3 className="text-xs font-bold text-legal-500 uppercase tracking-widest mb-4">Citations & Sources</h3>
                     <div className="grid gap-3">
                         {result.sources.map((source, idx) => (
                             <a key={idx} href={source.uri} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-legal-50 hover:bg-legal-100 border border-legal-100 rounded-lg group transition text-sm">
                                 <span className="font-medium text-legal-800 truncate max-w-[80%]">{source.title}</span>
                                 <span className="text-legal-400 group-hover:text-legal-600 shrink-0 uppercase tracking-wider text-[10px] font-bold">Open &rarr;</span>
                             </a>
                         ))}
                     </div>
                 </div>
             )}
          </div>
        ) : (
          <div className="text-center text-legal-400 mt-20">
            <p className="font-serif italic">Enter a legal query to begin deep research.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MOTION DRAFTER COMPONENT ---
const MotionDrafter: React.FC<{ files: CaseFile[], userProfile: UserProfile | null }> = ({ files, userProfile }) => {
  const [topic, setTopic] = useState('');
  const [instructions, setInstructions] = useState('');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDraft = async () => {
    if (!topic || !instructions) return;
    setLoading(true);
    try {
      const profileContext = userProfile ? `User Profile: Name: ${userProfile.name}, Address: ${userProfile.address}, Spouse: ${userProfile.spouseName}, Children: ${userProfile.children.map(c => `${c.name} (${c.age})`).join(', ')}. ` : '';
      const result = await geminiService.draftMotion(topic, files, profileContext + instructions);
      setDraft(result);
    } catch (e) {
      alert("Drafting failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
    alert("Copied to clipboard!");
  };

  return (
    <div className="flex flex-col md:flex-row h-full md:overflow-hidden overflow-y-auto">
      {/* Inputs */}
      <div className="w-full md:w-1/3 p-4 md:p-6 border-b md:border-b-0 md:border-r border-legal-200 bg-legal-50 md:overflow-y-auto shrink-0">
        <h2 className="text-xl md:text-2xl font-serif font-bold text-legal-900 mb-4 md:mb-6">Draft Motion</h2>
        
        <div className="space-y-4">
            <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-legal-600 mb-2">Motion Type</label>
                <input 
                    className="w-full p-3 border border-legal-200 rounded focus:border-legal-500 focus:ring-1 focus:ring-legal-500 outline-none font-serif" 
                    placeholder="e.g., Motion to Modify Parenting Time"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                />
            </div>
            
            <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-legal-600 mb-2">Specific Facts/Instructions</label>
                <textarea 
                    className="w-full p-3 border border-legal-200 rounded focus:border-legal-500 focus:ring-1 focus:ring-legal-500 outline-none h-40 font-serif" 
                    placeholder="Enter key facts (dates, names, events) to be included in the motion..."
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                />
            </div>
            
            <div className="p-4 bg-white rounded border border-legal-200">
                <p className="text-[10px] text-legal-500 uppercase tracking-widest font-bold mb-3">Context ({files.length} files available)</p>
                <div className="flex flex-wrap gap-2">
                    {files.map(f => (
                        <span key={f.id} className="text-[10px] bg-legal-100 text-legal-800 border border-legal-200 px-2 py-1 rounded truncate max-w-[150px] font-medium">{f.name}</span>
                    ))}
                    {files.length === 0 && <span className="text-[10px] text-legal-400 italic font-serif">No files. Draft will be generic.</span>}
                </div>
            </div>

            <button 
                onClick={handleDraft}
                disabled={loading}
                className="w-full py-3 bg-legal-900 hover:bg-legal-800 text-legal-50 font-medium uppercase tracking-wider text-sm rounded shadow-sm transition disabled:opacity-50 border border-legal-800"
            >
                {loading ? 'Drafting...' : 'Generate Motion'}
            </button>
        </div>
      </div>

      {/* Editor/Preview */}
      <div className="w-full md:w-2/3 p-4 md:p-8 bg-white md:overflow-y-auto legal-scroll relative min-h-[500px] md:min-h-0">
        {draft ? (
            <div className="max-w-3xl mx-auto shadow-sm border border-legal-200 p-6 md:p-12 min-h-[800px] font-serif leading-relaxed text-legal-900 whitespace-pre-wrap bg-white relative text-sm md:text-base">
                <div className="absolute top-4 right-4 flex gap-2">
                    <button 
                        onClick={handleCopy}
                        className="text-[10px] uppercase tracking-widest font-bold bg-legal-100 hover:bg-legal-200 px-3 py-2 rounded text-legal-700 transition-colors"
                    >
                        Copy Text
                    </button>
                    <button 
                        onClick={() => generatePDF('motion-draft', 'Drafted_Motion.pdf')}
                        className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold bg-legal-100 hover:bg-legal-200 px-3 py-2 rounded text-legal-700 transition-colors"
                    >
                        <Icons.Download className="w-3 h-3" />
                        Save PDF
                    </button>
                </div>
                <div id="motion-draft" className="pt-8">
                    {draft}
                </div>
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center h-full text-legal-300">
                <Icons.Scale className="w-12 h-12 mb-4" />
                <p className="font-serif font-bold text-lg text-legal-600">Draft preview will appear here</p>
                <p className="text-sm mt-2 text-legal-400 max-w-xs text-center italic font-serif">AI will apply standard Indiana Trial Rules formatting.</p>
            </div>
        )}
      </div>
    </div>
  );
};

// --- ASSISTANT (CHAT) COMPONENT ---
const Assistant: React.FC<{ files: CaseFile[], userProfile: UserProfile | null, session: UserSession }> = ({ files, userProfile, session }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '1', role: 'model', text: `Hello. I am FamilyLaw.AI, your AI Partner in Family Court. I can help you understand statutes, analyze your case files, or plan your legal strategy. ${userProfile ? `I see you are ${userProfile.name}, and I can help you with your case involving your spouse, ${userProfile.spouseName}.` : ''} How can I help you today?`, timestamp: Date.now() }
    ]);
    const [input, setInput] = useState('');
    const [thinking, setThinking] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    const handleSend = async () => {
        if(!input.trim()) return;

        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setThinking(true);

        const history: {role: string, parts: Part[]}[] = messages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));
        
        // Add profile to context
        const context = userProfile ? `User Profile: Name: ${userProfile.name}, Address: ${userProfile.address}, Spouse: ${userProfile.spouseName}, Children: ${userProfile.children.map(c => `${c.name} (${c.age})`).join(', ')}. ` : '';

        try {
            const responseText = await geminiService.chatWithExpert(context + userMsg.text, files, history);
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: responseText, timestamp: Date.now() }]);
        } catch (e) {
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "I encountered an error. Please try again.", timestamp: Date.now() }]);
        } finally {
            setThinking(false);
        }
    };

    const handleSave = async () => {
        try {
            const title = messages[messages.length - 1].text.substring(0, 30) + "...";
            await api.saveChat(session.tenantId, title, messages);
            alert("Chat saved successfully!");
        } catch(e) {
            alert("Failed to save chat.");
        }
    };

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, thinking]);

    return (
        <div className="flex flex-col h-full bg-legal-50 relative">
            <div className="flex justify-between items-center p-3 md:p-4 border-b border-legal-200 bg-white">
                <h2 className="text-lg md:text-xl font-serif font-bold text-legal-900">AI Assistant</h2>
                <div className="flex gap-2">
                    <button 
                        onClick={handleSave}
                        className="flex items-center gap-1 md:gap-2 bg-legal-900 text-legal-50 px-2 py-1.5 md:px-3 rounded font-medium transition-colors border border-legal-800 text-[10px] md:text-xs uppercase tracking-wider"
                    >
                        Save Chat
                    </button>
                    <button 
                        onClick={() => generatePDF('chat-history', 'Chat_History.pdf')}
                        className="flex items-center gap-1 md:gap-2 bg-legal-100 hover:bg-legal-200 text-legal-800 px-2 py-1.5 md:px-3 rounded font-medium transition-colors border border-legal-200 text-[10px] md:text-xs uppercase tracking-wider"
                    >
                        <Icons.Download className="w-3 h-3" />
                        <span className="hidden sm:inline">Save Chat PDF</span>
                        <span className="sm:hidden">Save</span>
                    </button>
                </div>
            </div>
            <div id="chat-history" className="flex-1 overflow-y-auto p-3 md:p-8 space-y-4 md:space-y-6">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] md:max-w-[70%] p-5 rounded-2xl shadow-sm ${
                            msg.role === 'user' 
                            ? 'bg-legal-900 text-legal-50 rounded-br-sm border border-legal-800' 
                            : 'bg-white text-legal-900 border border-legal-200 rounded-bl-sm'
                        }`}>
                            <div className="prose prose-sm max-w-none font-serif leading-relaxed text-[15px]">
                                <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                            </div>
                        </div>
                    </div>
                ))}
                {thinking && (
                    <div className="flex justify-start">
                        <div className="bg-white p-5 rounded-2xl rounded-bl-sm border border-legal-200 shadow-sm flex gap-2 items-center">
                            <div className="w-2 h-2 bg-legal-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-legal-400 rounded-full animate-bounce delay-75"></div>
                            <div className="w-2 h-2 bg-legal-400 rounded-full animate-bounce delay-150"></div>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            <div className="p-3 md:p-4 bg-white border-t border-legal-200">
                <div className="max-w-4xl mx-auto flex gap-2 md:gap-3">
                    <input 
                        type="text" 
                        className="flex-1 border border-legal-200 rounded-lg px-3 py-2 md:px-4 md:py-3 focus:border-legal-500 focus:ring-1 focus:ring-legal-500 outline-none font-serif text-sm md:text-base"
                        placeholder="Ask a question about Indiana law or your case files..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        disabled={thinking}
                    />
                    <button 
                        onClick={handleSend}
                        disabled={thinking || !input.trim()}
                        className="bg-legal-900 text-legal-50 px-4 py-2 md:px-8 md:py-3 rounded-lg font-medium uppercase tracking-wider text-xs md:text-sm hover:bg-legal-800 disabled:opacity-50 transition-colors border border-legal-800"
                    >
                        Send
                    </button>
                </div>
                <p className="text-center text-[8px] md:text-[10px] text-legal-400 mt-2 md:mt-3 uppercase tracking-widest font-bold">FamilyLaw.AI can make mistakes. Verify important information.</p>
            </div>
        </div>
    );
};

// --- PROFILE & SETTINGS COMPONENT ---
const ProfileSettings: React.FC<{ session: UserSession, userProfile: UserProfile | null, onLogout: () => void }> = ({ session, userProfile, onLogout }) => {
    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto h-full overflow-y-auto legal-scroll">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-legal-900 mb-6 md:mb-8">Profile & Settings</h2>
            
            <div className="space-y-6">
                {/* Personal Info Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-legal-200 relative">
                    <h3 className="text-lg font-serif font-bold text-legal-900 mb-4 border-b border-legal-100 pb-2">Account Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest font-bold text-legal-600 mb-1">Full Name</label>
                            <input disabled type="text" value={userProfile?.name || session.name} className="w-full p-3 border border-legal-200 rounded outline-none font-serif text-sm bg-legal-50" />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest font-bold text-legal-600 mb-1">Email Address</label>
                            <input disabled type="email" value={session.email} className="w-full p-3 border border-legal-200 rounded outline-none font-serif text-sm bg-legal-50" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-[10px] uppercase tracking-widest font-bold text-legal-600 mb-1">Role</label>
                            <input disabled type="text" value={session.role} className="w-full p-3 border border-legal-200 rounded outline-none font-serif text-sm bg-legal-50" />
                        </div>
                        {userProfile && (
                            <>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] uppercase tracking-widest font-bold text-legal-600 mb-1">Address</label>
                                    <input disabled type="text" value={userProfile.address} className="w-full p-3 border border-legal-200 rounded outline-none font-serif text-sm bg-legal-50" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] uppercase tracking-widest font-bold text-legal-600 mb-1">Spouse Name</label>
                                    <input disabled type="text" value={userProfile.spouseName} className="w-full p-3 border border-legal-200 rounded outline-none font-serif text-sm bg-legal-50" />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Data Management Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-legal-200">
                    <h3 className="text-lg font-serif font-bold text-legal-900 mb-4 border-b border-legal-100 pb-2">Session Management</h3>
                    <p className="text-sm text-legal-600 mb-4">You are currently logged in. Your data is securely stored in Google Drive and Google Sheets.</p>
                    
                    <button onClick={onLogout} className="bg-legal-900 text-legal-50 px-6 py-2 rounded-lg font-medium hover:bg-legal-800 transition-colors uppercase tracking-wider text-xs">Sign Out</button>
                </div>
                
                {/* Subscription Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-legal-200">
                    <h3 className="text-lg font-serif font-bold text-legal-900 mb-4 border-b border-legal-100 pb-2">Subscription</h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-legal-900">SaaS Tier</p>
                            <p className="text-xs text-legal-500">Cloud storage. Standard AI models.</p>
                        </div>
                        <span className="bg-legal-100 text-legal-800 border border-legal-200 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">Active</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MAIN APP ---
const App: React.FC = () => {
  const [session, setSession] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('ff_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('ff_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [loadingProfile, setLoadingProfile] = useState(false);

  const handleLogin = (newSession: UserSession) => {
    setSession(newSession);
    localStorage.setItem('ff_session', JSON.stringify(newSession));
  };

  // Load profile when session changes
  useEffect(() => {
    if (session) {
      setLoadingProfile(true);
      api.getProfile(session.tenantId)
        .then(profile => {
            if (profile) {
                setUserProfile(profile);
                localStorage.setItem('ff_profile', JSON.stringify(profile));
            }
        })
        .catch(err => console.error("Failed to load profile:", err))
        .finally(() => setLoadingProfile(false));
    } else {
        setUserProfile(null);
        localStorage.removeItem('ff_profile');
    }
  }, [session]);

  const [view, setView] = useState<ViewMode>('dashboard');
  const [totalTokens, setTotalTokens] = useState(0);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  // Persistent State for Files
  const [files, setFiles] = useState<CaseFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  // Load files when session changes
  useEffect(() => {
    if (session) {
      setLoadingFiles(true);
      api.getFiles(session.tenantId)
        .then(data => {
            // Map backend format to frontend CaseFile format
            const mappedFiles = data.map(f => ({
                id: f.id,
                name: f.name,
                type: f.type,
                content: "[Cloud File]", // Content is not loaded fully to save memory
                dateAdded: f.dateAdded
            }));
            setFiles(mappedFiles);
        })
        .catch(err => console.error("Failed to load files:", err))
        .finally(() => setLoadingFiles(false));
    } else {
        setFiles([]);
    }
  }, [session]);

  // Subscribe to Token Updates
  useEffect(() => {
      geminiService.setTokenListener((count) => {
          setTotalTokens(prev => prev + count);
      });
  }, []);

  // Handle PWA Install Prompt
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };
  
  const [showRegister, setShowRegister] = useState(false);

  const handleLogout = () => {
      setSession(null);
      setUserProfile(null);
      localStorage.removeItem('ff_session');
      localStorage.removeItem('ff_profile');
      setView('dashboard');
  };

  if (showRegister) {
      return <OnboardingWizard
          mode="register"
          onCancel={() => setShowRegister(false)}
          onComplete={async (data) => {
              if (!data.account) return;
              try {
                  const newSession = await api.register(data.account.email, data.account.password, data.profile.name, data.account.role);
                  await api.saveProfile(newSession.tenantId, data.profile);
                  handleLogin(newSession);
                  setUserProfile(data.profile);
                  localStorage.setItem('ff_profile', JSON.stringify(data.profile));
                  setShowRegister(false);
              } catch (err: any) {
                  throw new Error(err.message || "Registration failed");
              }
          }}
      />;
  }

  if (!session) {
      return <Auth onLogin={handleLogin} onSignUpClick={() => setShowRegister(true)} />;
  }

  if (!userProfile && !loadingProfile) {
      return <OnboardingWizard
          mode="profile_only"
          onComplete={async (data) => {
              await api.saveProfile(session.tenantId, data.profile);
              setUserProfile(data.profile);
              localStorage.setItem('ff_profile', JSON.stringify(data.profile));
          }}
      />;
  }
  
  const Dashboard = () => (
    <div className="p-4 md:p-8 max-w-6xl mx-auto overflow-y-auto h-full">
      <div className="flex justify-between items-start mb-6 md:mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-legal-900 mb-1 md:mb-2">Welcome to FamilyLaw.AI</h1>
          <p className="text-sm md:text-lg text-legal-600">Your AI Partner in Family Court.</p>
        </div>
        {!!deferredPrompt && (
          <button onClick={handleInstallClick} className="md:hidden flex items-center gap-2 bg-legal-900 text-legal-50 px-3 py-2 rounded-lg text-[10px] uppercase tracking-wider font-bold shadow-sm">
            <Icons.Download className="w-4 h-4" />
            Install
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
         <div onClick={() => setView('assistant')} className="bg-legal-900 p-6 rounded-2xl shadow-sm text-legal-50 cursor-pointer transform hover:scale-[1.02] transition border border-legal-800">
            <div className="bg-legal-800 w-10 h-10 rounded-lg flex items-center justify-center mb-4 border border-legal-700">
                <Icons.Chat className="w-5 h-5 text-legal-200" />
            </div>
            <h3 className="text-xl font-serif font-bold mb-2">AI Assistant</h3>
            <p className="text-legal-300 text-sm leading-relaxed">Chat with an expert about your case strategy and questions.</p>
         </div>

         <div onClick={() => setView('research')} className="bg-white p-6 rounded-2xl shadow-sm border border-legal-200 cursor-pointer hover:border-legal-400 hover:shadow-md transition">
            <div className="bg-legal-50 w-10 h-10 rounded-lg flex items-center justify-center mb-4 text-legal-700 border border-legal-100">
                <Icons.Search className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-serif font-bold text-legal-900 mb-2">Legal Research</h3>
            <p className="text-legal-600 text-sm leading-relaxed">Find Indiana precedents, statutes (Title 31), and rules.</p>
         </div>

         <div onClick={() => setView('drafting')} className="bg-white p-6 rounded-2xl shadow-sm border border-legal-200 cursor-pointer hover:border-legal-400 hover:shadow-md transition">
            <div className="bg-legal-50 w-10 h-10 rounded-lg flex items-center justify-center mb-4 text-legal-700 border border-legal-100">
                <Icons.Scale className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-serif font-bold text-legal-900 mb-2">Draft Motions</h3>
            <p className="text-legal-600 text-sm leading-relaxed">Generate court-ready motions tailored to your facts.</p>
         </div>

         <div onClick={() => setView('files')} className="bg-white p-6 rounded-2xl shadow-sm border border-legal-200 cursor-pointer hover:border-legal-400 hover:shadow-md transition">
            <div className="bg-legal-50 w-10 h-10 rounded-lg flex items-center justify-center mb-4 text-legal-700 border border-legal-100">
                <Icons.Document className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-serif font-bold text-legal-900 mb-2">Case Files</h3>
            <p className="text-legal-600 text-sm leading-relaxed">Manage your evidence and documents securely.</p>
         </div>
      </div>
      
      <div className="mt-12 p-8 bg-white rounded-xl border border-legal-200">
          <h2 className="text-xl font-serif font-bold text-legal-900 mb-4">Recent Case Files</h2>
          {files.length === 0 ? (
              <p className="text-legal-400 italic">No recent files.</p>
          ) : (
              <ul className="divide-y divide-legal-100">
                  {files.slice(0, 3).map(f => (
                      <li key={f.id} className="py-3 flex justify-between text-sm">
                          <span className="font-medium text-legal-700">{f.name}</span>
                          <span className="text-legal-400">{new Date(f.dateAdded).toLocaleDateString()}</span>
                      </li>
                  ))}
              </ul>
          )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col-reverse md:flex-row bg-legal-50 h-[100dvh] font-sans overflow-hidden">
      <DisclaimerModal />
      <Sidebar 
        currentView={view} 
        onViewChange={setView} 
        tokenUsage={totalTokens}
        onInstall={handleInstallClick}
        canInstall={!!deferredPrompt}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 h-full overflow-hidden relative pt-safe">
        {view === 'dashboard' && <Dashboard />}
        {view === 'assistant' && <Assistant files={files} userProfile={userProfile} session={session!} />}
        {view === 'research' && <ResearchTool />}
        {view === 'drafting' && <MotionDrafter files={files} userProfile={userProfile} />}
        {view === 'files' && (
            <FileManager 
                files={files} 
                tenantId={session!.tenantId}
                onUpload={(f) => setFiles([...files, f])} 
                onDelete={(id) => setFiles(files.filter(f => f.id !== id))} 
            />
        )}
        {view === 'profile' && <ProfileSettings session={session!} userProfile={userProfile} onLogout={handleLogout} />}
      </main>
    </div>
  );
};

export default App;