import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, FileCheck } from "lucide-react";
import Footer from "@/components/Footer";

const GDPR = () => {
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
            <FileCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Conformidade com GDPR</h1>
          <p className="text-muted-foreground">Regulamento Geral de Proteção de Dados</p>
        </div>

        <Card className="card-romantic">
          <CardContent className="p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Compromisso com a Proteção de Dados</h2>
              <p className="text-muted-foreground">
                A weddingeasy está totalmente comprometida com a conformidade do Regulamento Geral de Proteção
                de Dados (GDPR) da União Europeia. Implementamos medidas rigorosas para garantir que os seus 
                dados pessoais sejam processados de forma legal, justa e transparente.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Base Legal para o Processamento</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Processamos os seus dados pessoais com base em:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Consentimento:</strong> Quando você nos fornece consentimento explícito para processar os seus dados</li>
                  <li><strong>Execução de Contrato:</strong> Para fornecer os serviços que você solicitou</li>
                  <li><strong>Interesses Legítimos:</strong> Para melhorar os nossos serviços e prevenir fraudes</li>
                  <li><strong>Obrigações Legais:</strong> Quando exigido por lei</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Os Seus Direitos ao Abrigo do GDPR</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">1. Direito de Acesso</h3>
                  <p className="text-muted-foreground">
                    Pode solicitar uma cópia de todos os dados pessoais que processamos sobre si.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">2. Direito de Retificação</h3>
                  <p className="text-muted-foreground">
                    Pode solicitar a correção de dados pessoais inexatos ou incompletos.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">3. Direito ao Apagamento ("Direito a Ser Esquecido")</h3>
                  <p className="text-muted-foreground">
                    Pode solicitar a eliminação dos seus dados pessoais em determinadas circunstâncias.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">4. Direito à Limitação do Tratamento</h3>
                  <p className="text-muted-foreground">
                    Pode solicitar que limitemos o processamento dos seus dados pessoais.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">5. Direito à Portabilidade dos Dados</h3>
                  <p className="text-muted-foreground">
                    Pode solicitar uma cópia dos seus dados num formato estruturado e legível por máquina.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">6. Direito de Oposição</h3>
                  <p className="text-muted-foreground">
                    Pode opor-se ao processamento dos seus dados pessoais em determinadas situações.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">7. Direito de Retirar o Consentimento</h3>
                  <p className="text-muted-foreground">
                    Quando o processamento é baseado no consentimento, pode retirá-lo a qualquer momento.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Transferências Internacionais de Dados</h2>
              <p className="text-muted-foreground">
                Se transferirmos os seus dados pessoais para fora do Espaço Económico Europeu (EEE), 
                garantimos que existem salvaguardas adequadas para proteger os seus dados, como cláusulas 
                contratuais padrão aprovadas pela Comissão Europeia.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Violações de Dados</h2>
              <p className="text-muted-foreground">
                Em caso de violação de dados pessoais que possa resultar num risco para os seus direitos e 
                liberdades, notificaremos a autoridade de supervisão competente dentro de 72 horas e 
                informá-lo-emos sem demora injustificada.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Encarregado de Proteção de Dados (DPO)</h2>
              <p className="text-muted-foreground">
                Nomeámos um Encarregado de Proteção de Dados para supervisionar a conformidade com o GDPR. 
                Pode contactar o nosso DPO através de:
              </p>
              <p className="text-muted-foreground mt-2">
                Email: dpo@weddingplan.com
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Como Exercer os Seus Direitos</h2>
              <p className="text-muted-foreground mb-3">
                Para exercer qualquer um dos seus direitos ao abrigo do GDPR, contacte-nos através de:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Email: privacy@weddingplan.com</li>
                <li>Através das definições da sua conta na aplicação</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                Responderemos ao seu pedido no prazo de um mês. Em casos complexos, podemos estender este 
                prazo por mais dois meses, informando-o do motivo da extensão.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Direito de Apresentar Reclamação</h2>
              <p className="text-muted-foreground">
                Se acredita que o processamento dos seus dados pessoais viola o GDPR, tem o direito de 
                apresentar uma reclamação à Comissão Nacional de Proteção de Dados (CNPD) ou à autoridade 
                de supervisão do seu país de residência.
              </p>
              <p className="text-muted-foreground mt-2">
                CNPD Portugal: <a href="https://www.cnpd.pt" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.cnpd.pt</a>
              </p>
            </section>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default GDPR;
