import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar, 
  CheckCircle,
  Plus,
  Clock,
  AlertCircle,
  Trash2,
  Loader2
} from "lucide-react";
import { useWeddingData } from "@/contexts/WeddingContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface TimelineTask {
  id: string;
  title: string;
  description?: string;
  due_date: string;
  priority: 'alta' | 'media' | 'baixa';
  category: 'venue' | 'attire' | 'catering' | 'decoration' | 'documentation' | 'other';
  completed: boolean;
  completed_date?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export const TimelineManager = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TimelineTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'media' as 'alta' | 'media' | 'baixa',
    category: 'other' as TimelineTask['category']
  });

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('timeline_tasks')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;
      setTasks((data || []) as TimelineTask[]);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Erro ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  };

  const completedTasks = tasks.filter(task => task.completed).length;
  const progressPercentage = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  const toggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedData = {
      completed: !task.completed,
      completed_date: !task.completed ? new Date().toISOString().split('T')[0] : null
    };

    try {
      const { error } = await supabase
        .from('timeline_tasks')
        .update(updatedData)
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.map(t => 
        t.id === taskId 
          ? { ...t, ...updatedData }
          : t
      ));
      
      toast.success(updatedData.completed ? 'Tarefa marcada como concluída!' : 'Tarefa desmarcada');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Erro ao atualizar tarefa');
    }
  };

  const addTask = async () => {
    if (!newTask.title || !newTask.due_date || !user) return;
    
    const taskData = {
      title: newTask.title,
      description: newTask.description || null,
      due_date: newTask.due_date,
      priority: newTask.priority,
      category: newTask.category,
      user_id: user.id
    };
    
    try {
      const { data, error } = await supabase
        .from('timeline_tasks')
        .insert([taskData])
        .select()
        .single();

      if (error) throw error;

      setTasks(prev => [...prev, data as TimelineTask]);
      setNewTask({ title: '', description: '', due_date: '', priority: 'media', category: 'other' });
      setShowAddForm(false);
      toast.success('Tarefa adicionada com sucesso!');
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Erro ao adicionar tarefa');
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('timeline_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast.success('Tarefa removida com sucesso!');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Erro ao remover tarefa');
    }
  };

  const getTasksByCategory = () => {
    const categories = tasks.reduce((acc, task) => {
      if (!acc[task.category]) acc[task.category] = [];
      acc[task.category].push(task);
      return acc;
    }, {} as Record<string, TimelineTask[]>);
    
    // Sort tasks within categories by due date
    Object.keys(categories).forEach(category => {
      categories[category].sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
    });
    
    return categories;
  };

  const isTaskOverdue = (dueDate: string, completed: boolean) => {
    if (completed) return false;
    return new Date(dueDate) < new Date();
  };

  const categorizedTasks = getTasksByCategory();

  if (loading) {
    return (
      <Card className="card-romantic">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Carregando cronograma...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-romantic">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          {t('timeline.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{t('timeline.progress')}</span>
            <span className="font-semibold">{Math.round(progressPercentage)}% {t('timeline.completed')}</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-success">{completedTasks}</p>
              <p className="text-xs text-muted-foreground">{t('timeline.completed')}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{tasks.length - completedTasks}</p>
              <p className="text-xs text-muted-foreground">{t('timeline.pending')}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-destructive">
                {tasks.filter(t => isTaskOverdue(t.due_date, t.completed)).length}
              </p>
              <p className="text-xs text-muted-foreground">{t('timeline.overdue')}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-warning">
                {tasks.filter(t => t.priority === 'alta' && !t.completed).length}
              </p>
              <p className="text-xs text-muted-foreground">{t('timeline.highPriority')}</p>
            </div>
          </div>
        </div>

        {/* Tasks by Category */}
        <div className="space-y-6 max-h-96 overflow-y-auto">
          {Object.entries(categorizedTasks).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma tarefa encontrada. Adicione sua primeira tarefa!</p>
            </div>
          ) : (
            Object.entries(categorizedTasks).map(([category, categoryTasks]) => (
              <div key={category} className="space-y-3">
                <h4 className="font-semibold text-foreground capitalize">
                  {t(`timeline.categories.${category}`)}
                  <Badge variant="secondary" className="ml-2">
                    {categoryTasks.length}
                  </Badge>
                </h4>
                
                <div className="space-y-2">
                  {categoryTasks.map((task) => {
                    const isOverdue = isTaskOverdue(task.due_date, task.completed);
                    
                    return (
                      <div 
                        key={task.id} 
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                          task.completed 
                            ? 'bg-success/10 text-success-foreground' 
                            : isOverdue
                            ? 'bg-destructive/10 border border-destructive/20'
                            : 'bg-muted/50 hover:bg-muted'
                        }`}
                      >
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleTask(task.id)}
                          className="p-0 h-auto"
                        >
                          <CheckCircle 
                            className={`w-5 h-5 ${
                              task.completed ? 'text-success' : 'text-muted-foreground'
                            }`}
                          />
                        </Button>
                        
                        <div className="flex-1">
                          <h5 className={`font-medium ${task.completed ? 'line-through' : ''}`}>
                            {task.title}
                          </h5>
                          {task.description && (
                            <p className="text-sm text-muted-foreground">{task.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {new Date(task.due_date).toLocaleDateString()}
                            </div>
                            {isOverdue && (
                              <div className="flex items-center gap-1 text-xs text-destructive">
                                <AlertCircle className="w-3 h-3" />
                                {t('timeline.overdue')}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={task.priority === 'alta' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {task.priority === 'alta' ? t('timeline.priority.high') : 
                             task.priority === 'media' ? t('timeline.priority.medium') : 
                             t('timeline.priority.low')}
                          </Badge>
                          <Button size="sm" variant="ghost" onClick={() => deleteTask(task.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Task Form */}
        {showAddForm && (
          <div className="p-4 rounded-lg border border-border space-y-4">
            <h4 className="font-medium">{t('timeline.addTask')}</h4>
            <div className="space-y-4">
              <div>
                <Label htmlFor="taskTitle">{t('timeline.taskTitle')}</Label>
                <Input
                  id="taskTitle"
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={t('timeline.taskTitlePlaceholder')}
                />
              </div>
              <div>
                <Label htmlFor="taskDescription">{t('timeline.taskDescription')}</Label>
                <Textarea
                  id="taskDescription"
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={t('timeline.taskDescriptionPlaceholder')}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="dueDate">{t('timeline.dueDate')}</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="priority">{t('timeline.priority.label')}</Label>
                  <select
                    id="priority"
                    value={newTask.priority}
                    onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background"
                  >
                    <option value="baixa">{t('timeline.priority.low')}</option>
                    <option value="media">{t('timeline.priority.medium')}</option>
                    <option value="alta">{t('timeline.priority.high')}</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="category">{t('timeline.category')}</Label>
                  <select
                    id="category"
                    value={newTask.category}
                    onChange={(e) => setNewTask(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background"
                  >
                    <option value="venue">{t('timeline.categories.venue')}</option>
                    <option value="attire">{t('timeline.categories.attire')}</option>
                    <option value="catering">{t('timeline.categories.catering')}</option>
                    <option value="decoration">{t('timeline.categories.decoration')}</option>
                    <option value="documentation">{t('timeline.categories.documentation')}</option>
                    <option value="other">{t('timeline.categories.other')}</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={addTask} className="btn-gradient">
                {t('timeline.save')}
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
            {t('timeline.addTask')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};