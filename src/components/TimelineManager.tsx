import { useState } from "react";
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
  Edit,
  Trash2
} from "lucide-react";
import { useWeddingData } from "@/contexts/WeddingContext";

interface TimelineTask {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: 'alta' | 'media' | 'baixa';
  category: 'venue' | 'attire' | 'catering' | 'decoration' | 'documentation' | 'other';
  completed: boolean;
  completedDate?: string;
}

export const TimelineManager = () => {
  const { t } = useTranslation();
  const { weddingData } = useWeddingData();
  
  const [tasks, setTasks] = useState<TimelineTask[]>([
    { id: '1', title: t('tasks.chooseVenue'), dueDate: '2024-12-01', priority: 'alta', category: 'venue', completed: true, completedDate: '2024-10-15' },
    { id: '2', title: t('tasks.buyDress'), dueDate: '2024-12-15', priority: 'alta', category: 'attire', completed: true, completedDate: '2024-11-01' },
    { id: '3', title: t('tasks.hirePhotographer'), dueDate: '2024-12-20', priority: 'alta', category: 'other', completed: true, completedDate: '2024-11-10' },
    { id: '4', title: t('tasks.sendInvites'), dueDate: '2025-01-15', priority: 'alta', category: 'documentation', completed: false },
    { id: '5', title: t('tasks.chooseMenu'), dueDate: '2025-02-01', priority: 'alta', category: 'catering', completed: false },
    { id: '6', title: t('tasks.defineDecoration'), dueDate: '2025-02-15', priority: 'media', category: 'decoration', completed: false },
    { id: '7', title: t('tasks.bookHoneymoon'), dueDate: '2025-03-01', priority: 'baixa', category: 'other', completed: false },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'media' as 'alta' | 'media' | 'baixa',
    category: 'other' as TimelineTask['category']
  });

  const completedTasks = tasks.filter(task => task.completed).length;
  const progressPercentage = (completedTasks / tasks.length) * 100;

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            completed: !task.completed,
            completedDate: !task.completed ? new Date().toISOString().split('T')[0] : undefined
          }
        : task
    ));
  };

  const addTask = () => {
    if (!newTask.title || !newTask.dueDate) return;
    
    const task: TimelineTask = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      dueDate: newTask.dueDate,
      priority: newTask.priority,
      category: newTask.category,
      completed: false
    };
    
    setTasks(prev => [...prev, task]);
    setNewTask({ title: '', description: '', dueDate: '', priority: 'media', category: 'other' });
    setShowAddForm(false);
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const getTasksByCategory = () => {
    const categories = tasks.reduce((acc, task) => {
      if (!acc[task.category]) acc[task.category] = [];
      acc[task.category].push(task);
      return acc;
    }, {} as Record<string, TimelineTask[]>);
    
    // Sort tasks within categories by due date
    Object.keys(categories).forEach(category => {
      categories[category].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    });
    
    return categories;
  };

  const getTaskPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'text-destructive';
      case 'media': return 'text-warning';
      case 'baixa': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const isTaskOverdue = (dueDate: string, completed: boolean) => {
    if (completed) return false;
    return new Date(dueDate) < new Date();
  };

  const categorizedTasks = getTasksByCategory();

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
                {tasks.filter(t => isTaskOverdue(t.dueDate, t.completed)).length}
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
          {Object.entries(categorizedTasks).map(([category, categoryTasks]) => (
            <div key={category} className="space-y-3">
              <h4 className="font-semibold text-foreground capitalize">
                {t(`timeline.categories.${category}`)}
                <Badge variant="secondary" className="ml-2">
                  {categoryTasks.length}
                </Badge>
              </h4>
              
              <div className="space-y-2">
                {categoryTasks.map((task) => {
                  const isOverdue = isTaskOverdue(task.dueDate, task.completed);
                  
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
                            {new Date(task.dueDate).toLocaleDateString()}
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
                          {t(`timeline.priority.${task.priority === 'alta' ? 'high' : task.priority === 'media' ? 'medium' : 'low'}`)}
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
          ))}
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
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
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