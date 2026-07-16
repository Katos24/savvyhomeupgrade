'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Camera,
  Palette,
  ListChecks,
  Calendar,
  Plus,
  Check,
  Upload,
  X,
  ChevronDown,
} from 'lucide-react';

const font = "'Nunito', sans-serif";

// Bump this if the saved shape ever changes, so old localStorage data
// from a previous version of this demo doesn't get force-fed into a
// component expecting a different shape.
const STORAGE_KEY = 'demo-form-builder-v1';
const MAX_LOGO_BYTES = 5 * 1024 * 1024; // 5MB — the practical ceiling here is
// localStorage's own quota (~5-10MB per site, shared with everything else
// saved there), not an arbitrary choice. Going higher just means bigger
// files fail later at the storage step instead of with a clear message here.

// Muted, industry-appropriate palette instead of bright/playful tones —
// safety orange, steel navy, charcoal, hunter green, concrete gray, and a
// muted amber, all colors that read as professional trade branding rather
// than a consumer app.
const COLOR_PRESETS = ['#C2410C', '#1E3A5F', '#334155', '#166534', '#57534E', '#B45309'];

type QuestionType = 'text' | 'select' | 'yesno';

type CustomQuestion = {
  id: string;
  label: string;
  type: QuestionType;
  options?: string[]; // only used when type === 'select'
};

type BuilderState = {
  logo: string | null; // base64 data URL, browser-only — never sent anywhere
  color: string;
  address: boolean;
  dateTime: boolean;
  photo: boolean;
  questions: CustomQuestion[];
};

const DEFAULT_STATE: BuilderState = {
  logo: null,
  color: '#1E3A5F',
  address: true,
  dateTime: true,
  photo: true,
  questions: [],
};

// Darkens a hex color by a fixed factor — used to build a simple two-tone
// gradient header from whatever color the person picks.
function darkenHex(hex: string, factor = 0.72): string {
  const h = hex.replace('#', '');
  const r = Math.round(parseInt(h.substring(0, 2), 16) * factor);
  const g = Math.round(parseInt(h.substring(2, 4), 16) * factor);
  const b = Math.round(parseInt(h.substring(4, 6), 16) * factor);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function CalloutTag({ icon: Icon, text, className = '' }: { icon: any; text: string; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-sm transition-all duration-300 hover:border-slate-300 ${className}`}
    >
      <Icon size={14} className="text-emerald-600" />
      <span className="text-xs font-bold text-slate-700" style={{ fontFamily: font }}>{text}</span>
    </motion.div>
  );
}

function ToggleRow({
  label,
  icon: Icon,
  on,
  onToggle,
  color,
}: {
  label: string;
  icon: any;
  on: boolean;
  onToggle: () => void;
  color: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between py-2.5 text-left cursor-pointer"
      aria-pressed={on}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <Icon size={15} className="text-slate-400 shrink-0" />
        <span className="text-[13px] font-bold text-slate-700 truncate">{label}</span>
      </div>
      <div
        className="relative w-9 h-5 rounded-full shrink-0 transition-colors duration-300"
        style={{ backgroundColor: on ? color : '#e2e8f0' }}
      >
        <motion.div
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
          animate={{ left: on ? 18 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        />
      </div>
    </button>
  );
}

// ==========================================
// Main Exported Component — one static, genuinely interactive demo.
// No trade-cycling anymore: the person customizes THIS form themselves.
// State persists to localStorage only (see STORAGE_KEY above) — nothing
// is sent to a server or saved to a real database.
// ==========================================
export default function CustomizeFormSection() {
  const [state, setState] = useState<BuilderState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [draftQuestion, setDraftQuestion] = useState<{ label: string; type: QuestionType; options: string[] }>({
    label: '',
    type: 'text',
    options: [],
  });
  const [draftOption, setDraftOption] = useState('');
  const [logoError, setLogoError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load any previously saved demo state on mount (client-only — this
  // effect never runs during server rendering, so `window` is always safe
  // here).
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setState({ ...DEFAULT_STATE, ...JSON.parse(saved) });
    } catch {
      // Malformed or inaccessible storage (e.g. private browsing in some
      // browsers) — just fall back to defaults, demo still works in-memory.
    }
    setHydrated(true);
  }, []);

  // Persist on every change, but only after the initial load above has
  // finished — otherwise the very first render (before localStorage is
  // read) would immediately overwrite any saved data with the defaults.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Quota exceeded or storage blocked — fail silently. The demo keeps
      // working for this session, it just won't survive a refresh.
    }
  }, [state, hydrated]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoError('');
    if (!file.type.startsWith('image/')) {
      setLogoError('Please choose an image file.');
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setLogoError('Image is too large for this demo (max 5MB).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setState((s) => ({ ...s, logo: reader.result as string }));
    reader.onerror = () => setLogoError('Could not read that file — try another.');
    reader.readAsDataURL(file);
  };

  const addQuestion = () => {
    const label = draftQuestion.label.trim();
    if (!label) return;
    // A dropdown with no options isn't a usable question — require at
    // least one before it can be added, same as the real form editor does.
    if (draftQuestion.type === 'select' && draftQuestion.options.length === 0) return;

    setState((s) => ({
      ...s,
      questions: [
        ...s.questions,
        {
          id: `q_${Date.now()}`,
          label,
          type: draftQuestion.type,
          options: draftQuestion.type === 'select' ? draftQuestion.options : undefined,
        },
      ],
    }));
    setDraftQuestion({ label: '', type: 'text', options: [] });
    setDraftOption('');
  };

  const addDraftOption = () => {
    const opt = draftOption.trim();
    if (!opt) return;
    setDraftQuestion((d) => ({ ...d, options: [...d.options, opt] }));
    setDraftOption('');
  };

  const removeDraftOption = (index: number) => {
    setDraftQuestion((d) => ({ ...d, options: d.options.filter((_, i) => i !== index) }));
  };

  const removeQuestion = (id: string) => {
    setState((s) => ({ ...s, questions: s.questions.filter((q) => q.id !== id) }));
  };

  const resetDemo = () => {
    setState(DEFAULT_STATE);
    setLogoError('');
    setDraftQuestion({ label: '', type: 'text', options: [] });
    setDraftOption('');
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const gradientEnd = darkenHex(state.color);

  return (
    <section className="relative overflow-hidden py-24 sm:py-28 lg:py-36 bg-slate-100">
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-12 lg:gap-16 items-center">

          {/* LEFT */}
          <div className="order-1 lg:order-last flex flex-col justify-center">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-slate-500 mb-4"
              style={{ fontFamily: font }}
            >
              The fix: your form, your brand
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-4xl sm:text-5xl text-slate-950 font-black leading-[1.05] tracking-tight mb-0 lg:mb-5"
              style={{ fontFamily: font }}
            >
              Build it once,{' '}
              <span className="block pt-1" style={{ color: state.color }}>
                make it yours.
              </span>
            </motion.h2>

            <div className="hidden lg:block">
              <p
                className="text-slate-600 font-bold text-base sm:text-lg mb-8 mt-5 max-w-sm leading-relaxed"
                style={{ fontFamily: font }}
              >
                Upload your logo, pick your brand color, turn optional fields on or off, and add your own questions. No developer required.
              </p>
              <div className="flex flex-wrap gap-2.5 max-w-md">
                <CalloutTag icon={Palette} text="Your colors & logo" />
                <CalloutTag icon={ListChecks} text="Custom question logic" />
                <CalloutTag icon={Camera} text="Photo & video attachment" />
                <CalloutTag icon={MapPin} text="Clean address capture" />
              </div>
            </div>
          </div>

          {/* RIGHT — the actual interactive demo */}
          <div className="order-2 lg:order-first flex flex-col items-center w-full">

            {/* Invitation banner */}
            <div className="w-full max-w-[460px] mb-4 bg-white border-2 border-dashed border-slate-300 rounded-xl px-4 py-3">
              <p className="text-[12px] font-bold text-slate-600 leading-snug">
                Try it yourself — upload your logo, pick a color, and add a question below. It's saved right in your browser, nothing is sent anywhere.
              </p>
            </div>

            <div className="w-full max-w-[460px] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Colored header, live */}
              <div
                className="px-5 py-5 flex items-center gap-3 transition-[background] duration-500"
                style={{ background: `linear-gradient(135deg, ${state.color}, ${gradientEnd})` }}
              >
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-14 h-14 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm overflow-hidden cursor-pointer"
                  aria-label="Upload your logo"
                >
                  {state.logo ? (
                    <img src={state.logo} alt="Your logo" className="w-full h-full object-contain" />
                  ) : (
                    <Upload size={20} className="text-slate-300" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <div className="min-w-0">
                  <h4 className="text-white font-black text-sm truncate">Your Business Name</h4>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 text-white/80 text-[10px] font-bold uppercase tracking-wider mt-0.5 cursor-pointer hover:text-white transition-colors"
                  >
                    <Upload size={10} />
                    {state.logo ? 'Replace logo' : 'Upload your logo'}
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {logoError && (
                  <p className="text-[11px] font-bold text-rose-600 -mt-1">{logoError}</p>
                )}

                {/* Real color picker — clicking a swatch actually changes
                    the header gradient above */}
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Brand Color
                  </p>
                  <div className="flex items-center gap-2">
                    {COLOR_PRESETS.map((c) => {
                      const selected = c.toLowerCase() === state.color.toLowerCase();
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setState((s) => ({ ...s, color: c }))}
                          className="relative w-7 h-7 rounded-full shrink-0 flex items-center justify-center cursor-pointer"
                          style={{ backgroundColor: c }}
                          aria-label={`Use color ${c}`}
                          aria-pressed={selected}
                        >
                          {selected && <Check size={12} className="text-white" strokeWidth={3} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Real, clickable toggles */}
                <div className="divide-y divide-slate-100 border-t border-slate-100 pt-1">
                  <ToggleRow
                    label="Jobsite Address"
                    icon={MapPin}
                    on={state.address}
                    onToggle={() => setState((s) => ({ ...s, address: !s.address }))}
                    color={state.color}
                  />
                  <ToggleRow
                    label="Preferred Date & Time"
                    icon={Calendar}
                    on={state.dateTime}
                    onToggle={() => setState((s) => ({ ...s, dateTime: !s.dateTime }))}
                    color={state.color}
                  />
                  <ToggleRow
                    label="Photo & Video Upload"
                    icon={Camera}
                    on={state.photo}
                    onToggle={() => setState((s) => ({ ...s, photo: !s.photo }))}
                    color={state.color}
                  />
                </div>

                {/* Real add/remove custom questions — each one shows how
                    it'll actually appear to a customer, so the different
                    question types are visible, not just described. */}
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Custom Questions
                  </p>

                  <AnimatePresence initial={false}>
                    {state.questions.map((q) => (
                      <motion.div
                        key={q.id}
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginBottom: 8 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2.5">
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                              style={{ backgroundColor: state.color }}
                            >
                              <Check size={10} className="text-white" strokeWidth={3} />
                            </div>
                            <span className="text-[12px] font-bold text-slate-700 truncate flex-1">{q.label}</span>
                            <button
                              type="button"
                              onClick={() => removeQuestion(q.id)}
                              className="text-slate-300 hover:text-rose-500 shrink-0 cursor-pointer transition-colors"
                              aria-label={`Remove question: ${q.label}`}
                            >
                              <X size={13} />
                            </button>
                          </div>

                          {/* Type-specific preview — this is what actually
                              proves the different question types work,
                              rather than just naming them. */}
                          {q.type === 'text' && (
                            <div className="h-8 w-full bg-white border border-slate-200 rounded-md px-3 flex items-center text-[11px] text-slate-400">
                              Customer types their answer here
                            </div>
                          )}
                          {q.type === 'select' && (
                            <div className="h-8 w-full bg-white border border-slate-200 rounded-md px-3 flex items-center justify-between text-[11px] text-slate-500">
                              <span className="truncate">
                                {q.options?.length ? q.options.join(' · ') : 'No options added'}
                              </span>
                              <ChevronDown size={13} className="text-slate-300 shrink-0 ml-2" />
                            </div>
                          )}
                          {q.type === 'yesno' && (
                            <div className="flex gap-2">
                              <span className="px-3 py-1.5 rounded-md border border-slate-200 bg-white text-[11px] font-semibold text-slate-500">
                                Yes
                              </span>
                              <span className="px-3 py-1.5 rounded-md border border-slate-200 bg-white text-[11px] font-semibold text-slate-500">
                                No
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {state.questions.length === 0 && (
                    <p className="text-[11px] font-semibold text-slate-400 mb-3">
                      No custom questions yet — build one below.
                    </p>
                  )}

                  {/* Composer — label, then type, then (for dropdown only)
                      the option list, before it can be added. */}
                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-3 space-y-2.5">
                    <input
                      value={draftQuestion.label}
                      onChange={(e) => setDraftQuestion((d) => ({ ...d, label: e.target.value }))}
                      placeholder="e.g. What's your budget?"
                      className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 text-[12px] font-medium text-slate-700 outline-none focus:border-slate-400 transition-colors"
                    />

                    <div className="grid grid-cols-3 gap-1.5">
                      {(
                        [
                          { val: 'text', label: 'Text' },
                          { val: 'select', label: 'Dropdown' },
                          { val: 'yesno', label: 'Yes / No' },
                        ] as { val: QuestionType; label: string }[]
                      ).map((t) => {
                        const active = draftQuestion.type === t.val;
                        return (
                          <button
                            key={t.val}
                            type="button"
                            onClick={() => setDraftQuestion((d) => ({ ...d, type: t.val }))}
                            className={`py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide border-2 transition-colors cursor-pointer ${
                              active ? 'text-white border-transparent' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                            }`}
                            style={active ? { backgroundColor: state.color } : undefined}
                          >
                            {t.label}
                          </button>
                        );
                      })}
                    </div>

                    {draftQuestion.type === 'select' && (
                      <div className="space-y-1.5 pt-0.5">
                        <AnimatePresence initial={false}>
                          {draftQuestion.options.map((opt, i) => (
                            <motion.div
                              key={`${opt}-${i}`}
                              initial={{ opacity: 0, x: -6 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 6 }}
                              className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-md border border-slate-200"
                            >
                              <span className="text-[11px] font-semibold text-slate-700">{opt}</span>
                              <button
                                type="button"
                                onClick={() => removeDraftOption(i)}
                                className="text-slate-300 hover:text-rose-500 cursor-pointer"
                                aria-label={`Remove option ${opt}`}
                              >
                                <X size={12} />
                              </button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        <div className="flex items-center gap-1.5">
                          <input
                            value={draftOption}
                            onChange={(e) => setDraftOption(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addDraftOption();
                              }
                            }}
                            placeholder="Add an option..."
                            className="flex-1 min-w-0 border-2 border-slate-200 rounded-md px-2.5 py-1.5 text-[11px] font-medium text-slate-700 outline-none focus:border-slate-400 transition-colors"
                          />
                          <button
                            type="button"
                            onClick={addDraftOption}
                            className="shrink-0 px-2.5 py-1.5 rounded-md text-[10px] font-bold text-white cursor-pointer"
                            style={{ backgroundColor: state.color }}
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={addQuestion}
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-bold text-white cursor-pointer"
                      style={{ backgroundColor: state.color }}
                    >
                      <Plus size={13} strokeWidth={2.5} />
                      Add Question
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={resetDemo}
              className="mt-3 text-[11px] font-bold text-slate-400 hover:text-slate-600 underline underline-offset-2 cursor-pointer"
            >
              Reset demo
            </button>

            <div className="block lg:hidden w-full mt-8">
              <p
                className="text-slate-600 font-bold text-base leading-relaxed mb-6"
                style={{ fontFamily: font }}
              >
                Upload your logo, pick your brand color, turn optional fields on or off, and add your own questions. No developer required.
              </p>
              <div className="flex flex-wrap gap-2.5">
                <CalloutTag icon={Palette} text="Your colors & logo" />
                <CalloutTag icon={ListChecks} text="Custom question logic" />
                <CalloutTag icon={Camera} text="Photo & video attachment" />
                <CalloutTag icon={MapPin} text="Clean address capture" />
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}