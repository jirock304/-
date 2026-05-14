import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { NewsArticle } from '../types';
import { scrapService } from '../services/scrapService';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, Search, Clock, Eye, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { motion } from 'motion/react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';

interface Props {
  user: User | null;
}

export default function ScrapsPage({ user }: Props) {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchScraps = async () => {
      setLoading(true);
      try {
        const data = await scrapService.getScraps(user.uid);
        if (data) setArticles(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchScraps();
  }, [user]);

  if (!user) {
    return (
        <div className="flex flex-col items-center justify-center py-40">
            <div className="w-24 h-24 bg-white/5 rounded-[32px] flex items-center justify-center text-white/20 mb-8 border border-white/5 shadow-xl">
                <Bookmark size={48} />
            </div>
            <h2 className="text-3xl font-black text-white italic mb-3 tracking-tighter">COLLECTION LOCKED</h2>
            <p className="text-white/40 font-bold mb-10 text-center max-w-xs">로그인하고 관심 있는 뉴스를 나만의 리스트에 저장해보세요!</p>
            <Button onClick={() => navigate('/login')} className="bg-accent text-bg-dark rounded-full px-12 h-16 font-black text-xl shadow-[0_0_30px_rgba(204,255,0,0.2)]">
                JOIN NOW
            </Button>
        </div>
    );
  }

  return (
    <div className="space-y-12 pb-10">
      <div className="flex items-center gap-4">
         <div className="w-16 h-16 bg-accent/20 rounded-[28px] flex items-center justify-center border border-accent/20">
            <Bookmark className="text-accent" size={32} />
         </div>
         <div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase">My Collection</h1>
            <p className="text-xs font-black text-white/20 uppercase tracking-[0.25em] mt-1">Saved Stories & Trends</p>
         </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-40 glass rounded-[40px] border border-dashed border-white/10 flex flex-col items-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-white/10 mb-6 underline-offset-8">
                <Search size={32} />
            </div>
          <p className="text-white/20 font-black text-2xl italic tracking-tight mb-8">아직 저장된 소식이 없습니다.</p>
          <Button variant="outline" onClick={() => navigate('/')} className="rounded-full border-white/10 px-8 h-12 font-bold hover:bg-accent hover:text-bg-dark transition-all">
             EXPLORE STORIES
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {articles.map((article, idx) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link to={`/news/${article.id}`}>
                <Card className="glass border-white/5 flex h-[180px] rounded-[32px] overflow-hidden hover:border-accent/40 transition-all group shadow-xl">
                  <div className="w-1/3 overflow-hidden">
                    <img
                      src={article.thumbnailUrl}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <CardContent className="w-2/3 p-6 flex flex-col justify-between">
                    <div className="space-y-2">
                        <Badge variant="outline" className="text-[10px] text-accent/60 border-accent/20 font-black uppercase tracking-widest px-2 py-0.5">
                            SAVED STORY
                        </Badge>
                        <h3 className="text-xl font-black text-white line-clamp-2 leading-tight group-hover:text-accent transition-colors">
                            {article.title}
                        </h3>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Clock size={12} />
                        {formatDistanceToNow(article.publishedAt instanceof Date ? article.publishedAt : (article.publishedAt as any).toDate(), { addSuffix: true, locale: ko })}
                      </span>
                      <ChevronRight size={18} className="text-accent group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
