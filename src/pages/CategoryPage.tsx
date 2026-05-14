import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { NewsArticle, Category } from '../types';
import { newsService } from '../services/newsService';
import { Clock, Eye, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { motion } from 'motion/react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';

export default function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  const categoriesMap: Record<string, string> = {
    trend: '트렌드',
    study: '학업/입시',
    'school-life': '학교생활',
    hobby: '취미/문화',
    issue: '사회이슈',
  };

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const data = await newsService.getArticles(categoryId as Category);
        if (data) setArticles(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [categoryId]);

  return (
    <div className="space-y-12 pb-10">
      <div className="flex flex-col gap-2">
        <p className="text-accent font-black text-[10px] uppercase tracking-[0.3em]">Browsing Category</p>
        <h1 className="text-5xl font-black italic tracking-tighter uppercase">
          {categoriesMap[categoryId || ''] || categoryId}
        </h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-64 rounded-[32px]" />
          <Skeleton className="h-64 rounded-[32px]" />
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-40 glass rounded-[40px] border border-dashed border-white/10">
          <p className="text-white/20 font-black text-2xl italic tracking-tight">아직 소식이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {articles.map((article, idx) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link to={`/news/${article.id}`}>
                <Card className="glass border-white/5 h-full rounded-[32px] overflow-hidden group hover:border-accent/40 transition-all border shadow-xl">
                  <CardContent className="p-0">
                    <div className="aspect-[16/9] overflow-hidden">
                      <img
                        src={article.thumbnailUrl}
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-8 space-y-4">
                      <h3 className="text-2xl font-black italic leading-tight group-hover:text-accent transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-white/40 line-clamp-2 font-medium">
                        {article.summary}
                      </p>
                      <div className="flex items-center justify-between pt-6 border-t border-white/5">
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                <Clock size={12} />
                                {formatDistanceToNow(article.publishedAt instanceof Date ? article.publishedAt : (article.publishedAt as any).toDate(), { addSuffix: true, locale: ko })}
                            </span>
                        </div>
                        <ChevronRight size={18} className="text-accent group-hover:translate-x-1 transition-transform" />
                      </div>
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
