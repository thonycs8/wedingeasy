import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Cookie } from "lucide-react";
import Footer from "@/components/Footer";

const Cookies = () => {
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
            <Cookie className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Política de Cookies</h1>
          <p className="text-muted-foreground">Última atualização: {new Date().toLocaleDateString('pt-PT')}</p>
        </div>

        <Card className="card-romantic">
          <CardContent className="p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">O que são Cookies?</h2>
              <p className="text-muted-foreground">
                Cookies são pequenos ficheiros de texto que são colocados no seu computador ou dispositivo móvel 
                quando visita o nosso website ou utiliza a nossa aplicação. São amplamente utilizados para fazer 
                os websites funcionarem de forma mais eficiente, bem como para fornecer informações aos proprietários do site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Como Utilizamos Cookies</h2>
              <p className="text-muted-foreground mb-3">
                A wedigneasy utiliza cookies para:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Manter a sua sessão ativa enquanto utiliza a aplicação</li>
                <li>Lembrar as suas preferências e configurações</li>
                <li>Melhorar a segurança da aplicação</li>
                <li>Analisar como você utiliza a aplicação para melhorar a experiência</li>
                <li>Personalizar o conteúdo que você vê</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Tipos de Cookies que Utilizamos</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">1. Cookies Estritamente Necessários</h3>
                  <p className="text-muted-foreground">
                    Estes cookies são essenciais para que possa navegar na aplicação e utilizar as suas funcionalidades. 
                    Sem estes cookies, serviços como autenticação e segurança não podem ser fornecidos.
                  </p>
                  <ul className="list-disc pl-6 mt-2 text-muted-foreground">
                    <li><strong>session_token:</strong> Mantém a sua sessão ativa (Duração: Sessão)</li>
                    <li><strong>auth_token:</strong> Valida a sua autenticação (Duração: 7 dias)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">2. Cookies de Desempenho e Análise</h3>
                  <p className="text-muted-foreground">
                    Estes cookies recolhem informações sobre como os visitantes utilizam a aplicação, permitindo-nos 
                    melhorar o funcionamento do site.
                  </p>
                  <ul className="list-disc pl-6 mt-2 text-muted-foreground">
                    <li><strong>_ga:</strong> Google Analytics - Distingue utilizadores (Duração: 2 anos)</li>
                    <li><strong>_gid:</strong> Google Analytics - Distingue utilizadores (Duração: 24 horas)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">3. Cookies de Funcionalidade</h3>
                  <p className="text-muted-foreground">
                    Estes cookies permitem que a aplicação se lembre de escolhas que você faz e fornecem 
                    funcionalidades melhoradas e mais personalizadas.
                  </p>
                  <ul className="list-disc pl-6 mt-2 text-muted-foreground">
                    <li><strong>language_preference:</strong> Lembra o seu idioma preferido (Duração: 1 ano)</li>
                    <li><strong>currency_preference:</strong> Lembra a sua moeda preferida (Duração: 1 ano)</li>
                    <li><strong>theme_preference:</strong> Lembra o tema (claro/escuro) (Duração: 1 ano)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">4. Cookies de Marketing e Publicidade</h3>
                  <p className="text-muted-foreground">
                    Atualmente, não utilizamos cookies de marketing ou publicidade. Se isso mudar no futuro, 
                    atualizaremos esta política e pediremos o seu consentimento.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Cookies de Terceiros</h2>
              <p className="text-muted-foreground mb-3">
                Podemos utilizar serviços de terceiros que também podem definir cookies. Estes incluem:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Google Analytics:</strong> Para análise de tráfego e comportamento do utilizador</li>
                <li><strong>Serviços de Autenticação:</strong> Para login seguro através de fornecedores terceiros</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                Não temos controlo sobre estes cookies de terceiros. Recomendamos que consulte as políticas 
                de privacidade destes serviços para mais informações.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Como Gerir Cookies</h2>
              <p className="text-muted-foreground mb-3">
                Você pode controlar e/ou eliminar cookies conforme desejar. Pode:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Eliminar todos os cookies que já estão no seu dispositivo</li>
                <li>Configurar a maioria dos navegadores para impedir que cookies sejam colocados</li>
                <li>Gerir as suas preferências de cookies através das definições da aplicação</li>
              </ul>
              
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Configurações do Navegador:</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                  <li><strong>Chrome:</strong> Definições → Privacidade e segurança → Cookies</li>
                  <li><strong>Firefox:</strong> Opções → Privacidade e Segurança → Cookies</li>
                  <li><strong>Safari:</strong> Preferências → Privacidade → Cookies</li>
                  <li><strong>Edge:</strong> Definições → Privacidade → Cookies</li>
                </ul>
              </div>

              <p className="text-muted-foreground mt-3">
                <strong>Nota:</strong> Se optar por desativar cookies, algumas funcionalidades da aplicação 
                podem não funcionar corretamente.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Armazenamento Local</h2>
              <p className="text-muted-foreground">
                Além de cookies, também utilizamos tecnologias de armazenamento local (localStorage e sessionStorage) 
                para armazenar informações no seu navegador. Estas tecnologias são utilizadas para:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                <li>Guardar rascunhos e dados temporários do seu casamento</li>
                <li>Melhorar o desempenho da aplicação</li>
                <li>Funcionar offline quando aplicável</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Consentimento</h2>
              <p className="text-muted-foreground">
                Ao utilizar a nossa aplicação, você consente com o uso de cookies conforme descrito nesta política. 
                Para cookies não essenciais, pediremos o seu consentimento explícito através de um banner de cookies 
                quando visitar a aplicação pela primeira vez.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Alterações a Esta Política</h2>
              <p className="text-muted-foreground">
                Podemos atualizar esta Política de Cookies periodicamente para refletir alterações nas tecnologias 
                que utilizamos ou requisitos legais. Recomendamos que reveja esta página regularmente para se manter 
                informado sobre como utilizamos cookies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Mais Informações</h2>
              <p className="text-muted-foreground">
                Para mais informações sobre como protegemos os seus dados pessoais, consulte a nossa{" "}
                <Link to="/privacy-policy" className="text-primary hover:underline">Política de Privacidade</Link>
                {" "}e a nossa página de{" "}
                <Link to="/gdpr" className="text-primary hover:underline">Conformidade com GDPR</Link>.
              </p>
              <p className="text-muted-foreground mt-3">
                Para questões sobre cookies, contacte-nos através de: privacy@weddingplan.com
              </p>
            </section>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Cookies;
