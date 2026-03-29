import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Target } from 'lucide-react';
import { getGroqApiKey } from '../lib/groq';

type InterviewCategory = 'DSA' | 'HR' | 'System Design';

interface InterviewQuestion {
  question: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tip: string;
  answer: string;
}

const PRACTICED_STORAGE_KEY = 'interview_prep_practiced';
const tabs: InterviewCategory[] = ['DSA', 'HR', 'System Design'];
const INTERVIEW_MODEL = 'llama-3.3-70b-versatile';

function safeParseJSON<T>(raw: string): T | null {
  if (!raw || raw.trim() === '') return null;

  try {
    let cleaned = raw.trim();
    cleaned = cleaned.replace(/^```json\s*/i, '');
    cleaned = cleaned.replace(/^```\s*/i, '');
    cleaned = cleaned.replace(/```\s*$/i, '');
    cleaned = cleaned.trim();
    cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');
    return JSON.parse(cleaned) as T;
  } catch (e1) {
    console.warn('Direct parse failed, trying recovery...', e1 instanceof Error ? e1.message : e1);

    try {
      let cleaned = raw.trim();
      cleaned = cleaned.replace(/^```json\s*/i, '');
      cleaned = cleaned.replace(/^```\s*/i, '');
      cleaned = cleaned.replace(/```\s*$/i, '');
      cleaned = cleaned.trim();
      cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');

      if (cleaned.trimStart().startsWith('[')) {
        const lastComplete = cleaned.lastIndexOf('},');
        const lastSingle = cleaned.lastIndexOf('}');
        const cutPoint = Math.max(lastComplete, lastSingle);
        if (cutPoint > 0) {
          let recovered = cleaned.substring(0, cutPoint + 1);
          recovered = recovered.replace(/,\s*$/, '');
          recovered += ']';
          recovered = recovered.replace(/,\s*([}\]])/g, '$1');
          return JSON.parse(recovered) as T;
        }
      }

      if (cleaned.trimStart().startsWith('{')) {
        let braces = 0;
        let lastSafePos = 0;
        let inString = false;
        let escape = false;

        for (let i = 0; i < cleaned.length; i += 1) {
          const c = cleaned[i];
          if (escape) {
            escape = false;
            continue;
          }
          if (c === '\\' && inString) {
            escape = true;
            continue;
          }
          if (c === '"') {
            inString = !inString;
            continue;
          }
          if (inString) {
            continue;
          }
          if (c === '{') braces += 1;
          if (c === '}') {
            braces -= 1;
            if (braces === 0) lastSafePos = i;
          }
        }

        if (lastSafePos > 0) {
          let recovered = cleaned.substring(0, lastSafePos + 1);
          recovered = recovered.replace(/,\s*([}\]])/g, '$1');
          return JSON.parse(recovered) as T;
        }
      }

      return null;
    } catch (e2) {
      console.error('Recovery also failed:', e2 instanceof Error ? e2.message : e2);
      console.error('Raw response length:', raw.length);
      return null;
    }
  }
}

async function callGroqAPI(prompt: string, maxTokens: number) {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    throw new Error('Add Groq API key in Settings');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: INTERVIEW_MODEL,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error?.message || `Groq API error ${response.status}`);
  }

  return payload?.choices?.[0]?.message?.content || '';
}

async function generateWithRetry(prompt: string, maxRetries = 1) {
  let nextPrompt = prompt;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const response = await callGroqAPI(nextPrompt, 4096);
      const parsed = safeParseJSON<InterviewQuestion[]>(response);
      if (parsed) {
        return parsed;
      }
      if (attempt < maxRetries) {
        console.log('Retrying with shorter prompt...');
        nextPrompt = nextPrompt
          .replace(/exactly 8/g, 'exactly 5')
          .replace(/Generate exactly 8 interview questions/g, 'Generate exactly 5 interview questions')
          .replace(/Generate exactly 8 items\./g, 'Generate exactly 5 items.')
          .replace(/Keep every string value under 200 characters\./g, 'Keep every string value under 160 characters.');
      }
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
    }
  }

  return null;
}

function getDifficultyStyles(level: string) {
  if (level === 'Hard') {
    return { background: 'rgba(239,68,68,0.16)', color: '#fca5a5' };
  }

  if (level === 'Medium') {
    return { background: 'rgba(245,158,11,0.16)', color: '#fcd34d' };
  }

  return { background: 'rgba(34,197,94,0.16)', color: '#86efac' };
}

function getCategoryGuidance(tab: InterviewCategory) {
  if (tab === 'DSA') {
    return 'Cover data structures, algorithms, time complexity, coding problems, edge cases, optimization, and tradeoff discussion.';
  }

  if (tab === 'HR') {
    return 'Cover behavioral, situational, teamwork, conflict resolution, leadership, ownership, communication, and career-goal questions.';
  }

  return 'Cover scalability, databases, caching, load balancing, APIs, microservices, reliability, and real system design examples.';
}

function renderParagraphs(text: string) {
  return text
    .split(/\n\s*\n|(?<=[.!?])\s+(?=[A-Z])/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph, index) => (
      <p key={`${paragraph.slice(0, 20)}-${index}`} className="leading-7">
        {paragraph}
      </p>
    ));
}

const InterviewPrep: React.FC = () => {
  const [role, setRole] = useState('');
  const [activeTab, setActiveTab] = useState<InterviewCategory>('DSA');
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [practiced, setPracticed] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const hasApiKey = useMemo(() => Boolean(getGroqApiKey()), []);

  useEffect(() => {
    const stored = localStorage.getItem(PRACTICED_STORAGE_KEY);
    if (stored) {
      try {
        setPracticed(JSON.parse(stored));
      } catch {
        setPracticed({});
      }
    }
  }, []);

  const persistPracticed = (nextValue: Record<string, boolean>) => {
    setPracticed(nextValue);
    localStorage.setItem(PRACTICED_STORAGE_KEY, JSON.stringify(nextValue));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const prompt = [
        'IMPORTANT: Return ONLY a raw valid JSON array. No markdown. No backticks.',
        'No explanation. No trailing commas. Strictly valid JSON only.',
        'Response must be complete and not cut off.',
        '',
        `Generate exactly 8 interview questions for a ${role} role, category: ${activeTab}.`,
        '',
        'Keep answers SHORT - max 3 sentences each. Keep tips SHORT - max 2 sentences.',
        '',
        `Category coverage: ${getCategoryGuidance(activeTab)}`,
        '',
        'Format:',
        '[',
        '  {',
        '    "question": "question text here",',
        '    "difficulty": "Easy",',
        '    "tip": "short tip max 2 sentences",',
        '    "answer": "short answer max 3 sentences"',
        '  }',
        ']',
        '',
        'Generate exactly 8 items. Keep every string value under 200 characters.',
      ].join('\n');

      let parsed = await generateWithRetry(prompt);

      if (!parsed || !Array.isArray(parsed)) {
        setErrorMessage('AI response was too long and got cut off. Trying again with fewer questions...');
        const retryPrompt = prompt
          .replace(/exactly 8/g, 'exactly 5')
          .replace(/Generate exactly 8 interview questions/g, 'Generate exactly 5 interview questions')
          .replace(/Generate exactly 8 items\./g, 'Generate exactly 5 items.')
          .replace(/Keep every string value under 200 characters\./g, 'Keep every string value under 160 characters.');
        parsed = await generateWithRetry(retryPrompt, 0);
      }

      if (!parsed || !Array.isArray(parsed)) {
        throw new Error('AI response was too long and got cut off. Trying again with fewer questions...');
      }

      setQuestions(parsed);
      setExpanded({});
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'API call failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Interview Prep</h1>
        <p className="mt-1">Generate targeted interview questions and track what you have practiced.</p>
      </div>

      {!hasApiKey && (
        <div
          className="rounded-xl border px-4 py-3"
          style={{ background: 'rgba(249,115,22,0.08)', borderColor: 'rgba(249,115,22,0.3)', color: 'var(--accent)' }}
        >
          Add Groq API key in Settings
        </div>
      )}

      <div className="tucf-card space-y-5">
        <div>
          <label className="block text-sm font-medium mb-2">Job Role</label>
          <input
            value={role}
            onChange={(event) => setRole(event.target.value)}
            placeholder="e.g. Frontend Developer"
            className="px-4 py-3"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2 rounded-xl font-medium transition-colors"
              style={
                activeTab === tab
                  ? { background: 'rgba(249,115,22,0.16)', color: 'var(--accent)', border: '1px solid rgba(249,115,22,0.35)' }
                  : { background: '#0f0f0f', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
              }
            >
              {tab}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => void handleGenerate()}
          disabled={loading || !role.trim()}
          className="rounded-xl px-4 py-3 text-white font-medium disabled:opacity-50 tucf-btn-primary"
        >
          Generate Questions
        </button>

        {errorMessage && <p style={{ color: 'var(--accent)' }}>{errorMessage}</p>}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="tucf-card flex items-center gap-4">
            <div className="loading-spinner" />
            <p>Generating questions...</p>
          </div>
        ) : questions.length > 0 ? (
          questions.map((item, index) => {
            const questionKey = `${activeTab}:${role}:${item.question}`;
            const isExpanded = expanded[questionKey];

            return (
              <div key={questionKey} className="tucf-card">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-4 flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={getDifficultyStyles(item.difficulty)}
                      >
                        {item.difficulty}
                      </span>
                      <span className="text-sm">Question {index + 1}</span>
                    </div>

                    <h3 className="text-xl font-semibold leading-8" style={{ color: 'var(--text-primary)' }}>
                      {item.question}
                    </h3>

                    {isExpanded && (
                      <div className="space-y-4">
                        <div
                          className="rounded-xl border px-4 py-4 space-y-3"
                          style={{ background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.3)' }}
                        >
                          <p style={{ color: '#fcd34d', fontWeight: 600 }}>?? How to Answer</p>
                          <div className="space-y-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                            {renderParagraphs(item.tip)}
                          </div>
                        </div>

                        <div
                          className="rounded-xl border px-4 py-4 space-y-3"
                          style={{ background: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.28)' }}
                        >
                          <p style={{ color: '#86efac', fontWeight: 600 }}>? Model Answer</p>
                          <div className="space-y-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                            {renderParagraphs(item.answer)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-3 sm:min-w-[130px]">
                    <button
                      type="button"
                      onClick={() => setExpanded((current) => ({ ...current, [questionKey]: !current[questionKey] }))}
                      className="px-3 py-2 tucf-btn-ghost"
                    >
                      <span className="inline-flex items-center gap-2">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        {isExpanded ? 'Hide' : 'Expand'}
                      </span>
                    </button>

                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(practiced[questionKey])}
                        onChange={(event) =>
                          persistPracticed({ ...practiced, [questionKey]: event.target.checked })
                        }
                        className="h-4 w-4"
                      />
                      <span>Practiced</span>
                    </label>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="tucf-card text-center">
            <Target className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--accent)' }} />
            <p>Generated questions will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewPrep;
