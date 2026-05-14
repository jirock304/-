import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { newsService } from '../../services/newsService';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent } from '../../components/ui/card';
import { ArrowLeft, Save, Sparkles, Image as ImageIcon, Video, Calendar, Eye } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { toast } from 'sonner';
import { NewsArticle, Category } from '../../types';
import Markdown from 'react-markdown';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { motion } from 'motion/react';
import { Badge } from '../../components/ui/badge';

export default function AdminEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);

  const [formData, setFormData] = useState<Partial<NewsArticle>>({
    title: '',
    summary: '',
    content: '',
    thumbnailUrl: '',
    category: 'trend',
    status: 'draft',
    videoUrl: '',
  });

  const [publishedAtDate, setPublishedAtDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (id) {
      const fetchArticle = async () => {
        try {
          const data = await newsService.getArticleById(id);
          if (data) {
            setFormData({
                ...data,
                publishedAt: data.publishedAt instanceof Date ? data.publishedAt : (data.publishedAt as any).toDate(),
            });
            const dateObj = data.publishedAt instanceof Date ? data.publishedAt : (data.publishedAt as any).toDate();
            setPublishedAtDate(dateObj.toISOString().split('T')[0]);
          }
        } catch (err) {
          toast.error('기사를 불러오지 못했습니다.');
        } finally {
          setInitialLoading(false);
        }
      };
      fetchArticle();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error('제목과 내용을 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        authorId: auth.currentUser?.uid || 'anonymous',
        authorName: auth.currentUser?.displayName || '관리자',
        publishedAt: new Date(publishedAtDate),
      } as Omit<NewsArticle, 'id' | 'viewCount'>;

      if (id) {
        await newsService.updateArticle(id, payload);
        toast.success('기사가 성공적으로 수정되었습니다.');
      } else {
        await newsService.createArticle(payload);
        toast.success('기사가 성공적으로 등록되었습니다.');
      }
      navigate('/admin');
    } catch (err) {
      toast.error('저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <div className="p-20 text-center animate-pulse text-accent font-black">UNPACKING DATA...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-32">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin')}
            className="rounded-full bg-white/5 hover:bg-white/10"
          >
            <ArrowLeft size={24} />
          </Button>
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter uppercase">{id ? 'Edit Story' : 'New Story'}</h1>
            <p className="text-[10px] text-accent font-black tracking-[0.2em] uppercase mt-1">Publisher Workspace</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <Button variant="ghost" className="font-bold text-white/40 hover:text-white" onClick={() => navigate('/admin')}>
              CANCEL
           </Button>
           <Button onClick={handleSubmit} disabled={loading} className="bg-accent text-bg-dark hover:bg-accent/80 rounded-2xl font-black px-10 h-14 shadow-lg shadow-accent/20">
              {loading ? 'SAVING...' : 'SAVE ARTICLE'} <Save className="ml-2" size={20} />
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Editor Main */}
        <Card className="lg:col-span-2 glass border-white/5 rounded-[40px] overflow-hidden">
          <CardContent className="p-10">
            <Tabs defaultValue="edit" className="space-y-8">
              <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <TabsList className="bg-white/5 p-1.5 rounded-2xl border border-white/5">
                  <TabsTrigger value="edit" className="rounded-xl px-6 py-2.5 font-black data-[state=active]:bg-accent data-[state=active]:text-bg-dark">편집</TabsTrigger>
                  <TabsTrigger value="preview" className="rounded-xl px-6 py-2.5 font-black data-[state=active]:bg-accent data-[state=active]:text-bg-dark">미리보기</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2 text-[10px] font-black text-white/20 tracking-wider">
                   <Sparkles size={14} className="text-accent" /> LIVE SYNC ACTIVE
                </div>
              </div>

              <TabsContent value="edit" className="space-y-8 mt-0 outline-none">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest pl-2">Article Headline</Label>
                  <Input 
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-white/5 border-white/10 rounded-2xl h-20 px-8 text-3xl font-black italic tracking-tighter focus:ring-accent focus:border-accent"
                    placeholder="임팩트 있는 제목을 입력하세요"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest pl-2">Executive Summary</Label>
                  <Textarea 
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    className="bg-white/5 border-white/10 rounded-3xl p-8 min-h-[120px] text-lg font-medium resize-none focus:ring-accent focus:border-accent"
                    placeholder="기사를 한 문장으로 정의한다면?"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest pl-2">Markdown Content</Label>
                  <Textarea 
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="bg-white/5 border-white/10 rounded-[32px] p-8 min-h-[600px] text-lg leading-relaxed focus:ring-accent focus:border-accent"
                    placeholder="여기에 소식을 자유롭게 적어주세요. 마크다운 스타일을 활용할 수 있습니다."
                  />
                </div>
              </TabsContent>

              <TabsContent value="preview" className="mt-0 outline-none">
                 <div className="prose prose-invert max-w-none prose-p:text-lg prose-p:text-white/60 prose-headings:font-black prose-headings:italic prose-strong:text-accent p-6 rounded-[32px] bg-black/40 border border-white/5">
                    <h1 className="text-4xl italic">{formData.title || '제목 없음'}</h1>
                    <p className="p-6 bg-accent/5 border-l-4 border-accent italic text-accent">{formData.summary || '요약이 없습니다.'}</p>
                    <Markdown>{formData.content || '내용이 없습니다.'}</Markdown>
                 </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Sidebar Settings */}
        <div className="space-y-8">
           <Card className="glass border-white/5 rounded-[40px] overflow-hidden">
             <CardContent className="p-8 space-y-10">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2">
                     <Calendar size={14} className="text-accent" /> Publishing Status
                  </Label>
                  <div className="space-y-3">
                    <Select 
                      value={formData.status} 
                      onValueChange={(val: any) => setFormData({ ...formData, status: val })}
                    >
                      <SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10 font-black">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">DRAFT (LOCAL)</SelectItem>
                        <SelectItem value="published">PUBLISHED (LIVE)</SelectItem>
                        <SelectItem value="scheduled">SCHEDULED</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input 
                      type="date"
                      value={publishedAtDate}
                      onChange={(e) => setPublishedAtDate(e.target.value)}
                      className="h-14 rounded-2xl bg-white/5 border-white/10 font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2">
                     <ImageIcon size={14} className="text-accent" /> Branding Asset
                  </Label>
                  <div className="space-y-4">
                     <Input 
                        value={formData.thumbnailUrl}
                        onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                        placeholder="이미지 URL을 입력하세요"
                        className="h-14 rounded-2xl bg-white/5 border-white/10"
                     />
                     {formData.thumbnailUrl && (
                        <div className="aspect-video rounded-3xl overflow-hidden border border-white/10">
                           <img src={formData.thumbnailUrl} className="w-full h-full object-cover" />
                        </div>
                     )}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2">
                     <Sparkles size={14} className="text-accent" /> Category Tag
                  </Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(val: any) => setFormData({ ...formData, category: val })}
                  >
                    <SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10 font-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trend">TREND (트렌드)</SelectItem>
                      <SelectItem value="study">STUDY (학업/입시)</SelectItem>
                      <SelectItem value="school-life">LIFE (학교생활)</SelectItem>
                      <SelectItem value="hobby">ART/HOBBY (취미)</SelectItem>
                      <SelectItem value="issue">NEWS (이슈)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2">
                     <Video size={14} className="text-accent" /> Video Link
                  </Label>
                  <Input 
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="YouTube URL..."
                    className="h-14 rounded-2xl bg-white/5 border-white/10"
                  />
                </div>
             </CardContent>
           </Card>
           
           <div className="p-6 bg-red-500/10 rounded-3xl border border-red-500/20 text-center">
              <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">Danger Zone</p>
              <Button variant="ghost" className="w-full text-red-500 font-black hover:bg-red-500 hover:text-white rounded-xl">RESET EDITOR</Button>
           </div>
        </div>
      </div>
    </div>
  );
}
