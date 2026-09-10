/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Newspaper, ChevronRight, X, Clock, Search, Menu, ThumbsUp, ThumbsDown, CheckCircle2, MessageSquare, Send, Printer, Twitter, Facebook, Linkedin, Share2 } from 'lucide-react';
import { fetchNewsArticles } from './services/newsService';
import { NewsArticle, NewsCategory, PublicationInfo, Comment } from './types';

const publication: PublicationInfo = {
  name: "Dainik Jahan",
  description: "Global Edition News Portal",
  company: "UK School of Artificial Intelligence Ltd.",
  companyReg: "Company No: 17041560",
  editorInChief: "Sheikh Mehdi Hasan Nadim",
  edition: "GLOBAL EDITION"
};

export default function App() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentSortOrder, setCommentSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [newComment, setNewComment] = useState("");
  const [currentDate] = useState(new Date().toLocaleDateString('en-GB', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  }));

  useEffect(() => {
    async function load() {
      const data = await fetchNewsArticles();
      setArticles(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleCommentSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedArticle || !newComment.trim()) return;

    const comment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      author: "Guest Reader",
      text: newComment.trim(),
      publishedAt: new Date().toISOString()
    };

    setComments({
      ...comments,
      [selectedArticle.id]: [comment, ...(comments[selectedArticle.id] || [])]
    });
    setNewComment("");
  };

  const handlePrint = () => {
    window.print();
  };

  const topStory = articles.find(a => a.isTopStory) || articles[0];
  const feed = articles.filter(a => a.id !== topStory?.id);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Newspaper className="w-12 h-12 text-guardian-blue animate-pulse" />
          <p className="text-gray-400 font-serif italic text-xl">Curating the day's events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white selection:bg-guardian-blue selection:text-white">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-100 py-2 text-[11px] font-medium text-gray-500">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span>{currentDate}</span>
            <span className="h-3 w-[1px] bg-gray-200" />
            <span className="text-[#222]">English Edition</span>
          </div>
          <div className="flex items-center gap-4">
             <button className="hover:text-guardian-blue flex items-center gap-1 transition-colors">
               Sign in
             </button>
             <button className="p-1 hover:text-guardian-blue">
               <Search className="w-3.5 h-3.5" />
             </button>
          </div>
        </div>
      </div>

      {/* Masthead */}
      <header className="bg-white border-b-4 border-guardian-blue">
        <div className="max-w-7xl mx-auto px-6 py-10 md:py-14">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
            <div>
              <h1 className="font-serif text-6xl md:text-8xl font-black tracking-tight text-guardian-blue mb-2 hover:opacity-80 transition-opacity">
                <a href="/">{publication.name}</a>
              </h1>
              <p className="text-gray-500 font-sans font-medium tracking-wide text-sm">{publication.description}</p>
            </div>
            <div className="hidden md:flex flex-col items-end">
              <span className="text-guardian-red font-black text-sm tracking-[0.2em] mb-1">
                {publication.edition}
              </span>
              <div className="h-1 w-24 bg-guardian-red" />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation - Simple Guardian style */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-6 overflow-x-auto no-scrollbar py-3">
          {["News", "AI & Tech", "Business", "World", "Opinion", "Science"].map((cat) => (
            <a key={cat} href="#" className="whitespace-nowrap text-sm font-bold text-[#222] hover:text-guardian-blue transition-colors">
              {cat}
            </a>
          ))}
          <button className="hidden md:block p-1">
             <Menu className="w-4 h-4" />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Main Feed Content */}
          <div className="lg:col-span-8">
            
            {/* Lead Story */}
            {topStory && (
              <motion.article 
                onClick={() => setSelectedArticle(topStory)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="group cursor-pointer mb-16"
              >
                <div className="aspect-video mb-8 overflow-hidden rounded-sm bg-gray-100">
                  <img 
                    src={topStory.imageUrl} 
                    alt={topStory.title} 
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                    referrerPolicy="no-referrer"
                  />
                </div>
                
                <div className="border-t border-guardian-red pt-4 mb-4">
                  <span className="text-guardian-red font-bold text-xs uppercase tracking-widest">{topStory.category}</span>
                </div>

                <h2 className="guardian-headline font-serif font-black text-[#222] group-hover:text-guardian-blue transition-colors mb-6">
                  {topStory.title}
                </h2>
                
                <p className="text-lg text-[#333] leading-relaxed mb-6 max-w-3xl">
                  {topStory.excerpt}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-gray-500 font-bold">
                  <span className="text-guardian-blue">By {topStory.author}</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(topStory.publishedAt).getHours()}h ago</span>
                  </div>
                </div>
              </motion.article>
            )}

            {/* Sub-grid of news */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-14">
              {feed.map((article, idx) => (
                <motion.article 
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="group cursor-pointer border-t border-gray-100 pt-6"
                >
                  <div className="aspect-[16/10] mb-5 overflow-hidden rounded-sm bg-gray-50">
                    <img 
                      src={article.imageUrl} 
                      alt={article.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  
                  <span className="text-guardian-blue font-bold text-[10px] uppercase tracking-widest block mb-2">
                    {article.category}
                  </span>
                  
                  <h3 className="font-serif text-2xl font-bold leading-tight text-[#222] group-hover:text-guardian-blue transition-colors mb-3">
                    {article.title}
                  </h3>
                  
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-[11px] font-bold text-gray-400">
                    <span className="text-gray-600">{article.author}</span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.article>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
             <div className="bg-white border border-gray-100 shadow-sm p-8 sticky top-10 rounded-sm">
                <h3 className="uppercase tracking-[0.2em] text-[10px] font-black text-guardian-blue mb-8 border-b-2 border-guardian-blue pb-1 inline-block">
                  Publication Info
                </h3>
                
                <div className="space-y-8">
                  <div>
                    <p className="font-bold text-lg text-[#222] mb-1">{publication.company}</p>
                    <p className="text-xs text-gray-500 font-mono tracking-widest">{publication.companyReg}</p>
                  </div>
                  
                  <div>
                    <span className="text-[10px] font-black uppercase text-gray-400 block mb-2 tracking-widest">Editor-in-Chief</span>
                    <p className="font-serif text-2xl font-bold text-guardian-blue">{publication.editorInChief}</p>
                  </div>

                  <div className="bg-[#f3f7f9] p-6 rounded-sm border-l-4 border-guardian-blue italic text-sm text-[#333] leading-relaxed">
                    "Providing the world with nuanced clarity in an age of automated noise."
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-100">
                  <div className="flex gap-1.5 mb-4">
                     {[...Array(5)].map((_, i) => <div key={i} className="h-1 w-full bg-guardian-red/10" />)}
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold tracking-widest">© {new Date().getFullYear()} DAINIK JAHAN ARCHIVE</p>
                </div>
             </div>
          </aside>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#121212] text-white py-20 mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <h2 className="font-serif text-4xl font-black text-white mb-6 uppercase tracking-tighter">
                {publication.name}
              </h2>
              <p className="text-gray-400 max-w-sm leading-relaxed text-sm mb-8">
                The independent voice of intelligence, committed to delivering global news and AI deep-dives for the digital era.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest mb-6 text-gray-500">Sections</h4>
              <ul className="space-y-4 text-sm text-gray-300">
                <li><a href="#" className="hover:text-guardian-blue">AI Weekly</a></li>
                <li><a href="#" className="hover:text-guardian-blue">Global Reports</a></li>
                <li><a href="#" className="hover:text-guardian-blue">Editorial</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest mb-6 text-gray-500">Corporate</h4>
              <ul className="space-y-4 text-sm text-gray-300">
                <li><a href="#" className="hover:text-guardian-blue">Ethics Charter</a></li>
                <li><a href="#" className="hover:text-guardian-blue">Advertising</a></li>
                <li><a href="#" className="hover:text-guardian-blue">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-10 text-[10px] text-gray-500 font-bold uppercase tracking-widest flex flex-col md:flex-row justify-between gap-4">
            <span>Powered by the UK School of Artificial Intelligence</span>
            <span>Est. 1974 • All Rights Reserved</span>
          </div>
        </div>
      </footer>

      {/* Article Reader Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center sm:p-6"
          >
            <div 
              className="absolute inset-0 bg-[#222]/95 backdrop-blur-sm" 
              onClick={() => {
                setSelectedArticle(null);
                setIsImageZoomed(false);
              }}
            />
            
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="relative w-full max-w-5xl bg-white sm:rounded-sm shadow-2xl overflow-hidden pointer-events-auto max-h-screen sm:max-h-[92vh] flex flex-col print:max-h-none print:shadow-none print:bg-white"
            >
              <div className="absolute top-4 right-4 z-20 flex gap-2 print:hidden">
                <div className="flex bg-white/80 rounded-full overflow-hidden shadow-sm hover:bg-white transition-colors">
                  <div className="p-2 flex items-center justify-center text-gray-400 border-r border-gray-100">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <button 
                    onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(selectedArticle.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
                    className="p-2 text-gray-500 hover:text-[#1DA1F2] hover:bg-gray-50 transition-colors"
                    title="Share on Twitter"
                  >
                    <Twitter className="w-4 h-4 fill-current" />
                  </button>
                  <button 
                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                    className="p-2 text-gray-500 hover:text-[#4267B2] hover:bg-gray-50 transition-colors"
                    title="Share on Facebook"
                  >
                    <Facebook className="w-4 h-4 fill-current" />
                  </button>
                  <button 
                    onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
                    className="p-2 text-gray-500 hover:text-[#0077b5] hover:bg-gray-50 transition-colors"
                    title="Share on LinkedIn"
                  >
                    <Linkedin className="w-4 h-4 fill-current" />
                  </button>
                </div>
                <button 
                  onClick={handlePrint}
                  className="p-2 bg-white/80 hover:bg-white rounded-full transition-colors shadow-sm"
                  title="Print Article"
                >
                  <Printer className="w-5 h-5 text-guardian-blue" />
                </button>
                <button 
                  onClick={() => {
                    setSelectedArticle(null);
                    setIsImageZoomed(false);
                  }}
                  className="p-2 bg-white/80 hover:bg-white rounded-full transition-colors shadow-sm"
                  aria-label="Close"
                >
                  <X className="w-6 h-6 text-[#222]" />
                </button>
              </div>

              <AnimatePresence>
                {isImageZoomed && selectedArticle && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95 pointer-events-auto cursor-zoom-out"
                    onClick={() => setIsImageZoomed(false)}
                  >
                    <motion.img 
                      layoutId={`article-image-${selectedArticle.id}`}
                      src={selectedArticle.imageUrl} 
                      className="max-w-full max-h-full object-contain shadow-2xl"
                      referrerPolicy="no-referrer"
                    />
                    <button className="absolute top-6 right-6 text-white hover:text-guardian-red p-2 bg-black/20 rounded-full transition-colors">
                      <X className="w-8 h-8" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="overflow-y-auto flex-1 custom-scrollbar print:overflow-visible">
                <motion.div 
                  layoutId={`article-image-${selectedArticle.id}`}
                  className="aspect-[21/9] w-full bg-gray-100 overflow-hidden print:hidden cursor-zoom-in"
                  onClick={() => setIsImageZoomed(true)}
                >
                  <img src={selectedArticle.imageUrl} className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.03]" referrerPolicy="no-referrer" />
                </motion.div>
                
                <div className="max-w-3xl mx-auto px-6 md:px-12 py-12 print:px-0">
                  <div className="hidden print:block border-b-2 border-guardian-blue mb-10 pb-4">
                     <div className="font-serif text-3xl font-black text-guardian-blue">{publication.name}</div>
                     <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">{publication.edition} • Digital Dispatch</div>
                  </div>

                  <div className="border-b border-gray-100 pb-8 mb-10 print:mb-6">
                    <span className="inline-block text-guardian-red font-black text-xs uppercase tracking-widest mb-4">
                      {selectedArticle.category}
                    </span>
                    <h2 className="font-serif text-4xl md:text-6xl font-black text-[#222] leading-[1.1] mb-8">
                      {selectedArticle.title}
                    </h2>

                    {selectedArticle.summary && (
                      <div className="mb-10 p-6 bg-guardian-blue/5 border-l-4 border-guardian-blue rounded-r-lg shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-1.5 h-1.5 bg-guardian-blue rounded-full animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-guardian-blue/60">AI Intelligence Brief</span>
                        </div>
                        <p className="font-serif text-lg md:text-xl text-guardian-blue italic leading-snug">
                          "{selectedArticle.summary}"
                        </p>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-6 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-guardian-blue flex items-center justify-center font-serif text-white font-bold">
                          {selectedArticle.author.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-guardian-blue">{selectedArticle.author}</span>
                          <span className="text-gray-400 text-xs">{new Date(selectedArticle.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="prose prose-guardian max-w-none">
                    {selectedArticle.content.split('\n\n').map((para, i) => (
                      <p key={i} className="font-sans text-[18px] text-[#333] leading-relaxed mb-8 first-letter:text-5xl first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:font-black first-letter:text-guardian-blue first-letter:leading-none">
                        {para}
                      </p>
                    ))}
                  </div>
                  
                  <div className="mt-20 pt-12 border-t border-gray-100">
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-widest text-center mb-10">
                      END OF ARTICLE • DAINIK JAHAN GLOBAL
                    </div>

                    {/* Feedback Section */}
                    <div className="max-w-xl mx-auto bg-gray-50 rounded-lg p-8 border border-gray-100 print:hidden">
                      <AnimatePresence mode="wait">
                        {!feedbackGiven[selectedArticle.id] ? (
                          <motion.div 
                            key="ask"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-6"
                          >
                            <h4 className="font-serif text-xl font-bold text-[#222]">Was this article helpful?</h4>
                            <div className="flex gap-4">
                              <button 
                                onClick={() => setFeedbackGiven({...feedbackGiven, [selectedArticle.id]: true})}
                                className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-bold text-guardian-blue hover:bg-guardian-blue hover:text-white hover:border-guardian-blue transition-all group"
                              >
                                <ThumbsUp className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                                Yes, it was
                              </button>
                              <button 
                                onClick={() => setFeedbackGiven({...feedbackGiven, [selectedArticle.id]: true})}
                                className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-600 hover:bg-guardian-red hover:text-white hover:border-guardian-red transition-all group"
                              >
                                <ThumbsDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
                                Not really
                              </button>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div 
                            key="thanks"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center gap-3 py-4 text-center"
                          >
                            <div className="w-12 h-12 bg-guardian-blue/10 rounded-full flex items-center justify-center mb-2">
                               <CheckCircle2 className="w-6 h-6 text-guardian-blue" />
                            </div>
                            <h4 className="font-serif text-xl font-bold text-guardian-blue">Thank you for your feedback!</h4>
                            <p className="text-sm text-gray-500">Your opinion helps us improve our reporting for readers globally.</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Comments Section */}
                    <div className="mt-16 pt-12 border-t border-gray-100 print:hidden">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-guardian-blue" />
                          <h3 className="font-serif text-2xl font-bold text-[#222]">Reader Comments</h3>
                          <span className="ml-2 bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full font-bold">
                            {(comments[selectedArticle.id] || []).length}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-md border border-gray-100">
                          <button 
                            onClick={() => setCommentSortOrder('newest')}
                            className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded transition-all ${commentSortOrder === 'newest' ? 'bg-guardian-blue text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                          >
                            Newest
                          </button>
                          <button 
                            onClick={() => setCommentSortOrder('oldest')}
                            className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded transition-all ${commentSortOrder === 'oldest' ? 'bg-guardian-blue text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                          >
                            Oldest
                          </button>
                        </div>
                      </div>

                      <form onSubmit={handleCommentSubmit} className="mb-12">
                        <div className="relative">
                          <textarea 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Share your thoughts on this story..."
                            className="w-full min-h-[120px] p-4 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-guardian-blue/10 focus:border-guardian-blue outline-none transition-all font-sans text-sm resize-none"
                          />
                          <button 
                            type="submit"
                            disabled={!newComment.trim()}
                            className="absolute bottom-4 right-4 bg-guardian-blue text-white p-2 rounded-full hover:bg-guardian-blue/90 disabled:opacity-50 disabled:hover:bg-guardian-blue transition-all"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="mt-2 text-[10px] text-gray-400 uppercase font-black tracking-widest">
                          Please maintain global editorial standards when commenting.
                        </p>
                      </form>

                      <div className="space-y-8">
                        <AnimatePresence mode="popLayout">
                          {[...(comments[selectedArticle.id] || [])]
                            .sort((a, b) => {
                              const timeA = new Date(a.publishedAt).getTime();
                              const timeB = new Date(b.publishedAt).getTime();
                              return commentSortOrder === 'newest' ? timeB - timeA : timeA - timeB;
                            })
                            .map((comment) => (
                              <motion.div 
                                key={comment.id}
                                layout
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="group"
                              >
                                <div className="flex gap-4">
                                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-guardian-blue/5 border border-guardian-blue/10 flex items-center justify-center font-bold text-guardian-blue text-xs">
                                    {comment.author.charAt(0)}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="font-bold text-sm text-guardian-blue">{comment.author}</span>
                                      <span className="text-[10px] text-gray-400 font-bold">
                                        {new Date(comment.publishedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed bg-white p-4 rounded-lg border border-gray-50 shadow-sm group-hover:border-gray-200 transition-colors">
                                      {comment.text}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                        </AnimatePresence>
                        
                        {(comments[selectedArticle.id] || []).length === 0 && (
                          <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <p className="text-sm text-gray-400 font-serif italic">Be the first to join the global discussion on this topic.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #eee; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ddd; }
      `}</style>
      
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .pointer-events-auto, .pointer-events-auto * {
            visibility: visible;
          }
          .pointer-events-auto {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
          }
          .print\:hidden {
            display: none !important;
          }
          @page {
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  );
}
