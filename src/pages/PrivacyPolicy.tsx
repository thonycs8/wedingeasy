import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Shield } from "lucide-react";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
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
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Política de Privacidade</h1>
          <p className="text-muted-foreground">Última atualização: {new Date().toLocaleDateString('pt-PT')}</p>
        </div>

        <Card className="card-romantic">
          <CardContent className="p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Introdução</h2>
              <p className="text-muted-foreground">
                A Wedding Plan ("nós", "nosso" ou "nossa") está comprometida em proteger a sua privacidade. 
                Esta Política de Privacidade explica como recolhemos, usamos, divulgamos e protegemos as suas 
                informações pessoais quando utiliza a nossa aplicação de planeamento de casamentos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Informações que Recolhemos</h2>
              <div className="space-y-3 text-muted-foreground">
                <p><strong>2.1 Informações fornecidas por si:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Nome e email (ao criar conta)</li>
                  <li>Detalhes do casamento (data, local, orçamento)</li>
                  <li>Lista de convidados e suas informações de contacto</li>
                  <li>Fotografias e documentos carregados</li>
                  <li>Preferências e escolhas relacionadas com o casamento</li>
                </ul>

                <p className="mt-4"><strong>2.2 Informações recolhidas automaticamente:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Dados de utilização e preferências da aplicação</li>
                  <li>Informações técnicas (tipo de dispositivo, navegador)</li>
                  <li>Endereço IP e localização aproximada</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Como Utilizamos as Suas Informações</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Fornecer e melhorar os nossos serviços de planeamento de casamentos</li>
                <li>Personalizar a sua experiência na aplicação</li>
                <li>Enviar notificações e lembretes importantes</li>
                <li>Processar pagamentos (se aplicável)</li>
                <li>Responder às suas questões e fornecer suporte</li>
                <li>Analisar tendências e melhorar a funcionalidade da aplicação</li>
                <li>Cumprir obrigações legais</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Partilha de Informações</h2>
              <p className="text-muted-foreground mb-3">
                Não vendemos as suas informações pessoais. Podemos partilhar informações apenas nas seguintes situações:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Com colaboradores autorizados do seu evento (que você convidou)</li>
                <li>Com fornecedores de serviços que nos ajudam a operar a aplicação</li>
                <li>Quando exigido por lei ou para proteger direitos legais</li>
                <li>Com o seu consentimento explícito</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Segurança dos Dados</h2>
              <p className="text-muted-foreground">
                Implementamos medidas de segurança técnicas e organizacionais apropriadas para proteger as suas 
                informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição. 
                Utilizamos encriptação SSL/TLS para proteger dados em trânsito e armazenamento seguro para dados em repouso.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Os Seus Direitos</h2>
              <p className="text-muted-foreground mb-3">Você tem o direito de:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Aceder aos seus dados pessoais</li>
                <li>Corrigir dados incorretos ou incompletos</li>
                <li>Solicitar a eliminação dos seus dados</li>
                <li>Retirar o consentimento a qualquer momento</li>
                <li>Exportar os seus dados num formato estruturado</li>
                <li>Apresentar uma reclamação à autoridade de proteção de dados</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Retenção de Dados</h2>
              <p className="text-muted-foreground">
                Mantemos as suas informações pessoais apenas pelo tempo necessário para cumprir as finalidades 
                descritas nesta política ou conforme exigido por lei. Após o seu casamento, você pode optar por 
                manter ou eliminar os seus dados.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Alterações a Esta Política</h2>
              <p className="text-muted-foreground">
                Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre alterações 
                significativas através da aplicação ou por email. A continuação do uso da aplicação após alterações 
                constitui aceitação da política atualizada.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Contacto</h2>
              <p className="text-muted-foreground">
                Para questões sobre esta Política de Privacidade ou para exercer os seus direitos, contacte-nos através de:
              </p>
              <p className="text-muted-foreground mt-2">
                Email: privacy@weddingplan.com<br />
                Website: <a href="https://missaodesign.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">missaodesign.com</a>
              </p>
            </section>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
