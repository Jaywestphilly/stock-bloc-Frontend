import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { 
  MessageSquare, 
  TrendingUp, 
  ThumbsUp, 
  Send,
  Users,
  Flame,
  Clock,
  MessageCircle,
  Plus
} from "lucide-react";
import { auth, db } from "../../lib/firebase";
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  updateDoc,
  doc,
  increment,
  getDoc
} from "firebase/firestore";
import { triggerHaptic } from "../../utils/haptics";

interface ChatMessage {
  id: string;
  authorId: string;
  authorUsername: string;
  content: string;
  createdAt: any;
}

interface DiscussionPost {
  id: string;
  authorId: string;
  authorUsername: string;
  title: string;
  content: string;
  upvotes: number;
  repliesCount: number;
  createdAt: any;
}

export const CommunityHub = () => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [discussions, setDiscussions] = useState<DiscussionPost[]>([]);
  
  const [newChatText, setNewChatText] = useState("");
  const [isComposingPost, setIsComposingPost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auth Listener to get current user details including username
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const snap = await getDoc(docRef);
        setCurrentUser({
          uid: user.uid,
          username: snap.exists() && snap.data().username ? snap.data().username : user.displayName || "Anonymous"
        });
      } else {
        setCurrentUser(null);
      }
    });

    // Real-time listener for Chat
    const qChat = query(collection(db, "chats"), orderBy("createdAt", "desc"), limit(50));
    const unsubscribeChat = onSnapshot(qChat, (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as ChatMessage);
      });
      setChatMessages(msgs.reverse());
    });

    // Real-time listener for Discussions
    const qDisc = query(collection(db, "discussions"), orderBy("createdAt", "desc"), limit(20));
    const unsubscribeDisc = onSnapshot(qDisc, (snapshot) => {
      const posts: DiscussionPost[] = [];
      snapshot.forEach((doc) => {
        posts.push({ id: doc.id, ...doc.data() } as DiscussionPost);
      });
      setDiscussions(posts);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeChat();
      unsubscribeDisc();
    };
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatText.trim() || !currentUser) return;

    try {
      await addDoc(collection(db, "chats"), {
        authorId: currentUser.uid,
        authorUsername: currentUser.username,
        content: newChatText.trim(),
        createdAt: serverTimestamp()
      });
      setNewChatText("");
    } catch (e) {
      console.error("Failed to send chat", e);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim() || !currentUser) return;

    try {
      await addDoc(collection(db, "discussions"), {
        authorId: currentUser.uid,
        authorUsername: currentUser.username,
        title: newPostTitle.trim(),
        content: newPostContent.trim(),
        upvotes: 0,
        repliesCount: 0,
        createdAt: serverTimestamp()
      });
      setNewPostTitle("");
      setNewPostContent("");
      setIsComposingPost(false);
      triggerHaptic("success");
    } catch (e) {
      console.error("Failed to create post", e);
    }
  };

  const handleUpvote = async (postId: string) => {
    if (!currentUser) return;
    triggerHaptic("light");
    try {
      const postRef = doc(db, "discussions", postId);
      await updateDoc(postRef, {
        upvotes: increment(1)
      });
    } catch (e) {
      console.error("Upvote failed", e);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "Just now";
    try {
      const date = timestamp.toDate();
      const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
      
      let interval = seconds / 31536000;
      if (interval > 1) return Math.floor(interval) + "y ago";
      interval = seconds / 2592000;
      if (interval > 1) return Math.floor(interval) + "mo ago";
      interval = seconds / 86400;
      if (interval > 1) return Math.floor(interval) + "d ago";
      interval = seconds / 3600;
      if (interval > 1) return Math.floor(interval) + "h ago";
      interval = seconds / 60;
      if (interval > 1) return Math.floor(interval) + "m ago";
      return "Just now";
    } catch (e) {
      return "Just now";
    }
  };

  return (
    <div className="w-full max-w-7xl xl:max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 py-6 font-sans">
      
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-cyan-400" />
            Stock Bloc Community
          </h1>
          <p className="text-sm text-neutral-400 mt-2 font-mono">
            Live market discussions, trade sharing, and real-time alerts.
          </p>
        </div>
      </div>

      {!currentUser && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-amber-200">
          <p className="text-xs font-mono font-bold">You must sign in to participate in the community discussions.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)] min-h-[600px]">
        
        {/* LEFT PANE: Discussions (Reddit Style) */}
        <div className="lg:col-span-2 flex flex-col bg-neutral-900/50 border border-white/10 rounded-3xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-500" />
              Trending Discussions
            </h2>
            <button 
              onClick={() => {
                triggerHaptic("selection");
                setIsComposingPost(!isComposingPost);
              }}
              disabled={!currentUser}
              className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-black text-xs flex items-center gap-2 hover:bg-cyan-400 disabled:opacity-50 transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              <Plus className="w-4 h-4" />
              New Post
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {isComposingPost && currentUser && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-black border border-cyan-500/30 space-y-3"
              >
                <input
                  type="text"
                  placeholder="Post Title (e.g., Thoughts on NVDA earnings?)"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
                />
                <textarea
                  placeholder="Body text (optional)..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500 min-h-[100px] resize-none"
                />
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => setIsComposingPost(false)}
                    className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleCreatePost}
                    disabled={!newPostTitle.trim() || !newPostContent.trim()}
                    className="px-4 py-2 rounded-xl bg-cyan-500 text-black text-xs font-black disabled:opacity-50 transition-all cursor-pointer"
                  >
                    Post Discussion
                  </button>
                </div>
              </motion.div>
            )}

            {discussions.map((post) => (
              <div key={post.id} className="p-4 rounded-2xl bg-black border border-white/5 hover:border-white/15 transition-all group flex gap-4">
                <div className="flex flex-col items-center gap-1">
                  <button 
                    onClick={() => handleUpvote(post.id)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <TrendingUp className="w-5 h-5" />
                  </button>
                  <span className="text-xs font-mono font-bold text-white">{post.upvotes}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400 mb-1">
                    <span className="text-cyan-400 font-bold">@{post.authorUsername}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTime(post.createdAt)}</span>
                  </div>
                  <h3 className="text-base font-bold text-white leading-snug mb-2">{post.title}</h3>
                  <p className="text-sm text-neutral-300 line-clamp-3">{post.content}</p>
                  
                  <div className="mt-3 flex items-center gap-4">
                    <button className="flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-white transition-colors cursor-pointer">
                      <MessageSquare className="w-4 h-4" />
                      {post.repliesCount} Comments
                    </button>
                    <button className="flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-white transition-colors cursor-pointer">
                      <ThumbsUp className="w-4 h-4" />
                      Like
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {discussions.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-neutral-500">
                <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm font-bold">No discussions yet.</p>
                <p className="text-xs">Be the first to start a conversation!</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE: Live Chat Stream */}
        <div className="flex flex-col bg-neutral-900/50 border border-white/10 rounded-3xl overflow-hidden relative">
          <div className="p-4 border-b border-white/10 bg-black/40 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-sm font-black text-white">Live Market Chat</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-bold text-emerald-400">@{msg.authorUsername}</span>
                  <span className="text-[9px] text-neutral-500 font-mono">{formatTime(msg.createdAt)}</span>
                </div>
                <div className="mt-0.5 text-sm text-neutral-200 bg-black/40 p-2.5 rounded-xl rounded-tl-none border border-white/5 inline-block self-start max-w-[95%]">
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendChat} className="p-3 bg-black/60 border-t border-white/10 backdrop-blur-md">
            <div className="relative">
              <input
                type="text"
                placeholder={currentUser ? "Type a message..." : "Sign in to chat..."}
                disabled={!currentUser}
                value={newChatText}
                onChange={(e) => setNewChatText(e.target.value)}
                className="w-full pl-3 pr-10 py-2.5 bg-neutral-900 border border-white/15 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!newChatText.trim() || !currentUser}
                className="absolute right-1.5 top-1.5 p-1.5 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 disabled:opacity-30 disabled:bg-neutral-700 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};
