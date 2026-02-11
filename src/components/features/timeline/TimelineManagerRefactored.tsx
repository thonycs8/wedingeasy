import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, CheckCircle, Plus, Clock, AlertCircle, Trash2, Download, Sparkles, Lightbulb, ExternalLink } from "lucide-react";
import { useWeddingData } from "@/contexts/WeddingContext";
import { useAuth } from "@/hooks/useAuth";
import { useWeddingId } from "@/hooks/useWeddingId";
import { useTimeline } from "@/hooks/queries/useTimeline";
import { LoadingState } from "@/components/shared";
import { toast } from "sonner";
import { exportTimelinePDF } from "@/utils/pdfExport";
import { generateTasksFromDate } from "@/utils/taskTemplates";

export const TimelineManagerRefactored = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { weddingData } = useWeddingData();
  const { weddingId } = useWeddingId();
  const { tasks, isLoading, addTask, toggleComplete, deleteTask } = useTimeline(weddingId);

  const [showAddForm, setShowAddForm] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestedTasks, setSuggestedTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState({
    title: '', description: '', due_date: '',
    priority: 'media' as 'alta' | 'media' | 'baixa',
    category: 'other' as string
  });

  useEffect(() => {
    if (weddingData?.wedding.date && tasks.length > 0) {
      const weddingDate = new Date(weddingData.wedding.date);
      const suggestions = generateTasksFromDate(weddingDate);
      const existingTitles = new Set(tasks.map(t => t.title.toLowerCase()));
      setSuggestedTasks(suggestions.filter(s => !existingTitles.has(s.title.toLowerCase())).slice(0, 10));
    }
  }, [weddingData, tasks]);

  const completedTasks = tasks.filter(task => task.completed).length;
  const progressPercentage = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  const isTaskOverdue = (dueDate: string, completed: boolean) => {
    if (completed) return false;
    return new Date(dueDate) < new Date();
  };

  const categorizedTasks = useMemo(() => {
    const categories = tasks.reduce((acc, task) => {
      const cat = task.category || 'other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(task);
      return acc;
    }, {} as Record<string, typeof tasks>);
    Object.keys(categories).forEach(cat => {
      categories[cat].sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
    });
    return categories;
  }, [tasks]);

  const handleAddTask = () => {
    if (!newTask.title || !newTask.due_date || !user || !weddingId) return;
    addTask.mutate({
      title: newTask.title,
      description: newTask.description || null,
      due_date: newTask.due_date,
      priority: newTask.priority,
      category: newTask.category,
      user_id: user.id,
    });
    setNewTask({ title: '', description: '', due_date: '', priority: 'media', category: 'other' });
    setShowAddForm(false);
  };

  const handleAddSuggested = (suggestion: any) => {
    if (!user || !weddingId) return;
    addTask.mutate({
      title: suggestion.title,
      description: suggestion.description,
      due_date: suggestion.dueDate.toISOString().split('T')[0],
      priority: suggestion.priority,
      category: suggestion.category,
      user_id: user.id,
    });
    setSuggestedTasks(prev => prev.filter(s => s.title !== suggestion.title));
  };

  const handleAddAllSuggestions = () => {
    if (!user || !weddingId) return;
    suggestedTasks.forEach(suggestion => {
      addTask.mutate({
        title: suggestion.title,
        description: suggestion.description,
        due_date: suggestion.dueDate.toISOString().split('T')[0],
        priority: suggestion.priority,
        category: suggestion.category,
        user_id: user.id,
      });
    });
    setSuggestedTasks([]);
    setShowSuggestions(false);
  };

  if (isLoading) {
    return <LoadingState text="Carregando cronograma..." />;
  }

  return (
    <Card className="card-romantic">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary shrink-0" />
            <span className="truncate">{t('timeline.title')}</span>
          </CardTitle>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {suggestedTasks.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => setShowSuggestions(!showSuggestions)} className="border-primary/20 bg-primary/5 flex-1 sm:flex-initial">
                <Sparkles className="w-4 h-4 mr-2 shrink-0" />
                <span className="truncate">{suggestedTasks.length} Sugestões</span>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => exportTimelinePDF(tasks as any[], { coupleName: weddingData?.couple.name, partnerName: weddingData?.couple.partnerName, weddingDate: weddingData?.wedding.date })} disabled={tasks.length === 0} className="flex-1 sm:flex-initial">
              <Download className="w-4 h-4 mr-2 shrink-0" />
              <span className="truncate">Exportar PDF</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Smart Suggestions */}
        {showSuggestions && suggestedTasks.length > 0 && (
          <div className="p-4 rounded-lg border-2 border-primary/20 bg-primary/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">Sugestões Inteligentes</h4>
              </div>
              <Button variant="default" size="sm" onClick={handleAddAllSuggestions} className="btn-gradient">
                <Plus className="w-4 h-4 mr-2" />Adicionar Todas
              </Button>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Baseado na data do seu casamento ({weddingData?.wedding.date ? new Date(weddingData.wedding.date).toLocaleDateString('pt-PT') : ''}), sugerimos estas tarefas:
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {suggestedTasks.map((suggestion, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-start gap-3 p-3 rounded-lg bg-background border border-border hover:border-primary/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium truncate">{suggestion.title}</h5>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{suggestion.description}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                        <Clock className="w-3 h-3" /><span>{suggestion.dueDate.toLocaleDateString('pt-PT')}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs shrink-0">{t(`timeline.categories.${suggestion.category}`)}</Badge>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => handleAddSuggested(suggestion)} className="self-end sm:self-auto shrink-0">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress Overview */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{t('timeline.progress')}</span>
            <span className="font-semibold">{Math.round(progressPercentage)}% {t('timeline.completed')}</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-center">
            <div className="p-2">
              <p className="text-xl sm:text-2xl font-bold text-success truncate">{completedTasks}</p>
              <p className="text-xs text-muted-foreground truncate">{t('timeline.completed')}</p>
            </div>
            <div className="p-2">
              <p className="text-xl sm:text-2xl font-bold text-primary truncate">{tasks.length - completedTasks}</p>
              <p className="text-xs text-muted-foreground truncate">{t('timeline.pending')}</p>
            </div>
            <div className="p-2">
              <p className="text-xl sm:text-2xl font-bold text-destructive truncate">
                {tasks.filter(t => isTaskOverdue(t.due_date, t.completed)).length}
              </p>
              <p className="text-xs text-muted-foreground truncate">{t('timeline.overdue')}</p>
            </div>
            <div className="p-2">
              <p className="text-xl sm:text-2xl font-bold text-warning truncate">
                {tasks.filter(t => t.priority === 'alta' && !t.completed).length}
              </p>
              <p className="text-xs text-muted-foreground truncate">{t('timeline.highPriority')}</p>
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
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-foreground capitalize">{t(`timeline.categories.${category}`)}</h4>
                  <Badge variant="secondary" className="shrink-0">{categoryTasks.length}</Badge>
                </div>
                <div className="space-y-2">
                  {categoryTasks.map((task) => {
                    const isOverdue = isTaskOverdue(task.due_date, task.completed);
                    return (
                      <div key={task.id} className={`flex flex-col sm:flex-row items-start gap-3 p-3 rounded-lg transition-all duration-300 ${
                        task.completed ? 'bg-success/10 text-success-foreground' : isOverdue ? 'bg-destructive/10 border border-destructive/20' : 'bg-muted/50 hover:bg-muted'
                      }`}>
                        <div className="flex items-start gap-3 flex-1 min-w-0 w-full">
                          <Button size="sm" variant="ghost" onClick={() => toggleComplete.mutate({ taskId: task.id, completed: !task.completed })} className="p-0 h-auto shrink-0">
                            <CheckCircle className={`w-5 h-5 ${task.completed ? 'text-success' : 'text-muted-foreground'}`} />
                          </Button>
                          <div className="flex-1 min-w-0">
                            <h5 className={`font-medium break-words ${task.completed ? 'line-through' : ''}`}>{task.title}</h5>
                            {task.description && <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{task.description}</p>}
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                                <Clock className="w-3 h-3" /><span>{new Date(task.due_date).toLocaleDateString()}</span>
                              </div>
                              {isOverdue && (
                                <div className="flex items-center gap-1 text-xs text-destructive shrink-0">
                                  <AlertCircle className="w-3 h-3" /><span>{t('timeline.overdue')}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                          <Badge variant={task.priority === 'alta' ? 'destructive' : 'secondary'} className="text-xs">
                            {task.priority === 'alta' ? t('timeline.priority.high') : task.priority === 'media' ? t('timeline.priority.medium') : t('timeline.priority.low')}
                          </Badge>
                          <Button size="sm" variant="ghost" onClick={() => deleteTask.mutate(task.id)}>
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
                <Input id="taskTitle" value={newTask.title} onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))} placeholder={t('timeline.taskTitlePlaceholder')} />
              </div>
              <div>
                <Label htmlFor="taskDescription">{t('timeline.taskDescription')}</Label>
                <Textarea id="taskDescription" value={newTask.description} onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))} placeholder={t('timeline.taskDescriptionPlaceholder')} rows={2} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="dueDate">{t('timeline.dueDate')}</Label>
                  <Input id="dueDate" type="date" value={newTask.due_date} onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="priority">{t('timeline.priority.label')}</Label>
                  <select id="priority" value={newTask.priority} onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as any }))} className="w-full px-3 py-2 rounded-md border border-input bg-background">
                    <option value="baixa">{t('timeline.priority.low')}</option>
                    <option value="media">{t('timeline.priority.medium')}</option>
                    <option value="alta">{t('timeline.priority.high')}</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="category">{t('timeline.category')}</Label>
                  <select id="category" value={newTask.category} onChange={(e) => setNewTask(prev => ({ ...prev, category: e.target.value }))} className="w-full px-3 py-2 rounded-md border border-input bg-background">
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
              <Button onClick={handleAddTask} className="btn-gradient">{t('timeline.save')}</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>{t('common.cancel')}</Button>
            </div>
          </div>
        )}

        {!showAddForm && (
          <Button className="btn-gradient w-full" onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 mr-2" />{t('timeline.addTask')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default TimelineManagerRefactored;
