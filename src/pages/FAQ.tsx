import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, HelpCircle } from "lucide-react";
import Footer from "@/components/Footer";

const faqSections = [
  {
    title: "Geral",
    items: [
      {
        q: "O que é a WeddingEasy?",
        a: "A WeddingEasy é uma plataforma completa de planeamento de casamentos que permite gerir convidados, orçamento, cronograma, escolhas, colaboradores, página do evento e muito mais — tudo num só lugar.",
      },
      {
        q: "A aplicação é gratuita?",
        a: "Sim! O plano Básico é 100% gratuito e inclui gestão de convidados (até 50), orçamento, cronograma e página do evento. Para funcionalidades avançadas como papéis de cerimónia, colaboradores e gráficos detalhados, existem os planos Avançado e Profissional.",
      },
      {
        q: "Posso usar a aplicação em vários dispositivos?",
        a: "Sim! A WeddingEasy sincroniza automaticamente os dados na nuvem. Aceda a partir de qualquer dispositivo (computador, tablet, telemóvel) fazendo login com a sua conta.",
      },
      {
        q: "A aplicação funciona offline?",
        a: "A aplicação requer conexão à internet para funcionar plenamente e sincronizar dados. Recomendamos sempre usar com conexão à internet para garantir que todos os dados estejam atualizados.",
      },
    ],
  },
  {
    title: "Convidados",
    items: [
      {
        q: "Como funciona a gestão de convidados?",
        a: "Pode adicionar convidados individualmente ou importar em massa, organizar por categoria (família, amigos, trabalho), lado (noivo/noiva), faixa etária, mesa e restrições alimentares. Acompanhe confirmações de presença em tempo real.",
      },
      {
        q: "Posso exportar a lista de convidados?",
        a: "Sim! Com o plano Profissional, pode exportar a lista de convidados em PDF com todos os detalhes: nome, confirmação de presença, restrições alimentares, mesa atribuída, lado (noivo/noiva), faixa etária e notas. Ideal para partilhar com o catering, o organizador do evento ou qualquer fornecedor. A exportação PDF também está disponível para orçamento, cronograma e papéis de cerimónia.",
      },
      {
        q: "O que é o custo por convidado?",
        a: "A funcionalidade calcula automaticamente o custo por pessoa baseado na faixa etária (crianças 0-4, 5-10, 11+ e adultos) com percentuais configuráveis sobre o preço do adulto.",
      },
    ],
  },
  {
    title: "Orçamento",
    items: [
      {
        q: "Como funciona a gestão de orçamento?",
        a: "Crie categorias personalizáveis (local, catering, decoração, etc.), defina montantes orçamentados e registe despesas à medida que ocorrem. A aplicação calcula automaticamente quanto gastou vs. quanto resta em cada categoria.",
      },
      {
        q: "Posso comparar fornecedores?",
        a: "Sim! O módulo de Comparação de Opções permite adicionar fornecedores por categoria com preços, avaliações, contactos, website e notas. Marque favoritos e acompanhe o estado de cada opção.",
      },
      {
        q: "Existem gráficos de orçamento?",
        a: "Os planos Avançado e Pro incluem gráficos interativos com visualizações de pizza, barras e progresso para uma visão clara de como o orçamento está a ser utilizado.",
      },
    ],
  },
  {
    title: "Cronograma & Tarefas",
    items: [
      {
        q: "As tarefas são criadas automaticamente?",
        a: "Sim! Com base na data do casamento e nas respostas ao questionário inicial, a aplicação sugere tarefas essenciais com datas limite apropriadas. Pode também adicionar tarefas personalizadas organizadas por prioridade e categoria.",
      },
      {
        q: "Posso configurar lembretes?",
        a: "O sistema de notificações (planos Avançado e Pro) envia lembretes automáticos sobre tarefas com prazo próximo, pagamentos pendentes e outros eventos importantes.",
      },
    ],
  },
  {
    title: "Página do Evento",
    items: [
      {
        q: "O que é a Página do Evento?",
        a: "É uma landing page pública personalizada para o seu casamento que inclui countdown, mapa interativo, detalhes do local, dress code, RSVP online, galeria de fotos, vídeo e verso/poema.",
      },
      {
        q: "Posso personalizar a aparência?",
        a: "Sim! Escolha entre 6 temas premium (Romântico, Rústico, Clássico, Moderno, Jardim e Praia), personalize cores, fontes, imagem de capa e ative/desative cada secção individualmente.",
      },
      {
        q: "É possível ter um domínio personalizado?",
        a: "Sim! Pode solicitar um domínio personalizado (ex: maria-e-joao.com) para a página do evento. O serviço de domínio é gerido pela equipa WeddingEasy.",
      },
    ],
  },
  {
    title: "Colaboração",
    items: [
      {
        q: "Como convido o meu parceiro/parceira para colaborar?",
        a: "No painel de controlo, aceda a 'Gerir Colaboradores'. Adicione o email do parceiro e selecione o papel (noivo/noiva). Receberão um convite por email com link seguro para se juntarem ao planeamento.",
      },
      {
        q: "Posso adicionar outros colaboradores?",
        a: "Sim! Convide padrinhos, madrinhas, celebrantes, fotógrafos, organizadores e outros. Cada papel tem permissões específicas — apenas os noivos (admins) têm acesso total.",
      },
      {
        q: "Posso suspender um colaborador?",
        a: "Sim! Os administradores do casamento podem suspender colaboradores temporariamente. Um colaborador suspenso perde acesso aos dados do casamento até ser reativado.",
      },
      {
        q: "O que são os Convites de Papel?",
        a: "São convites personalizados para papéis especiais (padrinho, madrinha, etc.) com mensagens únicas, manual interativo de responsabilidades, do's & don'ts e animações de celebração.",
      },
    ],
  },
  {
    title: "Planos & Pagamentos",
    items: [
      {
        q: "Quais são os planos disponíveis?",
        a: "Oferecemos 3 planos: Básico (gratuito, até 50 convidados), Avançado (€19,99/mês ou €149,99/2 anos, até 200 convidados) e Profissional (€78,99/mês ou €499,99/2 anos, convidados ilimitados). Veja todos os detalhes na página de Planos.",
      },
      {
        q: "Posso mudar de plano a qualquer momento?",
        a: "Sim! Pode fazer upgrade ou downgrade do plano a qualquer momento. O pagamento é proporcional ao período restante.",
      },
      {
        q: "Que métodos de pagamento aceitam?",
        a: "Aceitamos cartões de crédito/débito (Visa, Mastercard, Amex) através do Stripe, garantindo máxima segurança nas transações.",
      },
    ],
  },
  {
    title: "Segurança & Privacidade",
    items: [
      {
        q: "Os meus dados estão seguros?",
        a: "Absolutamente! Utilizamos encriptação SSL/TLS, Row-Level Security para isolar dados de cada casamento, e estamos em total conformidade com o RGPD. Consulte a nossa Política de Privacidade para mais detalhes.",
      },
      {
        q: "O que acontece com os meus dados após o casamento?",
        a: "Os dados permanecem acessíveis indefinidamente, a menos que opte por eliminá-los. Pode exportar todos os dados ou eliminá-los permanentemente a qualquer momento.",
      },
      {
        q: "Posso pedir a eliminação dos meus dados (RGPD)?",
        a: "Sim! Em conformidade com o RGPD, pode solicitar a eliminação completa dos seus dados a qualquer momento. Contacte o suporte ou utilize as definições da conta.",
      },
    ],
  },
  {
    title: "Suporte",
    items: [
      {
        q: "Como contacto o suporte?",
        a: "Pode contactar-nos por email em support@weddingeasy.com. Respondemos normalmente dentro de 24-48 horas. Recomendamos também consultar o Manual de Uso para respostas rápidas.",
      },
      {
        q: "A aplicação está disponível em que idiomas?",
        a: "Atualmente suportamos Português e Inglês. O idioma pode ser alterado a qualquer momento no seletor de idioma no canto superior direito.",
      },
      {
        q: "Que moedas são suportadas?",
        a: "Suportamos Euro (€), Dólar ($) e Real (R$). Pode alterar a moeda de exibição nas definições — os valores são convertidos automaticamente.",
      },
    ],
  },
];

const FAQ = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <Link to="/pricing">
            <Button variant="outline" size="sm">Ver Planos</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Perguntas Frequentes</h1>
          <p className="text-muted-foreground">Tudo o que precisa saber sobre a WeddingEasy</p>
        </div>

        <div className="space-y-6">
          {faqSections.map((section, sIdx) => (
            <Card key={sIdx} className="card-romantic">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-4 text-primary">{section.title}</h2>
                <Accordion type="single" collapsible className="w-full">
                  {section.items.map((item, iIdx) => (
                    <AccordionItem key={iIdx} value={`${sIdx}-${iIdx}`}>
                      <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="card-romantic bg-primary/5 border-primary/20 mt-8">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-semibold mb-3">Ainda tem dúvidas?</h2>
            <p className="text-muted-foreground mb-4">
              Consulte o nosso{" "}
              <Link to="/user-guide" className="text-primary hover:underline font-semibold">Manual de Uso</Link>
              {" "}completo, veja os{" "}
              <Link to="/pricing" className="text-primary hover:underline font-semibold">Planos disponíveis</Link>
              {" "}ou entre em contacto.
            </p>
            <p className="text-sm text-muted-foreground">
              Email: support@weddingeasy.com
            </p>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default FAQ;
