import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowLeft, Square, CheckCircle, FileText, Info, HelpCircle } from 'lucide-react'
import { useState } from 'react'

export default function DocumentStudy() {
  const navigate = useNavigate()
  const [textToCheck, setTextToCheck] = useState('')
  
  const [checklist, setChecklist] = useState([
    { id: 'c1', text: 'Cross-reference names, entities, and email addresses for consistency', checked: false },
    { id: 'c2', text: 'Verify dates, times, timeline consistency, and numerical logic', checked: false },
    { id: 'c3', text: 'Check styling, formatting, font sizes, margins, and header hierarchies', checked: false },
    { id: 'c4', text: 'Inspect hyperlinks, references, footnotes, and external citations', checked: false },
    { id: 'c5', text: 'Read aloud to check spelling, grammar, active voice, and readability flow', checked: false },
    { id: 'c6', text: 'Search for placeholders (TODO, draft, xxx, Lorem Ipsum, [Insert Name])', checked: false },
    { id: 'c7', text: 'Verify logic, terms consistency, definitions alignment, and signature blocks', checked: false }
  ])

  function toggleCheck(id: string) {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item))
  }

  // Text metrics calculation
  const charCount = textToCheck.length
  const wordCount = textToCheck.trim() === '' ? 0 : textToCheck.trim().split(/\s+/).length
  const lineCount = textToCheck === '' ? 0 : textToCheck.split('\n').length
  
  // Basic warnings checker
  const hasPlaceholders = /todo|xxx|draft|insert|lorem/i.test(textToCheck)
  const hasDoubleSpaces = /\s{2,}/.test(textToCheck)

  return (
    <div className="relative w-full min-h-[100vh] flex flex-col items-center pb-20 px-6 pt-10 z-10">
      <div className="w-full max-w-4xl">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
          <span className="font-semibold tracking-wide">Back to Elle</span>
        </button>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold text-white mb-8 text-readable tracking-tight"
        >
          Document Proofing & Verification
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Instructions Column */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Guide section */}
            <div className="liquid-glass rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="text-white/80" size={20} />
                <h2 className="text-white font-bold text-lg">Proofreading Strategy</h2>
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-4">
                Verification requires high attentiveness and systematic evaluation. Do not scan — read word-for-word. Apply these professional methodologies:
              </p>
              <div className="space-y-3.5 text-xs text-white/80 leading-relaxed font-medium">
                <div className="flex gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</div>
                  <p>
                    <span className="text-white font-semibold">Separate Passes:</span> Proofread for one issue at a time (e.g. check formatting first, then names, then numbers, then logic).
                  </p>
                </div>
                <div className="flex gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</div>
                  <p>
                    <span className="text-white font-semibold">Verify Key Data points:</span> Match invoice figures, signature blocks, page numbers, and definitions directly against sources.
                  </p>
                </div>
                <div className="flex gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</div>
                  <p>
                    <span className="text-white font-semibold">Backward Reading:</span> Reading sentences starting from the end of the document helps isolate spelling errors from context.
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Checklist */}
            <div className="liquid-glass rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-4">Verification Checklist</h2>
              <div className="flex flex-col gap-3">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleCheck(item.id)}
                    className={`flex items-start gap-3 p-3.5 rounded-xl transition-all cursor-pointer ${
                      item.checked ? 'bg-white/5 opacity-60' : 'bg-white/8 hover:bg-white/12'
                    }`}
                  >
                    <div className="text-white mt-0.5">
                      {item.checked ? (
                        <CheckCircle size={18} className="text-pink-300" />
                      ) : (
                        <Square size={18} className="text-white/40" />
                      )}
                    </div>
                    <span className={`text-xs font-semibold leading-relaxed ${item.checked ? 'line-through text-white/40' : 'text-white/80'}`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Tools Column */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Analyzer Tool */}
            <div className="liquid-glass rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-4">Live Analyzer Playground</h2>
              <textarea
                value={textToCheck}
                onChange={(e) => setTextToCheck(e.target.value)}
                placeholder="Paste text here to run validation metrics..."
                className="w-full h-44 bg-white/5 border border-white/10 rounded-xl p-3.5 text-xs text-white font-semibold placeholder:text-white/20 outline-none focus:border-white/25 transition-colors resize-none mb-4"
              />
              
              {/* Stats panel */}
              <div className="grid grid-cols-3 gap-2.5 mb-4">
                <div className="bg-white/8 rounded-lg p-2.5 text-center">
                  <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Words</p>
                  <p className="text-base text-white font-bold mt-0.5">{wordCount}</p>
                </div>
                <div className="bg-white/8 rounded-lg p-2.5 text-center">
                  <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Chars</p>
                  <p className="text-base text-white font-bold mt-0.5">{charCount}</p>
                </div>
                <div className="bg-white/8 rounded-lg p-2.5 text-center">
                  <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Lines</p>
                  <p className="text-base text-white font-bold mt-0.5">{lineCount}</p>
                </div>
              </div>

              {/* Live issue helper */}
              <div className="space-y-2">
                {textToCheck.trim() !== '' && (
                  <>
                    {hasPlaceholders && (
                      <div className="flex gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-xs">
                        <Info size={16} className="shrink-0 mt-0.5" />
                        <p className="font-semibold">Placeholder warning: Found drafts, TODOs, or empty tags.</p>
                      </div>
                    )}
                    {hasDoubleSpaces && (
                      <div className="flex gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-200 text-xs">
                        <Info size={16} className="shrink-0 mt-0.5" />
                        <p className="font-semibold">Format warning: Found multiple consecutive spaces.</p>
                      </div>
                    )}
                    {!hasPlaceholders && !hasDoubleSpaces && (
                      <div className="flex gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-300 text-xs">
                        <CheckCircle size={16} className="shrink-0 mt-0.5" />
                        <p className="font-semibold">Formatting scan: No basic anomalies detected.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Verification tips card */}
            <div className="liquid-glass rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle size={18} className="text-white/80" />
                <h3 className="text-white font-bold text-sm">Verification Pro-tips</h3>
              </div>
              <ul className="text-xs text-white/60 font-semibold space-y-2.5 leading-relaxed list-disc list-inside">
                <li>Double check matching of opening and closing parentheses.</li>
                <li>Make sure date format remains uniform throughout.</li>
                <li>Pay special attention to decimal placements in lists of figures.</li>
                <li>Verify header numbering alignment (e.g. 1.1 follows 1.0).</li>
              </ul>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
