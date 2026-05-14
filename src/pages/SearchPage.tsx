import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { NewsArticle } from '../types';
import { newsService } from '../services/newsService';
import { Search as SearchIcon, Clock, Eye, X, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { motion } from 'motion/react';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(query);

  useEffect(() => {
    if (!query) {
      setArticles([]);
      return;
    }

    const performSearch = async () => {
      setLoading(true);
      try {
        const data = await newsService.getArticles();
        if (data) {
          const filtered = data.filter(article => 
            article.title.toLowerCase().includes(query.toLowerCase()) ||
            article.summary.toLowerCase().includes(query.toLowerCase()) ||
            article.content.toLowerCase().includes(query.toLowerCase())
          );
          setArticles(filtered);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchParams({ q: inputValue.trim() });
    }
  };

  return (
    <div className="space-y-12 pb-10">
      <div className="space-y-6">
        <h1 className="text-4xl font-black italic tracking-tighter uppercase">Search Center</h1>
        <form onSubmit={handleSearch} className="relative group">
          <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent transition-colors" size={24} />
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="어떤 유행이 궁금한가요?"
            className="h-20 pl-16 pr-16 rounded-[32px] border-white/10 bg-white/5 shadow-2xl text-xl font-bold focus-visible:ring-accent/20 focus-visible:border-accent"
          />
          {inputValue && (
              <button 
                type="button"
                onClick={() => setInputValue('')}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/5 rounded-full text-white/20 hover:text-white transition-colors"
               >
                  <X size={18} />
              </button>
          )}
        </form>
      </div>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
        </div>
      ) : query && articles.length === 0 ? (
        <div className="text-center py-32 glass rounded-[40px] border border-dashed border-white/10">
          <p className="text-white/20 font-black text-2xl italic tracking-tight mb-2">RESULTS NOT FOUND</p>
          <p className="text-white/10 font-bold">"{query}"에 대한 소식이 아직 없네요.</p>
        </div>
      ) : articles.length > 0 ? (
        <div className="space-y-6">
            <p className="text-[10px] font-black text-accent uppercase tracking-widest pl-2">
               Found {articles.length} matched stories for "{query}"
            </p>
          <div className="grid grid-cols-1 gap-6">
            {articles.map((article, idx) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link to={`/news/${article.id}`}>
                  <Card className="glass border-white/5 flex h-[140px] rounded-[32px] overflow-hidden hover:border-accent/40 transition-all group shadow-xl">
                    <div className="w-24 md:w-52 overflow-hidden">
                      <img src={article.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <CardContent className="flex-1 p-6 flex flex-col justify-between">
                      <div className="space-y-1">
                          <Badge variant="outline" className="text-[10px] text-accent/40 border-white/5 font-bold mb-1">
                              {article.category.toUpperCase()}
                          </Badge>
                          <h3 className="text-xl font-bold group-hover:text-accent transition-colors leading-tight line-clamp-1 italic">
                              {article.title}
                          </h3>
                      </div>
                      <div className="flex items-center gap-6 text-[10px] font-bold text-white/20 uppercase tracking-wider">
                          <span className="flex items-center gap-1.5">
                              <Clock size={12} />
                              {formatDistanceToNow(article.publishedAt instanceof Date ? article.publishedAt : (article.publishedAt as any).toDate(), { addSuffix: true, locale: ko })}
                          </span>
                          <span className="flex items-center gap-1.5">
                              <Eye size={12} />
                              {article.viewCount} VIEWS
                          </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
          <div className="py-20 text-center glass rounded-[40px] border border-white/5 bg-white/0">
              <TrendingUp size={80} className="mx-auto mb-6 text-white/5" />
              <p className="text-white/20 font-black text-xl italic mb-6">검색어를 통해 요즘 이슈를 찾아보세요</p>
              <div className="flex flex-wrap justify-center gap-3">
                  {['유행하는 패션', '수능 꿀팁', '연애운세', '신작 게임'].map(tag => (
                      <button key={tag} onClick={() => { setInputValue(tag); setSearchParams({ q: tag }); }} className="px-4 py-2 bg-white/5 rounded-full text-xs font-bold text-white/40 hover:bg-white/10 hover:text-white transition-all">
                        #{tag}
                      </button>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
}
