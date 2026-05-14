import { useState, useEffect } from 'react';
import { X, Save, Upload, Video, Image as ImageIcon } from 'lucide-react';
import { NewsItem, createNews, updateNews } from '../../lib/newsService';

interface NewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  editItem?: NewsItem | null;
}

export default function NewsModal({ isOpen, onClose, editItem }: NewsModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Trend',
    imageUrl: '',
    videoUrl: ''
  });

  useEffect(() => {
    if (editItem) {
      setFormData({
        title: editItem.title,
        content: editItem.content,
        category: editItem.category,
        imageUrl: editItem.imageUrl || '',
        videoUrl: editItem.videoUrl || ''
      });
    } else {
      setFormData({ title: '', content: '', category: 'Trend', imageUrl: '', videoUrl: '' });
    }
  }, [editItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editItem) {
        await updateNews(editItem.id, formData);
      } else {
        await createNews({ ...formData, authorId: 'admin' });
      }
      onClose();
    } catch (error) {
      alert("Error saving news: " + error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-xl font-bold">{editItem ? 'Edit News' : 'Create New News'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40">Title</label>
            <input 
              required
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="Enter news headline..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40">Category</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent"
              >
                <option value="Trend">Trend</option>
                <option value="School Life">School Life</option>
                <option value="Tips">Tips</option>
                <option value="Issues">Issues</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40">Content</label>
            <textarea 
              required
              rows={6}
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
              placeholder="Tell the story..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                <ImageIcon size={14}/> Image URL
              </label>
              <input 
                value={formData.imageUrl}
                onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                placeholder="https://..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-accent" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                <Video size={14}/> Video URL (Optional)
              </label>
              <input 
                value={formData.videoUrl}
                onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                placeholder="https://youtube.com/..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-accent" 
              />
            </div>
          </div>

          <div className="pt-4">
            <button type="submit" className="w-full btn-accent py-4 flex items-center justify-center gap-2">
              <Save size={20} /> {editItem ? 'Update News' : 'Publish News'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

import { motion } from 'motion/react';
