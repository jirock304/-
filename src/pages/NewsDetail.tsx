import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { newsService } from '../services/newsService';
import { NewsArticle } from '../types';
import Markdown from 'react-markdown';
import { ArrowLeft, Clock, Eye, Share2, Bookmark, PlayCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [scrapped, setScrapped] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchArticle = async () => {
        try {
          const data = await newsService.getArticleById(id);
          if (data) {
            setArticle(data);
            await newsService.updateArticle(id, { viewCount: (data.viewCount || 0) + 1 });
          }
        } catch (err) {
            console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchArticle();
    }
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('링크가 복사되었습니다!');
  };

  const categoriesMap: Record<string, string> = {
    trend: '트렌드',
    study: '학업/입시',
    'school-life': '학교생활',
    hobby: '취미/문화',
    issue: '사회이슈',
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto space-y-10 py-10">
        <Skeleton className="h-[400px] w-full rounded-3xl" />
        <Skeleton className="h-20 w-3/4" />
        <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
        </div>
    </div>
  );

  if (!article) return <div className="p-20 text-center font-black">기사를 찾을 수 없습니다.</div>;

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto pb-32"
    >
      <div className="flex items-center justify-between mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="rounded-full text-white/40 hover:text-white hover:bg-white/5 pr-6"
        >
          <ArrowLeft size={20} className="mr-2" /> 목록으로 돌아가기
        </Button>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setScrapped(!scrapped)} className={scrapped ? "text-accent" : "text-white/40"}>
                <Bookmark size={22} fill={scrapped ? "currentColor" : "none"} />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleShare} className="text-white/40">
                <Share2 size={22} />
            </Button>
        </div>
      </div>

      <div className="space-y-10">
        <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-[40px] overflow-hidden shadow-2xl">
          <img src={article.thumbnailUrl} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-transparent to-transparent"></div>
          <div className="absolute bottom-10 left-10">
             <Badge className="bg-accent text-bg-dark font-black mb-4">
                {categoriesMap[article.category] || article.category}
             </Badge>
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="text-3xl md:text-6xl font-black leading-[1.1] tracking-tighter italic">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 py-6 border-y border-white/5">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                  <span className="font-black text-accent">Y</span>
               </div>
               <div>
                  <p className="text-sm font-bold text-white">{article.authorName || 'YOGO 에디터'}</p>
                  <p className="text-[10px] uppercase font-black text-white/20 tracking-widest">Authorized Source</p>
               </div>
            </div>
            
            <div className="flex items-center gap-6 ml-auto">
               <div className="flex items-center gap-2 text-xs font-bold text-white/30">
                  <Clock size={14} />
                  {format(article.publishedAt instanceof Date ? article.publishedAt : (article.publishedAt as any).toDate(), 'yyyy. MM. dd', { locale: ko })}
               </div>
               <div className="flex items-center gap-2 text-xs font-bold text-white/30">
                  <Eye size={14} />
                  {article.viewCount} VIEWS
               </div>
            </div>
          </div>
        </div>

        <div className="p-8 bg-accent/5 border border-accent/20 rounded-3xl italic text-accent font-medium leading-relaxed">
           "{article.summary}"
        </div>

        {article.videoUrl && (
            <div className="aspect-video w-full rounded-3xl overflow-hidden glass border-white/5 group relative">
                <iframe 
                  src={article.videoUrl.replace('watch?v=', 'embed/')} 
                  className="w-full h-full" 
                  allowFullScreen
                />
            </div>
        )}

        <div className="prose prose-invert max-w-none prose-p:text-lg prose-p:leading-relaxed prose-p:text-white/70 prose-headings:font-black prose-headings:italic prose-strong:text-accent prose-strong:font-black pb-20 border-b border-white/5">
           <Markdown>
             {article.content}
           </Markdown>
        </div>

        <div className="pt-10 flex items-center justify-between">
           <div className="space-y-1">
              <p className="text-[10px] font-black text-accent uppercase tracking-widest">Share this story</p>
              <h3 className="text-xl font-bold italic">친구들에게 공유해주고 싶다면?</h3>
           </div>
           <Button onClick={handleShare} className="bg-white text-bg-dark rounded-full px-8 font-black shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              링크 복사하기
           </Button>
        </div>
      </div>
    </motion.article>
  );
}
