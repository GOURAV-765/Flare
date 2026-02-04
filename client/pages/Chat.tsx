import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getSupabase } from "@/lib/supabase";
import { toast } from "sonner";
import PageAnnouncer from "@/components/accessibility/PageAnnouncer";

interface SelfProfile { name: string; email: string; role: "candidate" | "employer"; }
interface ChatRow { id: string; created_at?: string; candidate_email: string; employer_email: string; last_message?: string; last_at?: string; }
interface MessageRow { id: string; chat_id: string; sender: string; body: string; created_at?: string; }

const SELF_KEY = "chat:self";

export default function Chat() {
  const [self, setSelf] = useState<SelfProfile | null>(null);
  const [chats, setChats] = useState<ChatRow[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [peerEmail, setPeerEmail] = useState("");
  const [body, setBody] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try { const v = localStorage.getItem(SELF_KEY); if (v) setSelf(JSON.parse(v)); } catch {}
  }, []);

  const sb = useMemo(() => getSupabase(), []);

  const refreshChats = async () => {
    if (!self) return;
    if (sb) {
      const { data } = await sb
        .from("chats")
        .select("*")
        .or(`candidate_email.eq.${self.email},employer_email.eq.${self.email}`)
        .order("last_at", { ascending: false });
      if (data) setChats(data as any);
    } else {
      // local storage fallback
      const v = localStorage.getItem("chat:chats");
      const list: ChatRow[] = v ? JSON.parse(v) : [];
      setChats(list.filter((c) => c.candidate_email === self.email || c.employer_email === self.email));
    }
  };

  const openChat = async (chatId: string) => {
    setActiveId(chatId);
    if (sb) {
      const { data } = await sb.from("messages").select("*").eq("chat_id", chatId).order("created_at", { ascending: true });
      setMessages((data as any) || []);
      // subscribe to realtime
      sb.channel(`chat-${chatId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` }, (payload) => {
          setMessages((m) => [...m, payload.new as any]);
          setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
        })
        .subscribe();
    } else {
      const v = localStorage.getItem(`chat:messages:${chatId}`);
      setMessages(v ? JSON.parse(v) : []);
    }
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
  };

  useEffect(() => { if (self) refreshChats(); }, [self]);

  const saveSelf = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const profile: SelfProfile = {
      name: String(fd.get("name") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      role: (String(fd.get("role") || "candidate") as any),
    };
    if (!profile.name || !profile.email) { toast.error("Enter name and email"); return; }
    localStorage.setItem(SELF_KEY, JSON.stringify(profile));
    setSelf(profile);
  };

  const startChat = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!self) return;
    const other = peerEmail.trim().toLowerCase();
    if (!other) { toast.error("Enter the other party's email"); return; }
    const candidate = self.role === 'candidate' ? self.email : other;
    const employer = self.role === 'employer' ? self.email : other;
    if (sb) {
      const { data } = await sb.from("chats").insert({ candidate_email: candidate, employer_email: employer, last_at: new Date().toISOString() }).select().single();
      if (data) {
        await refreshChats();
        setPeerEmail("");
        openChat((data as any).id);
      }
    } else {
      const id = crypto.randomUUID();
      const list: ChatRow[] = JSON.parse(localStorage.getItem("chat:chats") || "[]");
      const row: ChatRow = { id, candidate_email: candidate, employer_email: employer, last_at: new Date().toISOString() };
      list.unshift(row); localStorage.setItem("chat:chats", JSON.stringify(list));
      setPeerEmail("");
      await refreshChats();
      openChat(id);
    }
  };

  const send = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!self || !activeId) return;
    const txt = body.trim();
    if (!txt) return;
    const msg: Omit<MessageRow, 'id'> = { chat_id: activeId, sender: self.email, body: txt } as any;
    if (sb) {
      await sb.from("messages").insert(msg as any);
      await sb.from("chats").update({ last_message: txt, last_at: new Date().toISOString() }).eq("id", activeId);
    } else {
      const list: MessageRow[] = JSON.parse(localStorage.getItem(`chat:messages:${activeId}`) || "[]");
      const row: MessageRow = { id: crypto.randomUUID(), ...msg } as any;
      list.push(row); localStorage.setItem(`chat:messages:${activeId}`, JSON.stringify(list));
      setMessages(list);
      const chatsAll: ChatRow[] = JSON.parse(localStorage.getItem("chat:chats") || "[]");
      const i = chatsAll.findIndex((c) => c.id === activeId); if (i >= 0) { chatsAll[i].last_message = txt; chatsAll[i].last_at = new Date().toISOString(); }
      localStorage.setItem("chat:chats", JSON.stringify(chatsAll));
    }
    setBody("");
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
  };

  if (!self) {
    return (
      <div className="container mx-auto px-4 py-12 md:py-16">
        <h1 className="text-3xl font-bold tracking-tight">Set up chat</h1>
        <p className="text-muted-foreground mb-4">No sign-in needed. This is only used to identify you in chat.</p>
        <form onSubmit={saveSelf} className="grid gap-4 max-w-xl rounded-2xl border bg-card p-6">
          <div className="grid gap-2"><Label htmlFor="name">Full name</Label><Input id="name" name="name" required /></div>
          <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required /></div>
          <div className="grid gap-2">
            <Label htmlFor="role">I am</Label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2"><input type="radio" name="role" value="candidate" defaultChecked /> Candidate</label>
              <label className="flex items-center gap-2"><input type="radio" name="role" value="employer" /> Employer</label>
            </div>
          </div>
          <Button type="submit">Continue</Button>
        </form>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <PageAnnouncer title="Chat" description="Connect with employers and candidates. Send and receive messages." />
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
        <aside className="rounded-2xl border bg-card p-4 h-[70vh] overflow-auto">
          <h2 className="font-semibold mb-3">Conversations</h2>
          <form onSubmit={startChat} className="mb-4 grid gap-2">
            <Label htmlFor="peer">Start new with email</Label>
            <Input id="peer" value={peerEmail} onChange={(e) => setPeerEmail(e.target.value)} placeholder="someone@company.com" />
            <Button type="submit" variant="outline">Start chat</Button>
          </form>
          <div className="grid gap-2">
            {chats.map((c) => {
              const other = self.email === c.candidate_email ? c.employer_email : c.candidate_email;
              return (
                <button key={c.id} onClick={() => openChat(c.id)} className={`text-left rounded-md border px-3 py-2 ${activeId===c.id? 'bg-accent' : 'hover:bg-accent'}`}>
                  <div className="font-medium">{other}</div>
                  {c.last_message && <div className="text-xs text-muted-foreground line-clamp-1">{c.last_message}</div>}
                </button>
              );
            })}
          </div>
        </aside>
        <section className="rounded-2xl border bg-card h-[70vh] flex flex-col">
          {!activeId ? (
            <div className="flex-1 grid place-items-center text-muted-foreground">Select a conversation</div>
          ) : (
            <>
              <div className="flex-1 overflow-auto p-4 space-y-2">
                {messages.map((m) => (
                  <div key={m.id} className={`max-w-[75%] rounded-xl px-3 py-2 border ${m.sender===self.email?'ml-auto bg-primary text-primary-foreground':'bg-background'}`}> {m.body} </div>
                ))}
                <div ref={endRef} />
              </div>
              <form onSubmit={send} className="border-t p-3 flex gap-2">
                <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Type a message" className="min-h-0 h-10" />
                <Button type="submit" disabled={!body.trim()}>Send</Button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
