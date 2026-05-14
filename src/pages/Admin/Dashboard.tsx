import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Eye, 
  Clock, 
  Trash2, 
  ExternalLink,
  Search,
  LayoutDashboard,
  Filter,
  BarChart3,
  Edit
} from 'lucide-react';
import { newsService } from '../../services/newsService';
import { NewsArticle } from '../../types';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function AdminDashboard() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const data = await newsService.getArticles(undefined, true);
      if (data) setArticles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('이 기사를 영구적으로 삭제하시겠습니까?')) {
      await newsService.deleteArticle(id);
      setArticles(articles.filter(a => a.id !== id));
    }
  };

  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: articles.length,
    published: articles.filter(a => a.status === 'published').length,
    views: articles.reduce((acc, curr) => acc + (curr.viewCount || 0), 0)
  };

  const categoriesMap: Record<string, string> = {
    trend: '트렌드',
    study: '학업/입시',
    'school-life': '학교생활',
    hobby: '취미/문화',
    issue: '사회이슈',
  };

  if (loading) return (
    <div className="p-20 text-center">
        <Skeleton className="h-[400px] w-full rounded-3xl" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center shadow-lg shadow-accent/20">
              <LayoutDashboard className="text-bg-dark" size={32} />
           </div>
           <div>
              <h1 className="text-3xl font-black italic tracking-tighter">MANAGER SYSTEM</h1>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">Content Management Service</p>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="rounded-xl font-bold glass" onClick={() => navigate('/')}>
              웹사이트 보기
           </Button>
           <Button onClick={() => navigate('/admin/editor')} className="bg-accent text-bg-dark hover:bg-accent/80 rounded-xl font-black gap-2 h-12 px-6">
              <Plus size={20} /> 새 기사 작성
           </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="glass border-white/5 rounded-3xl p-6 relative overflow-hidden">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Total Articles</p>
            <h2 className="text-5xl font-black mt-2 italic">{stats.total}</h2>
            <BarChart3 className="absolute -right-4 -bottom-4 text-white/5" size={100} />
         </Card>
         <Card className="glass border-white/5 rounded-3xl p-6 relative overflow-hidden">
            <p className="text-[10px] font-black text-accent uppercase tracking-widest">Published</p>
            <h2 className="text-5xl font-black mt-2 italic text-accent">{stats.published}</h2>
         </Card>
         <Card className="glass border-white/5 rounded-3xl p-6 relative overflow-hidden">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Total Views</p>
            <h2 className="text-5xl font-black mt-2 italic">{stats.views.toLocaleString()}</h2>
         </Card>
      </div>

      <Card className="glass border-white/5 rounded-[40px] overflow-hidden">
        <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between bg-white/5">
           <CardTitle className="text-xl font-black italic">ARTICLE LIST</CardTitle>
           <div className="flex items-center gap-4">
              <div className="relative group hidden sm:block">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent transition-colors" size={18} />
                  <input 
                    type="text" 
                    placeholder="제목 검색..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-full py-2 pl-12 pr-4 outline-none focus:border-accent/40 text-sm w-64"
                  />
              </div>
              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/5"><Filter size={20}/></Button>
           </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-transparent">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="py-6 pl-8 font-black uppercase text-[10px] tracking-widest text-white/40">News info</TableHead>
                <TableHead className="py-6 font-black uppercase text-[10px] tracking-widest text-white/40">Category</TableHead>
                <TableHead className="py-6 font-black uppercase text-[10px] tracking-widest text-white/40 text-center">Status</TableHead>
                <TableHead className="py-6 font-black uppercase text-[10px] tracking-widest text-white/40 text-center">Views</TableHead>
                <TableHead className="py-6 font-black uppercase text-[10px] tracking-widest text-white/40 text-right pr-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredArticles.map((article) => (
                <TableRow key={article.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                  <TableCell className="py-6 pl-8">
                     <div className="flex items-center gap-4">
                        <img src={article.thumbnailUrl} className="w-14 h-14 rounded-xl object-cover border border-white/5" />
                        <div>
                           <p className="font-bold text-lg leading-tight group-hover:text-accent transition-colors">{article.title}</p>
                           <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">
                             {format(article.publishedAt instanceof Date ? article.publishedAt : (article.publishedAt as any).toDate(), 'yyyy-MM-dd')}
                           </p>
                        </div>
                     </div>
                  </TableCell>
                  <TableCell>
                     <Badge variant="outline" className="border-white/10 text-white/40 font-black tracking-widest uppercase text-[10px]">
                        {categoriesMap[article.category] || article.category}
                     </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                     <Badge className={article.status === 'published' ? "bg-green-500/20 text-green-500 hover:bg-green-500/20" : "bg-white/5 text-white/40 hover:bg-white/5"}>
                        {article.status.toUpperCase()}
                     </Badge>
                  </TableCell>
                  <TableCell className="text-center font-black text-xl italic tracking-tighter">
                     {article.viewCount}
                  </TableCell>
                  <TableCell className="text-right pr-8">
                     <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/editor/${article.id}`)} className="rounded-xl hover:bg-accent hover:text-bg-dark">
                           <Edit size={18} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(article.id)} className="rounded-xl hover:bg-red-500 hover:text-white">
                           <Trash2 size={18} />
                        </Button>
                     </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
