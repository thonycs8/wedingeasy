import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ColorPaletteSelector } from "./ColorPaletteSelector";

interface ColorPalette {
  name: string;
  primary: string;
  secondary: string;
}

interface ColorPalettes {
  decoration?: ColorPalette;
  groomsmen?: ColorPalette;
  bridesmaids?: ColorPalette;
}

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
  colorPalettes?: ColorPalettes;
}

export const WeddingChoices = () => {
  const { t } = useTranslation();
  const { weddingData } = useWeddingData();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [weddingId, setWeddingId] = useState<string | null>(null);
  const [colorPalettes, setColorPalettes] = useState<ColorPalettes>({});
  
  const [choices, setChoices] = useState<WeddingChoice[]>([
    {
      id: '1',
      category: 'colors',
      title: t('choices.colorPalette'),
      options: [
        t('choices.colorOptions.blushGold'),
        t('choices.colorOptions.navyWhite'),
        t('choices.colorOptions.sageCream'),
        t('choices.colorOptions.burgundyIvory'),
        t('choices.colorOptions.lavenderSilver'),
        t('choices.colorOptions.peachCoral'),
        t('choices.colorOptions.emeraldGold'),
        t('choices.colorOptions.dustyRoseMauve'),
        t('choices.colorOptions.terracottaCream'),
        t('choices.colorOptions.navyGold'),
        t('choices.colorOptions.blushIvory'),
        t('choices.colorOptions.sageEucalyptus'),
        t('choices.colorOptions.lilacWhite')
      ],
      status: 'pending'
    },
    {
      id: '2',
      category: 'menu',
      title: t('choices.menuStyle'),
      options: [
        t('choices.menuOptions.buffet'),
        t('choices.menuOptions.served'),
        t('choices.menuOptions.cocktail'),
        t('choices.menuOptions.foodStations')
      ],
      selected: t('choices.menuOptions.served'),
      status: 'decided'
    },
    {
      id: '3',
      category: 'music',
      title: t('choices.musicStyle'),
      options: [
        t('choices.musicOptions.dj'),
        t('choices.musicOptions.liveBand'),
        t('choices.musicOptions.acousticDuo'),
        t('choices.musicOptions.djBand')
      ],
      status: 'pending'
    },
    {
      id: '4',
      category: 'flowers',
      title: t('choices.flowerStyle'),
      options: [
        t('choices.flowerOptions.rustic'),
        t('choices.flowerOptions.classic'),
        t('choices.flowerOptions.modern'),
        t('choices.flowerOptions.bohemian')
      ],
      status: 'pending'
    },
    {
      id: '5',
      category: 'photography',
      title: t('choices.photographyStyle'),
      options: [
        t('choices.photographyOptions.photojournalism'),
        t('choices.photographyOptions.fineArt'),
        t('choices.photographyOptions.lifestyle'),
        t('choices.photographyOptions.traditional')
      ],
      selected: t('choices.photographyOptions.fineArt'),
      status: 'booked'
    },
    {
      id: '6',
      category: 'transport',
      title: t('choices.transport'),
      options: [
        t('choices.transportOptions.classicCar'),
        t('choices.transportOptions.limousine'),
        t('choices.transportOptions.carriage'),
        t('choices.transportOptions.ownCar')
      ],
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

  // Fetch wedding ID on mount
  useEffect(() => {
    const fetchWeddingId = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('wedding_data')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          setWeddingId(data.id);
        }
      } catch (error) {
        console.error('Error fetching wedding ID:', error);
      }
    };

    fetchWeddingId();
  }, []);

  // Load choices from database
  useEffect(() => {
    if (weddingId) {
      loadChoices();
    } else {
      setIsLoading(false);
    }
  }, [weddingId]);

  const loadChoices = async () => {
    if (!weddingId) return;

    try {
      const { data, error } = await supabase
        .from('wedding_choices')
        .select('*')
        .eq('wedding_id', weddingId);

      if (error) throw error;

      if (data && data.length > 0) {
        const colorChoice = data.find(c => c.category === 'colors');
        if (colorChoice?.notes) {
          try {
            const palettes = JSON.parse(colorChoice.notes);
            setColorPalettes(palettes);
          } catch (e) {
            console.error('Error parsing color palettes:', e);
          }
        }

        setChoices(data.map(choice => ({
          id: choice.id,
          category: choice.category,
          title: choice.title,
          description: choice.description,
          options: choice.options,
          selected: choice.selected ?? undefined,
          notes: choice.notes ?? undefined,
          budget: choice.budget ? Number(choice.budget) : undefined,
          status: choice.status as 'pending' | 'decided' | 'booked'
        })));
      }
    } catch (error) {
      console.error('Error loading choices:', error);
      toast({
        title: t('common.error'),
        description: t('common.loadError'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveChoice = async (choice: WeddingChoice) => {
    if (!weddingId) return;

    try {
      // For color category, save palettes in notes field
      const notesToSave = choice.category === 'colors' 
        ? JSON.stringify(colorPalettes)
        : choice.notes;

      // Check if ID is a valid UUID
      const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(choice.id);
      
      const dataToSave = {
        ...(isValidUUID ? { id: choice.id } : {}), // Only include ID if it's a valid UUID
        wedding_id: weddingId,
        category: choice.category,
        title: choice.title,
        description: choice.description,
        options: choice.options,
        selected: choice.selected,
        notes: notesToSave,
        budget: choice.budget,
        status: choice.status
      };

      const { data, error } = await supabase
        .from('wedding_choices')
        .upsert(dataToSave)
        .select();

      if (error) throw error;

      // Update local state with the returned ID if it was a new record
      if (data && data[0] && !isValidUUID) {
        setChoices(prev => prev.map(c => 
          c.id === choice.id ? { ...c, id: data[0].id } : c
        ));
      }

      toast({
        title: t('choices.saved'),
        description: t('choices.savedDescription')
      });
    } catch (error) {
      console.error('Error saving choice:', error);
      toast({
        title: t('common.error'),
        description: t('common.saveError'),
        variant: "destructive"
      });
    }
  };

  const handleColorPaletteChange = async (
    category: keyof ColorPalettes,
    palette: ColorPalette
  ) => {
    const newPalettes = { ...colorPalettes, [category]: palette };
    setColorPalettes(newPalettes);

    // Find or create color choice
    const colorChoice = choices.find(c => c.category === 'colors');
    if (colorChoice) {
      await saveChoice({ ...colorChoice, notes: JSON.stringify(newPalettes) });
    }
  };

  const updateChoice = async (id: string, updates: Partial<WeddingChoice>) => {
    const updatedChoices = choices.map(choice => 
      choice.id === id ? { ...choice, ...updates } : choice
    );
    setChoices(updatedChoices);
    
    const updatedChoice = updatedChoices.find(c => c.id === id);
    if (updatedChoice) {
      await saveChoice(updatedChoice);
    }
    
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

  const selectOption = async (choiceId: string, option: string) => {
    const updatedChoices = choices.map(choice => 
      choice.id === choiceId 
        ? { ...choice, selected: option, status: 'decided' as const }
        : choice
    );
    setChoices(updatedChoices);
    
    const updatedChoice = updatedChoices.find(c => c.id === choiceId);
    if (updatedChoice) {
      await saveChoice(updatedChoice);
    }
  };

  const addNewChoice = async () => {
    if (!newChoice.title || newChoice.options.filter(o => o.trim()).length === 0 || !weddingId) return;
    
    const choice: WeddingChoice = {
      id: crypto.randomUUID(),
      category: newChoice.category || 'other',
      title: newChoice.title,
      description: newChoice.description,
      options: newChoice.options.filter(o => o.trim()),
      status: 'pending',
      budget: newChoice.budget ? parseFloat(newChoice.budget) : undefined
    };
    
    setChoices(prev => [...prev, choice]);
    await saveChoice(choice);
    
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

  if (isLoading) {
    return (
      <Card className="card-romantic">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">{t('common.loading')}</p>
        </CardContent>
      </Card>
    );
  }

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
        <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
          <div className="p-2 sm:p-3 rounded-lg bg-success/10">
            <p className="text-xl sm:text-2xl font-bold text-success truncate">
              {choices.filter(c => c.status === 'decided' || c.status === 'booked').length}
            </p>
            <p className="text-xs text-muted-foreground truncate">{t('choices.decided')}</p>
          </div>
          <div className="p-2 sm:p-3 rounded-lg bg-warning/10">
            <p className="text-xl sm:text-2xl font-bold text-warning truncate">
              {choices.filter(c => c.status === 'pending').length}
            </p>
            <p className="text-xs text-muted-foreground truncate">{t('choices.pending')}</p>
          </div>
          <div className="p-2 sm:p-3 rounded-lg bg-primary/10">
            <p className="text-xl sm:text-2xl font-bold text-primary truncate">
              {choices.filter(c => c.status === 'booked').length}
            </p>
            <p className="text-xs text-muted-foreground truncate">{t('choices.booked')}</p>
          </div>
        </div>

        {/* Color Palettes Section */}
        {groupedChoices['colors'] && (
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground capitalize flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              {t('choices.colorPalettes')}
            </h4>
            <Tabs defaultValue="decoration" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="decoration">{t('choices.decoration')}</TabsTrigger>
                <TabsTrigger value="groomsmen">{t('choices.groomsmen')}</TabsTrigger>
                <TabsTrigger value="bridesmaids">{t('choices.bridesmaids')}</TabsTrigger>
              </TabsList>
              <TabsContent value="decoration" className="mt-4">
                <ColorPaletteSelector
                  category="decoration"
                  value={colorPalettes.decoration}
                  onChange={(palette) => handleColorPaletteChange('decoration', palette)}
                />
              </TabsContent>
              <TabsContent value="groomsmen" className="mt-4">
                <ColorPaletteSelector
                  category="groomsmen"
                  value={colorPalettes.groomsmen}
                  onChange={(palette) => handleColorPaletteChange('groomsmen', palette)}
                />
              </TabsContent>
              <TabsContent value="bridesmaids" className="mt-4">
                <ColorPaletteSelector
                  category="bridesmaids"
                  value={colorPalettes.bridesmaids}
                  onChange={(palette) => handleColorPaletteChange('bridesmaids', palette)}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Other Choices by Category */}
        <div className="space-y-6 max-h-96 overflow-y-auto">
          {Object.entries(groupedChoices).filter(([category]) => category !== 'colors').map(([category, categoryChoices]) => (
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