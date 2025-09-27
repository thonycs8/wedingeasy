import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Palette, 
  Utensils,
  Music,
  Camera,
  Flower,
  Gift,
  Car,
  MapPin,
  Heart,
  Edit,
  Save,
  Plus
} from "lucide-react";
import { useWeddingData } from "@/contexts/WeddingContext";

interface WeddingChoice {
  id: string;
  category: string;
  title: string;
  description?: string;
  options: string[];
  selected?: string;
  notes?: string;
  budget?: number;
  status: 'pending' | 'decided' | 'booked';
}

export const WeddingChoices = () => {
  const { t } = useTranslation();
  const { weddingData } = useWeddingData();
  
  const [choices, setChoices] = useState<WeddingChoice[]>([
    {
      id: '1',
      category: 'colors',
      title: t('choices.colorPalette'),
      options: ['Blush & Gold', 'Navy & White', 'Sage & Cream', 'Burgundy & Ivory'],
      selected: 'Blush & Gold',
      status: 'decided'
    },
    {
      id: '2',
      category: 'menu',
      title: t('choices.menuStyle'),
      options: ['Buffet', 'Pratos Servidos', 'Cocktail', 'Food Stations'],
      selected: 'Pratos Servidos',
      status: 'decided'
    },
    {
      id: '3',
      category: 'music',
      title: t('choices.musicStyle'),
      options: ['DJ', 'Banda Live', 'Acoustic Duo', 'DJ + Banda'],
      status: 'pending'
    },
    {
      id: '4',
      category: 'flowers',
      title: t('choices.flowerStyle'),
      options: ['Rústico', 'Clássico', 'Moderno', 'Bohemian'],
      status: 'pending'
    },
    {
      id: '5',
      category: 'photography',
      title: t('choices.photographyStyle'),
      options: ['Fotojornalismo', 'Fine Art', 'Lifestyle', 'Tradicional'],
      selected: 'Fine Art',
      status: 'booked'
    },
    {
      id: '6',
      category: 'transport',
      title: t('choices.transport'),
      options: ['Carro Clássico', 'Limousine', 'Carruagem', 'Carro Próprio'],
      status: 'pending'
    }
  ]);

  const [editingChoice, setEditingChoice] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newChoice, setNewChoice] = useState({
    category: '',
    title: '',
    description: '',
    options: [''],
    budget: ''
  });

  const updateChoice = (id: string, updates: Partial<WeddingChoice>) => {
    setChoices(prev => prev.map(choice => 
      choice.id === id ? { ...choice, ...updates } : choice
    ));
    setEditingChoice(null);
  };

  const addOption = (choiceId: string, option: string) => {
    if (!option.trim()) return;
    setChoices(prev => prev.map(choice => 
      choice.id === choiceId 
        ? { ...choice, options: [...choice.options, option] }
        : choice
    ));
  };

  const selectOption = (choiceId: string, option: string) => {
    setChoices(prev => prev.map(choice => 
      choice.id === choiceId 
        ? { ...choice, selected: option, status: 'decided' }
        : choice
    ));
  };

  const addNewChoice = () => {
    if (!newChoice.title || newChoice.options.filter(o => o.trim()).length === 0) return;
    
    const choice: WeddingChoice = {
      id: Date.now().toString(),
      category: newChoice.category || 'other',
      title: newChoice.title,
      description: newChoice.description,
      options: newChoice.options.filter(o => o.trim()),
      status: 'pending',
      budget: newChoice.budget ? parseFloat(newChoice.budget) : undefined
    };
    
    setChoices(prev => [...prev, choice]);
    setNewChoice({ category: '', title: '', description: '', options: [''], budget: '' });
    setShowAddForm(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'colors': return <Palette className="w-5 h-5" />;
      case 'menu': return <Utensils className="w-5 h-5" />;
      case 'music': return <Music className="w-5 h-5" />;
      case 'flowers': return <Flower className="w-5 h-5" />;
      case 'photography': return <Camera className="w-5 h-5" />;
      case 'transport': return <Car className="w-5 h-5" />;
      case 'gifts': return <Gift className="w-5 h-5" />;
      case 'venue': return <MapPin className="w-5 h-5" />;
      default: return <Heart className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'decided': return 'text-success bg-success/10';
      case 'booked': return 'text-primary bg-primary/10';
      case 'pending': return 'text-warning bg-warning/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const groupedChoices = choices.reduce((acc, choice) => {
    if (!acc[choice.category]) acc[choice.category] = [];
    acc[choice.category].push(choice);
    return acc;
  }, {} as Record<string, WeddingChoice[]>);

  return (
    <Card className="card-romantic">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          {t('choices.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-lg bg-success/10">
            <p className="text-2xl font-bold text-success">
              {choices.filter(c => c.status === 'decided' || c.status === 'booked').length}
            </p>
            <p className="text-xs text-muted-foreground">{t('choices.decided')}</p>
          </div>
          <div className="p-3 rounded-lg bg-warning/10">
            <p className="text-2xl font-bold text-warning">
              {choices.filter(c => c.status === 'pending').length}
            </p>
            <p className="text-xs text-muted-foreground">{t('choices.pending')}</p>
          </div>
          <div className="p-3 rounded-lg bg-primary/10">
            <p className="text-2xl font-bold text-primary">
              {choices.filter(c => c.status === 'booked').length}
            </p>
            <p className="text-xs text-muted-foreground">{t('choices.booked')}</p>
          </div>
        </div>

        {/* Choices by Category */}
        <div className="space-y-6 max-h-96 overflow-y-auto">
          {Object.entries(groupedChoices).map(([category, categoryChoices]) => (
            <div key={category} className="space-y-4">
              <h4 className="font-semibold text-foreground capitalize flex items-center gap-2">
                {getCategoryIcon(category)}
                {t(`choices.categories.${category}`)}
                <Badge variant="secondary">{categoryChoices.length}</Badge>
              </h4>
              
              <div className="space-y-4">
                {categoryChoices.map((choice) => (
                  <div key={choice.id} className="p-4 rounded-lg bg-muted/50 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h5 className="font-medium">{choice.title}</h5>
                        {choice.description && (
                          <p className="text-sm text-muted-foreground">{choice.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(choice.status)}>
                          {t(`choices.status.${choice.status}`)}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => setEditingChoice(choice.id === editingChoice ? null : choice.id)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">{t('choices.options')}</Label>
                      <div className="flex flex-wrap gap-2">
                        {choice.options.map((option, index) => (
                          <Button
                            key={index}
                            size="sm"
                            variant={choice.selected === option ? "default" : "outline"}
                            onClick={() => selectOption(choice.id, option)}
                            className="text-xs"
                          >
                            {option}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Selected Choice */}
                    {choice.selected && (
                      <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                        <p className="text-sm">
                          <span className="font-medium">{t('choices.selected')}:</span> {choice.selected}
                        </p>
                      </div>
                    )}

                    {/* Notes */}
                    {choice.notes && (
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-sm">{choice.notes}</p>
                      </div>
                    )}

                    {/* Editing Form */}
                    {editingChoice === choice.id && (
                      <div className="p-4 rounded-lg border border-border space-y-3">
                        <div>
                          <Label htmlFor="notes">{t('choices.notes')}</Label>
                          <Textarea
                            id="notes"
                            value={choice.notes || ''}
                            onChange={(e) => updateChoice(choice.id, { notes: e.target.value })}
                            placeholder={t('choices.notesPlaceholder')}
                            rows={2}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => setEditingChoice(null)}
                            className="btn-gradient"
                          >
                            <Save className="w-3 h-3 mr-1" />
                            {t('choices.save')}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Add New Choice Form */}
        {showAddForm && (
          <div className="p-4 rounded-lg border border-border space-y-4">
            <h4 className="font-medium">{t('choices.addChoice')}</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="choiceTitle">{t('choices.choiceTitle')}</Label>
                  <Input
                    id="choiceTitle"
                    value={newChoice.title}
                    onChange={(e) => setNewChoice(prev => ({ ...prev, title: e.target.value }))}
                    placeholder={t('choices.choiceTitlePlaceholder')}
                  />
                </div>
                <div>
                  <Label htmlFor="choiceCategory">{t('choices.category')}</Label>
                  <select
                    id="choiceCategory"
                    value={newChoice.category}
                    onChange={(e) => setNewChoice(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background"
                  >
                    <option value="colors">{t('choices.categories.colors')}</option>
                    <option value="menu">{t('choices.categories.menu')}</option>
                    <option value="music">{t('choices.categories.music')}</option>
                    <option value="flowers">{t('choices.categories.flowers')}</option>
                    <option value="photography">{t('choices.categories.photography')}</option>
                    <option value="transport">{t('choices.categories.transport')}</option>
                    <option value="other">{t('choices.categories.other')}</option>
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="choiceDescription">{t('choices.description')}</Label>
                <Textarea
                  id="choiceDescription"
                  value={newChoice.description}
                  onChange={(e) => setNewChoice(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={t('choices.descriptionPlaceholder')}
                  rows={2}
                />
              </div>
              <div>
                <Label>{t('choices.options')}</Label>
                {newChoice.options.map((option, index) => (
                  <div key={index} className="flex gap-2 mt-2">
                    <Input
                      value={option}
                      onChange={(e) => setNewChoice(prev => ({
                        ...prev,
                        options: prev.options.map((opt, i) => i === index ? e.target.value : opt)
                      }))}
                      placeholder={`${t('choices.option')} ${index + 1}`}
                    />
                    {index === newChoice.options.length - 1 && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setNewChoice(prev => ({ ...prev, options: [...prev.options, ''] }))}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={addNewChoice} className="btn-gradient">
                {t('choices.save')}
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        )}

        {/* Add Button */}
        {!showAddForm && (
          <Button 
            className="btn-gradient w-full" 
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('choices.addChoice')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};