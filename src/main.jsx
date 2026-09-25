import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUp, Check, ChevronDown, CircleHelp, Compass, Copy, Menu, MessageSquarePlus, MoreHorizontal, Paperclip, Plus, Search, Sparkles, ThumbsDown, ThumbsUp, Trash2, X } from 'lucide-react';
import './styles.css';

const starters = [
  { icon: '✳', title: 'Help me solve a problem', text: 'Break down a problem and find a practical solution' },
  { icon: '⌘', title: 'Plan something', text: 'Help me make a clear plan for a goal or project' },
  { icon: '↗', title: 'Explain it simply', text: 'Make a tricky topic easy to understand' },
  { icon: '✎', title: 'Write with me', text: 'Draft or improve a message, email, or idea' },
];

function answerFor(raw) {
  const q = raw.toLowerCase();
  if (/\b(hello|hi|hey|good morning|good evening)\b/.test(q)) return `Hi! I’m Ghewar. Tell me what you’re working through, and I’ll help you find a clear next step.\n\nYou can share as much or as little context as you like.`;
  if (/\b(math|solve|equation|calculate|\d+\s*[+*/-]\s*\d+)/.test(q)) return `Let’s work through it carefully.\n\n1. **Write down what you know** and what you’re trying to find.\n2. **Choose the rule or operation** that connects the information.\n3. **Work one step at a time**, keeping both sides of an equation balanced.\n4. **Check your result** by substituting it back into the original problem.\n\nShare the exact question and I’ll solve it step by step.`;
  if (/\b(stress|anxious|overwhelmed|pressure|procrastinat)/.test(q)) return `That can feel like a lot to carry. Let’s make it smaller and more manageable.\n\n- Write down everything competing for your attention.\n- Pick the one thing that matters most today.\n- Turn it into a first step you can finish in 10 minutes.\n- Give yourself a short break after that step, then decide what comes next.\n\nWhat’s the main thing weighing on you right now?`;
  if (/\b(plan|planning|organize|goal|project|study|learn|prepare)/.test(q)) return `A simple plan starts with a clear finish line. Try this:\n\n1. **Define the outcome:** What does “done” look like?\n2. **List the steps:** Break the outcome into small actions.\n3. **Choose the first step:** Make it specific enough to start now.\n4. **Set a checkpoint:** Pick a time to review progress and adjust.\n\nTell me your goal and deadline, and I’ll turn it into a tailored plan.`;
  if (/\b(write|email|message|draft|resume|cover letter)/.test(q)) return `I can help you shape this into something clear and effective. A useful starting structure is:\n\n- **Purpose:** What do you want the reader to know or do?\n- **Context:** What do they need to understand?\n- **Next step:** What response or action are you asking for?\n\nShare who it’s for and the tone you want, and I’ll draft it.`;
  if (/\b(decide|decision|choose|option|should i)/.test(q)) return `Let’s make the decision easier to see.\n\n1. Name the outcome you care about most.\n2. List your realistic options.\n3. Compare each option against that outcome, plus time, cost, and risk.\n4. Notice what information is still missing.\n5. Choose the smallest reversible step that gives you more clarity.\n\nWhat are you deciding between?`;
  return `Let’s break this down into something solvable.\n\n**First, clarify the outcome.** What would a good solution look like for you?\n\n**Then, find the sticking point.** Is the challenge a lack of information, time, resources, or a difficult choice?\n\n**Pick one small next step.** Choose something you can do today that moves you closer to the outcome.\n\nTell me a little more about the situation—what have you tried so far, and what’s getting in the way?`;
}

const initial = { id: 1, title: 'New conversation', messages: [] };
function App() {
  const [chats, setChats] = useState(() => { try { return JSON.parse(localStorage.getItem('ghewar-chats')) || [initial]; } catch { return [initial]; } });
  const [activeId, setActiveId] = useState(() => Number(localStorage.getItem('ghewar-active')) || 1);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [sidebar, setSidebar] = useState(false);
  const [copied, setCopied] = useState(null);
  const endRef = useRef(null);
  const active = chats.find(c => c.id === activeId) || chats[0];
  useEffect(() => { localStorage.setItem('ghewar-chats', JSON.stringify(chats)); }, [chats]);
  useEffect(() => { localStorage.setItem('ghewar-active', String(activeId)); }, [activeId]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [active?.messages, busy]);

  function newChat() {
    const chat = { id: Date.now(), title: 'New conversation', messages: [] };
    setChats(prev => [chat, ...prev]); setActiveId(chat.id); setText(''); setSidebar(false);
  }
  function send(value = text) {
    const prompt = value.trim(); if (!prompt || busy) return;
    const userMessage = { id: Date.now(), role: 'user', content: prompt };
    setChats(prev => prev.map(c => c.id === activeId ? { ...c, title: c.messages.length ? c.title : prompt.slice(0, 34), messages: [...c.messages, userMessage] } : c));
    setText(''); setBusy(true);
    window.setTimeout(() => {
      const reply = { id: Date.now() + 1, role: 'assistant', content: answerFor(prompt) };
      setChats(prev => prev.map(c => c.id === activeId ? { ...c, messages: [...c.messages, reply] } : c)); setBusy(false);
    }, 650);
  }
  function removeChat(id, e) { e.stopPropagation(); setChats(prev => { const remaining = prev.filter(c => c.id !== id); if (!remaining.length) remaining.push({ ...initial, id: Date.now() }); if (id === activeId) setActiveId(remaining[0].id); return remaining; }); }
  async function copy(content, id) { try { await navigator.clipboard.writeText(content); setCopied(id); window.setTimeout(() => setCopied(null), 1300); } catch {} }

  return <div className="app-shell">
    <aside className={`sidebar ${sidebar ? 'open' : ''}`}>
      <div className="side-top"><a className="brand" href="#home" onClick={e => e.preventDefault()}><span className="brand-mark"><Sparkles size={17}/></span><span>ghewar</span></a><button className="icon-button side-close" onClick={() => setSidebar(false)} aria-label="Close menu"><X size={18}/></button></div>
      <button className="new-chat" onClick={newChat}><MessageSquarePlus size={17}/>New chat <span>⌘ K</span></button>
      <div className="side-label">YOUR SPACE</div>
      <button className="side-link"><Search size={16}/>Search chats</button><button className="side-link"><Compass size={16}/>Explore ideas</button>
      <div className="history-label"><span>RECENTS</span><button aria-label="More options"><MoreHorizontal size={16}/></button></div>
      <div className="chat-history">{chats.map(c => <div key={c.id} onClick={() => { setActiveId(c.id); setSidebar(false); }} className={`history-item ${c.id === activeId ? 'selected' : ''}`}><span className="history-title">{c.title}</span><button className="delete-chat" aria-label="Delete conversation" onClick={e => removeChat(c.id, e)}><Trash2 size={14}/></button></div>)}</div>
      <div className="side-footer"><div className="profile"><div className="profile-pic">G</div><div><b>Guest</b><small>Personal workspace</small></div><MoreHorizontal size={17}/></div></div>
    </aside>
    {sidebar && <button className="scrim" onClick={() => setSidebar(false)} aria-label="Close menu"/>}
    <main className="main-area">
      <header className="topbar"><div className="top-left"><button className="icon-button mobile-menu" onClick={() => setSidebar(true)} aria-label="Open menu"><Menu size={19}/></button><span className="mobile-brand"><span className="brand-mark"><Sparkles size={15}/></span> ghewar</span><button className="model-picker">Ghewar <span className="model-badge">AI</span><ChevronDown size={14}/></button></div><div className="top-right"><button className="header-link"><CircleHelp size={16}/><span>Help</span></button><button className="avatar-small">G</button></div></header>
      <div className={`conversation ${active.messages.length ? 'has-messages' : ''}`}>
        {active.messages.length === 0 ? <div className="welcome"><div className="welcome-mark"><Sparkles size={21}/></div><div className="welcome-kicker">A LITTLE CLARITY GOES A LONG WAY</div><h1>What can I help you<br/><em>figure out?</em></h1><p>Bring me a problem, a question, or a half-formed idea.<br className="desktop-break"/> We’ll work through it together.</p><div className="starter-grid">{starters.map(s => <button key={s.title} className="starter" onClick={() => send(s.text)}><span className="starter-icon">{s.icon}</span><span><b>{s.title}</b><small>{s.text}</small></span><ArrowUp size={15}/></button>)}</div></div> : <div className="message-list">{active.messages.map(m => <article className={`message ${m.role}`} key={m.id}><div className="message-avatar">{m.role === 'assistant' ? <Sparkles size={15}/> : 'G'}</div><div className="message-body"><div className="message-name">{m.role === 'assistant' ? 'Ghewar' : 'You'}{m.role === 'assistant' && <span className="model-badge">AI</span>}</div><div className="message-content">{m.content.split('\n').map((line, idx) => <React.Fragment key={idx}>{line.startsWith('- ') ? <div className="md-line">• {line.slice(2)}</div> : <span>{line.replace(/\*\*(.*?)\*\*/g, '$1')}</span>}{idx < m.content.split('\n').length - 1 && <br/>}</React.Fragment>)}</div>{m.role === 'assistant' && <div className="message-tools"><button onClick={() => copy(m.content, m.id)} aria-label="Copy response">{copied === m.id ? <Check size={14}/> : <Copy size={14}/>}<span>{copied === m.id ? 'Copied' : 'Copy'}</span></button><button aria-label="Good response"><ThumbsUp size={14}/></button><button aria-label="Bad response"><ThumbsDown size={14}/></button></div>}</div></article>)}{busy && <article className="message assistant"><div className="message-avatar"><Sparkles size={15}/></div><div className="typing"><i/><i/><i/></div></article>}<div ref={endRef}/></div>}
      </div>
      <div className="composer-wrap"><form className="composer" onSubmit={e => { e.preventDefault(); send(); }}><textarea value={text} onChange={e => { setText(e.target.value); e.target.style.height = 'auto'; e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`; }} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Tell Ghewar what’s on your mind..." rows={1} aria-label="Message Ghewar"/><div className="composer-bottom"><div className="composer-tools"><button type="button" aria-label="Attach file"><Plus size={17}/></button><button type="button" className="tool-context"><Paperclip size={14}/><span>Attach context</span></button></div><div className="send-side"><span className="enter-hint">↵ <span>to send</span></span><button type="submit" className={`send-button ${text.trim() ? 'ready' : ''}`} disabled={!text.trim() || busy} aria-label="Send message"><ArrowUp size={17}/></button></div></div></form><div className="disclaimer">Ghewar can make mistakes. Check important information.</div></div>
    </main>
  </div>;
}
createRoot(document.getElementById('root')).render(<App/>);
