import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Heart, Users, DollarSign, Calendar, Camera, CheckCircle } from "lucide-react";
import Footer from "@/components/Footer";

const UserGuide = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Manual de Uso</h1>
          <p className="text-muted-foreground">Guia completo para planear o seu casamento perfeito</p>
        </div>

        <div className="space-y-6">
          <Card className="card-romantic">
            <CardContent className="p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold mb-3">1. Primeiros Passos</h2>
                  <div className="space-y-3 text-muted-foreground">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Criar Conta</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Clique em "Começar Agora" ou "Registar" na página inicial</li>
                        <li>Preencha o formulário com nome, email e password</li>
                        <li>Confirme o email (se aplicável)</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Questionário Inicial</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Complete o questionário sobre o seu casamento</li>
                        <li>Forneça informações básicas (data, local, orçamento estimado)</li>
                        <li>Defina as suas prioridades e estilo preferido</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-romantic">
            <CardContent className="p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-3">2. Gestão de Convidados</h2>
                  <div className="space-y-3 text-muted-foreground">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Adicionar Convidados</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Aceda ao separador "Convidados"</li>
                        <li>Clique em "Adicionar Convidado"</li>
                        <li>Preencha nome, email, telefone e categoria</li>
                        <li>Indique se traz acompanhante (+1)</li>
                        <li>Adicione restrições alimentares ou notas especiais</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Organizar Convidados</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Filtre por categoria (família, amigos, colegas)</li>
                        <li>Acompanhe confirmações de presença</li>
                        <li>Atribua números de mesa</li>
                        <li>Exporte a lista para impressão ou partilha</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-romantic">
            <CardContent className="p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-3">3. Gestão de Orçamento</h2>
                  <div className="space-y-3 text-muted-foreground">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Criar Categorias</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Use categorias pré-definidas ou crie personalizadas</li>
                        <li>Defina um orçamento para cada categoria</li>
                        <li>Estabeleça prioridades (alta, média, baixa)</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Registar Despesas</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Adicione despesas à medida que ocorrem</li>
                        <li>Anexe recibos e documentos</li>
                        <li>Marque como pago ou pendente</li>
                        <li>Acompanhe o total gasto vs orçamento disponível</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Comparar Opções</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Registe opções de fornecedores para comparação</li>
                        <li>Avalie preços, classificações e detalhes</li>
                        <li>Marque favoritos para decisão posterior</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-romantic">
            <CardContent className="p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-3">4. Cronograma e Tarefas</h2>
                  <div className="space-y-3 text-muted-foreground">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Gerir Tarefas</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Use tarefas pré-definidas baseadas na data do casamento</li>
                        <li>Adicione tarefas personalizadas conforme necessário</li>
                        <li>Defina datas limite e prioridades</li>
                        <li>Atribua tarefas a colaboradores</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Acompanhamento</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Marque tarefas como concluídas</li>
                        <li>Visualize progresso geral</li>
                        <li>Receba lembretes de tarefas pendentes</li>
                        <li>Filtre por categoria ou prioridade</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-romantic">
            <CardContent className="p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Camera className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-3">5. Galeria de Fotos</h2>
                  <div className="space-y-3 text-muted-foreground">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Carregar Fotos</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Carregue fotos de inspiração, fornecedores ou do evento</li>
                        <li>Organize por categoria (vestido, decoração, local, etc.)</li>
                        <li>Adicione títulos e descrições</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Partilhar</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Partilhe fotos com colaboradores</li>
                        <li>Exporte para criar moodboards</li>
                        <li>Baixe fotos quando necessário</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-romantic">
            <CardContent className="p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-3">6. Colaboradores</h2>
                  <div className="space-y-3 text-muted-foreground">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Convidar Colaboradores</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Clique em "Gerir Colaboradores" no painel</li>
                        <li>Adicione email e selecione o papel (noivo/noiva, padrinho, etc.)</li>
                        <li>Colaboradores recebem convite por email</li>
                        <li>Acompanhe convites pendentes e aceites</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Permissões</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Noivos têm acesso total e podem gerir tudo</li>
                        <li>Outros colaboradores podem visualizar e contribuir</li>
                        <li>Controle quem pode editar informações sensíveis</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-romantic">
            <CardContent className="p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-3">7. Dicas e Boas Práticas</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Comece cedo:</strong> Quanto mais cedo começar a planear, menos stress terá</li>
                      <li><strong>Defina prioridades:</strong> Saiba o que é mais importante para si</li>
                      <li><strong>Mantenha-se organizado:</strong> Atualize regularmente o seu progresso</li>
                      <li><strong>Comunique:</strong> Partilhe informações com colaboradores e fornecedores</li>
                      <li><strong>Reserve margem no orçamento:</strong> Imprevistos acontecem</li>
                      <li><strong>Faça backup:</strong> Exporte dados importantes periodicamente</li>
                      <li><strong>Aproveite:</strong> Este é o seu dia especial - divirta-se a planear!</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-romantic bg-primary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-semibold mb-3">Precisa de Ajuda?</h2>
              <p className="text-muted-foreground mb-4">
                Se tiver dúvidas não respondidas neste manual, consulte as nossas{" "}
                <Link to="/faq" className="text-primary hover:underline font-semibold">Perguntas Frequentes</Link>
                {" "}ou entre em contacto connosco.
              </p>
              <p className="text-sm text-muted-foreground">
                Email: support@weddingplan.com
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default UserGuide;
