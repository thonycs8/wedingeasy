import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, HelpCircle } from "lucide-react";
import Footer from "@/components/Footer";

const FAQ = () => {
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
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Perguntas Frequentes</h1>
          <p className="text-muted-foreground">Respostas às dúvidas mais comuns</p>
        </div>

        <Card className="card-romantic">
          <CardContent className="p-8">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left">
                  A aplicação Wedding Plan é gratuita?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Sim! A Wedding Plan oferece acesso gratuito às funcionalidades essenciais de planeamento 
                  de casamentos. Poderá haver funcionalidades premium no futuro, mas o core da aplicação 
                  permanecerá sempre gratuito.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">
                  Como convido o meu parceiro/parceira para colaborar?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  No painel de controlo, clique no botão "Gerir Colaboradores". Adicione o email do seu 
                  parceiro/parceira e selecione o papel apropriado (noivo/noiva). Eles receberão um convite 
                  por email com um link para se juntarem ao planeamento do vosso casamento.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">
                  Posso adicionar outros colaboradores além do meu parceiro?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Sim! Pode convidar padrinhos, madrinhas, celebrantes, fotógrafos, organizadores e outros 
                  colaboradores. Cada um terá acesso apropriado baseado no seu papel. Apenas os noivos têm 
                  acesso total para gerir todas as funcionalidades.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left">
                  Os meus dados estão seguros?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Absolutamente! Levamos a segurança dos seus dados muito a sério. Utilizamos encriptação 
                  SSL/TLS para proteger dados em trânsito e armazenamento seguro para dados em repouso. 
                  Estamos em conformidade com GDPR e seguimos as melhores práticas de segurança. Consulte 
                  a nossa{" "}
                  <Link to="/privacy-policy" className="text-primary hover:underline">Política de Privacidade</Link>
                  {" "}para mais detalhes.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left">
                  Posso usar a aplicação em vários dispositivos?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Sim! A Wedding Plan sincroniza automaticamente os seus dados na nuvem. Pode aceder ao 
                  planeamento do seu casamento a partir de qualquer dispositivo (computador, tablet, telemóvel) 
                  fazendo login com a sua conta.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger className="text-left">
                  Como funciona a gestão de orçamento?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  O sistema de orçamento permite-lhe criar categorias (ex: local, catering, decoração), 
                  definir montantes orçamentados, e registar despesas à medida que ocorrem. A aplicação 
                  calcula automaticamente quanto gastou vs quanto resta em cada categoria e no total. 
                  Também pode comparar opções de fornecedores antes de tomar decisões.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7">
                <AccordionTrigger className="text-left">
                  As tarefas são criadas automaticamente?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Sim! Com base na data do seu casamento e nas suas respostas ao questionário inicial, 
                  a aplicação sugere tarefas essenciais com datas limite apropriadas. Pode também adicionar 
                  tarefas personalizadas conforme necessário. As tarefas são organizadas por prioridade e 
                  categoria para facilitar o acompanhamento.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8">
                <AccordionTrigger className="text-left">
                  Posso exportar a minha lista de convidados?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Sim! Pode exportar a lista de convidados em formato PDF para impressão ou partilha com 
                  fornecedores. A exportação inclui todas as informações relevantes como confirmações, 
                  restrições alimentares e números de mesa.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-9">
                <AccordionTrigger className="text-left">
                  Que formatos de ficheiro posso carregar na galeria?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  A galeria suporta formatos comuns de imagem incluindo JPEG, PNG, e GIF. Cada ficheiro 
                  pode ter até 10MB. Pode organizar as fotos por categoria e adicionar títulos e descrições 
                  para melhor organização.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-10">
                <AccordionTrigger className="text-left">
                  Como altero o idioma ou moeda da aplicação?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  No canto superior direito da aplicação, encontrará o seletor de idioma e moeda. 
                  Clique nele para escolher entre Português e Inglês para o idioma, e entre Euro (€) e 
                  Dólar ($) para a moeda. As suas preferências são guardadas automaticamente.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-11">
                <AccordionTrigger className="text-left">
                  Posso planear mais de um casamento?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Atualmente, cada conta suporta o planeamento de um casamento. Se precisar de planear 
                  um segundo evento, pode reiniciar os dados da conta após o primeiro casamento. 
                  Recomendamos exportar ou fazer backup dos dados importantes antes de reiniciar.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-12">
                <AccordionTrigger className="text-left">
                  O que acontece com os meus dados após o casamento?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Os seus dados permanecem acessíveis indefinidamente, a menos que opte por eliminá-los. 
                  Muitos casais gostam de manter o acesso para recordações ou para ajudar amigos a planear 
                  os seus casamentos. Pode exportar todos os dados ou eliminá-los permanentemente a qualquer 
                  momento através das definições da conta.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-13">
                <AccordionTrigger className="text-left">
                  Como posso receber notificações sobre tarefas pendentes?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  A aplicação envia notificações automáticas sobre tarefas com prazo próximo, pagamentos 
                  pendentes, e outros lembretes importantes. Pode configurar as suas preferências de 
                  notificação no separador "Notificações" do painel de controlo.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-14">
                <AccordionTrigger className="text-left">
                  A aplicação funciona offline?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  A aplicação requer conexão à internet para funcionar plenamente e sincronizar dados. 
                  No entanto, algumas funcionalidades básicas de visualização podem estar disponíveis 
                  offline se já tiver acedido anteriormente. Recomendamos sempre usar com conexão à internet 
                  para garantir que todos os dados estejam atualizados.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-15">
                <AccordionTrigger className="text-left">
                  Como contacto o suporte se tiver problemas?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Para suporte técnico ou dúvidas, pode contactar-nos através de:
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Email: support@weddingplan.com</li>
                    <li>Consultar o{" "}
                      <Link to="/user-guide" className="text-primary hover:underline">Manual de Uso</Link>
                    </li>
                  </ul>
                  Respondemos normalmente dentro de 24-48 horas.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card className="card-romantic bg-primary/5 border-primary/20 mt-8">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-semibold mb-3">Ainda tem dúvidas?</h2>
            <p className="text-muted-foreground mb-4">
              Não encontrou a resposta que procurava? Consulte o nosso{" "}
              <Link to="/user-guide" className="text-primary hover:underline font-semibold">Manual de Uso</Link>
              {" "}completo ou entre em contacto connosco.
            </p>
            <p className="text-sm text-muted-foreground">
              Email: support@weddingplan.com
            </p>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default FAQ;
