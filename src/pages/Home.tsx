import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { newsService } from '../services/newsService';
import { NewsArticle } from '../types';
import { Clock, Eye, TrendingUp, ChevronRight, Bookmark } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function Home() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const navigate = useNavigate();

  const categories = [
    { id: 'all', name: '전체' },
    { id: 'trend', name: '트렌드' },
    { id: 'study', name: '학업/입시' },
    { id: 'school-life', name: '학교생활' },
    { id: 'hobby', name: '취미/문화' },
    { id: 'issue', name: '사회이슈' },
  ];

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const data = await newsService.getArticles(activeCategory === 'all' ? undefined : activeCategory as any);
        if (data) setArticles(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [activeCategory]);

  const featuredArticle = articles.length > 0 ? articles[0] : null;
  const listArticles = articles.slice(1);

  if (loading) {
    return (
      <div className="space-y-10">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-[400px] w-full rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Category Slider */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-6 py-2.5 rounded-full text-sm font-black transition-all whitespace-nowrap ${
              activeCategory === cat.id 
                ? "bg-accent text-bg-dark shadow-[0_0_20px_rgba(204,255,0,0.3)]" 
                : "text-white/40 hover:text-white"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {featuredArticle && activeCategory === 'all' && (
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="relative"
        >
          <Link to={`/news/${featuredArticle.id}`}>
            <div className="relative aspect-[16/10] md:aspect-[21/9] rounded-3xl overflow-hidden group">
              <img 
                src={featuredArticle.thumbnailUrl || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=1000'} 
                alt="" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 md:p-10 space-y-4">
                <Badge className="bg-accent text-bg-dark font-black hover:bg-accent">FEATURED</Badge>
                <h1 className="text-2xl md:text-5xl font-black leading-tight max-w-3xl italic tracking-tighter">
                  {featuredArticle.title}
                </h1>
                <p className="text-white/60 line-clamp-2 max-w-xl font-medium">
                  {featuredArticle.summary}
                </p>
                <div className="flex items-center gap-6 pt-2">
                   <div className="flex items-center gap-2 text-xs font-bold text-accent">
                      <TrendingUp size={14} />
                      NOW TRENDING
                   </div>
                   <div className="flex items-center gap-2 text-xs font-bold text-white/40">
                      <Clock size={14} />
                      {formatDistanceToNow(featuredArticle.publishedAt instanceof Date ? featuredArticle.publishedAt : (featuredArticle.publishedAt as any).toDate(), { addSuffix: true, locale: ko })}
                   </div>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      )}

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(activeCategory === 'all' ? listArticles : articles).map((article, idx) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Link to={`/news/${article.id}`}>
              <Card className="glass border-white/5 rounded-2xl overflow-hidden group hover:border-accent/30 transition-all border">
                <CardContent className="p-0">
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={article.thumbnailUrl} 
                      alt="" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px] text-accent/60 border-accent/20 uppercase tracking-widest px-2 py-0.5">
                        {categories.find(c => c.id === article.category)?.name}
                      </Badge>
                      <span className="text-[10px] font-bold text-white/20 uppercase">
                        {formatDistanceToNow(article.publishedAt instanceof Date ? article.publishedAt : (article.publishedAt as any).toDate(), { addSuffix: true, locale: ko })}
                      </span>
                    </div>
                    <h3 className="text-xl font-black leading-snug group-hover:text-accent transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-white/40 line-clamp-2 font-medium">
                      {article.summary}
                    </p>
                    <div className="pt-4 flex items-center justify-between border-t border-white/5">
                       <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/30">
                            <Eye size={12}/> {article.viewCount}
                          </div>
                       </div>
                       <ChevronRight size={18} className="text-accent transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {articles.length === 0 && (
        <div className="py-20 text-center glass rounded-3xl border border-dashed border-white/10">
           <Bookmark size={48} className="mx-auto mb-4 text-white/10" />
           <p className="text-lg font-black text-white/20">아직 등록된 기사가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
