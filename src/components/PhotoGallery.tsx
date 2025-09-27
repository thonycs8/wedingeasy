import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Camera, 
  Upload, 
  Trash2, 
  Download, 
  Search, 
  Filter,
  Image as ImageIcon,
  Eye,
  Edit,
  Heart,
  Share2,
  Grid3x3,
  List
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Photo {
  id: string;
  title?: string;
  description?: string;
  file_path: string;
  file_size?: number;
  file_type?: string;
  category: 'general' | 'venue' | 'dress' | 'rings' | 'flowers' | 'cake' | 'decoration';
  uploaded_at: string;
}

export const PhotoGallery = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);

  const [newPhoto, setNewPhoto] = useState({
    title: '',
    description: '',
    category: 'general' as Photo['category']
  });

  useEffect(() => {
    if (user) {
      loadPhotos();
    }
  }, [user]);

  const loadPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('user_id', user?.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setPhotos((data || []).map(photo => ({
        ...photo,
        category: photo.category as Photo['category']
      })));
    } catch (error) {
      console.error('Error loading photos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as fotos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Erro",
            description: `${file.name} não é uma imagem válida.`,
            variant: "destructive"
          });
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "Erro",
            description: `${file.name} é muito grande. Máximo 5MB.`,
            variant: "destructive"
          });
          continue;
        }

        const fileName = `${user?.id}/${Date.now()}-${file.name}`;
        
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('wedding-photos')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Save to database
        const { data: photoData, error: dbError } = await supabase
          .from('photos')
          .insert([{
            user_id: user?.id,
            title: newPhoto.title || file.name.split('.')[0],
            description: newPhoto.description,
            file_path: uploadData.path,
            file_size: file.size,
            file_type: file.type,
            category: newPhoto.category
          }])
          .select()
          .single();

        if (dbError) throw dbError;

        setPhotos(prev => [{ ...photoData, category: photoData.category as Photo['category'] }, ...prev]);
        setUploadProgress(((i + 1) / files.length) * 100);
      }

      // Reset form
      setNewPhoto({
        title: '',
        description: '',
        category: 'general'
      });
      
      toast({
        title: "Sucesso",
        description: `${files.length} foto(s) carregada(s) com sucesso!`,
      });
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar fotos.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const deletePhoto = async (photo: Photo) => {
    if (!confirm('Tem certeza que deseja remover esta foto?')) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('wedding-photos')
        .remove([photo.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('photos')
        .delete()
        .eq('id', photo.id);

      if (dbError) throw dbError;

      setPhotos(photos.filter(p => p.id !== photo.id));
      
      toast({
        title: "Sucesso",
        description: "Foto removida com sucesso!",
      });
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a foto.",
        variant: "destructive"
      });
    }
  };

  const updatePhoto = async (photo: Photo) => {
    try {
      const { error } = await supabase
        .from('photos')
        .update({
          title: photo.title,
          description: photo.description,
          category: photo.category
        })
        .eq('id', photo.id);

      if (error) throw error;

      setPhotos(photos.map(p => p.id === photo.id ? photo : p));
      setEditingPhoto(null);
      
      toast({
        title: "Sucesso",
        description: "Foto atualizada com sucesso!",
      });
    } catch (error) {
      console.error('Error updating photo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a foto.",
        variant: "destructive"
      });
    }
  };

  const getPhotoUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from('wedding-photos')
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  const downloadPhoto = async (photo: Photo) => {
    try {
      const { data, error } = await supabase.storage
        .from('wedding-photos')
        .download(photo.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = photo.title || 'photo.jpg';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading photo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível baixar a foto.",
        variant: "destructive"
      });
    }
  };

  const filteredPhotos = photos.filter(photo => {
    const matchesSearch = photo.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         photo.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || photo.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      general: 'bg-gray-100 text-gray-800',
      venue: 'bg-blue-100 text-blue-800',
      dress: 'bg-pink-100 text-pink-800',
      rings: 'bg-yellow-100 text-yellow-800',
      flowers: 'bg-green-100 text-green-800',
      cake: 'bg-orange-100 text-orange-800',
      decoration: 'bg-purple-100 text-purple-800'
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      general: 'Geral',
      venue: 'Local',
      dress: 'Vestido',
      rings: 'Alianças',
      flowers: 'Flores',
      cake: 'Bolo',
      decoration: 'Decoração'
    };
    return labels[category as keyof typeof labels] || 'Geral';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">A carregar galeria...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Carregar Fotos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="photo-title">Título</Label>
              <Input
                id="photo-title"
                value={newPhoto.title}
                onChange={(e) => setNewPhoto({ ...newPhoto, title: e.target.value })}
                placeholder="Título das fotos"
              />
            </div>
            <div>
              <Label htmlFor="photo-category">Categoria</Label>
              <Select value={newPhoto.category} onValueChange={(value: Photo['category']) => setNewPhoto({ ...newPhoto, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Geral</SelectItem>
                  <SelectItem value="venue">Local</SelectItem>
                  <SelectItem value="dress">Vestido</SelectItem>
                  <SelectItem value="rings">Alianças</SelectItem>
                  <SelectItem value="flowers">Flores</SelectItem>
                  <SelectItem value="cake">Bolo</SelectItem>
                  <SelectItem value="decoration">Decoração</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-1">
              <Label>&nbsp;</Label>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? 'A carregar...' : 'Selecionar Fotos'}
              </Button>
            </div>
          </div>
          
          <div>
            <Label htmlFor="photo-description">Descrição</Label>
            <Textarea
              id="photo-description"
              value={newPhoto.description}
              onChange={(e) => setNewPhoto({ ...newPhoto, description: e.target.value })}
              placeholder="Descrição das fotos (opcional)"
              rows={2}
            />
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>A carregar fotos...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Filters and View Options */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar fotos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="general">Geral</SelectItem>
                <SelectItem value="venue">Local</SelectItem>
                <SelectItem value="dress">Vestido</SelectItem>
                <SelectItem value="rings">Alianças</SelectItem>
                <SelectItem value="flowers">Flores</SelectItem>
                <SelectItem value="cake">Bolo</SelectItem>
                <SelectItem value="decoration">Decoração</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photo Gallery */}
      {filteredPhotos.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma foto encontrada</h3>
            <p className="text-muted-foreground mb-4">
              {photos.length === 0 
                ? "Comece a carregar as suas fotos do casamento para criar a galeria."
                : "Tente ajustar os filtros ou termo de pesquisa."
              }
            </p>
            {photos.length === 0 && (
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Carregar Primeira Foto
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          : "space-y-4"
        }>
          {filteredPhotos.map((photo) => (
            <Card key={photo.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {viewMode === 'grid' ? (
                <>
                  <div className="aspect-square relative group cursor-pointer" onClick={() => setSelectedPhoto(photo)}>
                    <img
                      src={getPhotoUrl(photo.file_path)}
                      alt={photo.title || 'Wedding photo'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                      <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{photo.title || 'Sem título'}</h4>
                        <Badge className={`${getCategoryColor(photo.category)} text-xs mt-1`}>
                          {getCategoryLabel(photo.category)}
                        </Badge>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingPhoto(photo)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadPhoto(photo)}
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletePhoto(photo)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 flex-shrink-0">
                      <img
                        src={getPhotoUrl(photo.file_path)}
                        alt={photo.title || 'Wedding photo'}
                        className="w-full h-full object-cover rounded cursor-pointer"
                        onClick={() => setSelectedPhoto(photo)}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium">{photo.title || 'Sem título'}</h4>
                      {photo.description && (
                        <p className="text-sm text-muted-foreground mt-1">{photo.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getCategoryColor(photo.category)}>
                          {getCategoryLabel(photo.category)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(photo.uploaded_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingPhoto(photo)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadPhoto(photo)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePhoto(photo)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Photo Detail Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{selectedPhoto?.title || 'Foto'}</DialogTitle>
          </DialogHeader>
          {selectedPhoto && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={getPhotoUrl(selectedPhoto.file_path)}
                  alt={selectedPhoto.title || 'Wedding photo'}
                  className="max-w-full max-h-[60vh] object-contain"
                />
              </div>
              {selectedPhoto.description && (
                <p className="text-muted-foreground">{selectedPhoto.description}</p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={getCategoryColor(selectedPhoto.category)}>
                    {getCategoryLabel(selectedPhoto.category)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(selectedPhoto.uploaded_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => downloadPhoto(selectedPhoto)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingPhoto(selectedPhoto);
                      setSelectedPhoto(null);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Photo Dialog */}
      <Dialog open={!!editingPhoto} onOpenChange={() => setEditingPhoto(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Foto</DialogTitle>
          </DialogHeader>
          {editingPhoto && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Título</Label>
                <Input
                  id="edit-title"
                  value={editingPhoto.title || ''}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Categoria</Label>
                <Select value={editingPhoto.category} onValueChange={(value: Photo['category']) => setEditingPhoto({ ...editingPhoto, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Geral</SelectItem>
                    <SelectItem value="venue">Local</SelectItem>
                    <SelectItem value="dress">Vestido</SelectItem>
                    <SelectItem value="rings">Alianças</SelectItem>
                    <SelectItem value="flowers">Flores</SelectItem>
                    <SelectItem value="cake">Bolo</SelectItem>
                    <SelectItem value="decoration">Decoração</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  value={editingPhoto.description || ''}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingPhoto(null)}>
                  Cancelar
                </Button>
                <Button onClick={() => updatePhoto(editingPhoto)}>
                  Guardar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};