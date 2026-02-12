import {
  Crown,
  Star,
  Heart,
  BookOpen,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Baby,
  Mic,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface RoleGuideData {
  title: string;
  icon: typeof Crown;
  intro: string;
  responsibilities: string[];
  dos: string[];
  donts: string[];
  faq: { q: string; a: string }[];
}

const ROLE_GUIDES: Record<string, RoleGuideData> = {
  padrinho: {
    title: "Guia do Padrinho 💫",
    icon: Crown,
    intro: "Que honra ter sido escolhido como padrinho! Aqui ficam algumas dicas para aproveitar ao máximo este dia especial.",
    responsibilities: [
      "Estar ao lado do noivo e apoiá-lo com carinho",
      "Guardar as alianças com cuidado até à troca",
      "Ser testemunha oficial deste momento único",
      "Se quiser, preparar um brinde ou umas palavras na recepção",
    ],
    dos: [
      "Chegar com tempo ao ensaio e à cerimónia — sem stress!",
      "Se for fazer um discurso, 2-3 minutinhos bastam 😊",
      "Dar uma mão a receber os convidados",
      "Perguntar ao noivo se precisa de alguma coisa",
      "Seguir o dress code combinado",
    ],
    donts: [
      "Não te preocupes demais — mas tenta não te atrasar 😅",
      "Discursos muito longos podem perder a magia — keep it short!",
      "Verifica as alianças duas vezes, por precaução",
      "Guarda as celebrações para depois do discurso 🥂",
      "Telemóvel em silêncio durante a cerimónia",
    ],
    faq: [
      { q: "Preciso levar um presente além de ser padrinho?", a: "Não é obrigatório, mas é um gesto bonito. Pode ser algo simbólico e pessoal." },
      { q: "Como deve ser o discurso?", a: "Curto (2-3 min), pessoal e positivo. Conte uma história bonita sobre o noivo e deseje felicidades ao casal." },
      { q: "Que roupa devo usar?", a: "Siga o dress code indicado pelos noivos. Em caso de dúvida, pergunte diretamente." },
      { q: "E se eu ficar nervoso no discurso?", a: "É completamente normal! Escreva notas no telemóvel e pratique antes. Os convidados vão adorar independentemente." },
    ],
  },
  madrinha: {
    title: "Guia da Madrinha 💫",
    icon: Crown,
    intro: "Que bom que vais ser madrinha! A noiva confia em ti e vai ser um dia incrível juntas.",
    responsibilities: [
      "Estar por perto e dar apoio à noiva com carinho",
      "Ajudar com os últimos retoques no dia (vestido, véu, bouquet)",
      "Ser testemunha oficial deste momento",
      "Coordenar com as damas de honor, se houver",
    ],
    dos: [
      "Estar disponível nos dias antes — a noiva vai adorar a tua companhia",
      "Levar um kit de emergência (alfinetes, lenços, maquilhagem extra) 💄",
      "Ajudar com a despedida de solteira, se quiseres",
      "Transmitir calma e boas energias à noiva",
      "Seguir o dress code combinado",
    ],
    donts: [
      "Evitar branco ou tons muito parecidos com o da noiva",
      "O destaque é dela — e tu vais brilhar no teu papel!",
      "Tenta não te atrasar ao getting ready",
      "Não stresses a noiva com imprevistos — resolve discretamente 🤫",
      "Manter o telemóvel carregado (para coordenação)",
    ],
    faq: [
      { q: "Que cor de vestido devo usar?", a: "Combine com a noiva. Geralmente há uma paleta de cores definida. Evite branco, creme ou cores muito chamativas." },
      { q: "Preciso organizar a despedida de solteira?", a: "Tradicionalmente sim, mas pode dividir a organização com outras amigas próximas." },
      { q: "E a maquilhagem?", a: "Coordene com a noiva. Muitas vezes a madrinha faz a maquilhagem junto com a noiva no dia." },
    ],
  },
  "dama de honor": {
    title: "Manual da Dama de Honor",
    icon: Star,
    intro: "Como dama de honor, você faz parte do cortejo e apoia a noiva neste dia mágico.",
    responsibilities: [
      "Apoiar a madrinha e a noiva no dia do casamento",
      "Caminhar no cortejo de entrada",
      "Ajudar com detalhes de organização no dia",
      "Estar disponível para fotografias",
    ],
    dos: [
      "Seguir rigorosamente o dress code definido",
      "Ajudar na organização e decoração se necessário",
      "Sorrir nas fotografias e aproveitar o momento",
      "Chegar cedo para o getting ready",
      "Ser proativa e perguntar como pode ajudar",
    ],
    donts: [
      "Usar branco ou cores que conflitem com a paleta",
      "Chegar atrasada ao ensaio ou à cerimónia",
      "Usar o telemóvel durante a cerimónia",
      "Mudar o penteado ou look sem combinar com a noiva",
    ],
    faq: [
      { q: "Preciso levar bouquet?", a: "Depende do planeamento da noiva. Geralmente os bouquets das damas são providenciados pelos noivos." },
      { q: "Que sapatos devo usar?", a: "Combine com a noiva ou madrinha. Conforto é importante — vai estar de pé bastante tempo!" },
      { q: "Qual é a minha posição no altar?", a: "Será definida no ensaio. Geralmente as damas ficam ao lado da noiva." },
    ],
  },
  celebrante: {
    title: "Guia do Celebrante 🎤",
    icon: Mic,
    intro: "Que responsabilidade bonita! Vais conduzir o momento mais emocionante do dia. Aqui ficam umas dicas para te sentires preparado(a).",
    responsibilities: [
      "Preparar e conduzir a cerimónia com o coração",
      "Combinar com os noivos o texto e o tom",
      "Participar no ensaio — ajuda imenso!",
      "Garantir que tudo flui com naturalidade",
    ],
    dos: [
      "Reunir com os noivos pelo menos uma vez antes — vão adorar",
      "Ensaiar o texto em voz alta e cronometrar",
      "Adaptar o tom ao estilo do casal (formal, descontraído, emotivo...)",
      "Testar o som e microfone antes de começar 🎙️",
      "Ter uma cópia impressa como backup — segurança nunca é demais",
    ],
    donts: [
      "Evitar improvisar sem combinar antes com os noivos",
      "Tentar não ultrapassar o tempo combinado",
      "Piadas? Sim, mas leves e de bom gosto 😊",
      "Não te esqueças de testar o microfone!",
      "Chegar com tempo — nada de correrias",
    ],
    faq: [
      { q: "Qual a duração ideal da cerimónia?", a: "Entre 20 a 40 minutos é o mais comum. Combine com os noivos." },
      { q: "E se houver votos personalizados?", a: "Coordene com os noivos sobre o momento exato e se precisam de microfone separado." },
      { q: "Preciso de microfone?", a: "Sim, para cerimónias ao ar livre é essencial. Verifique com os noivos a disponibilidade de som." },
    ],
  },
  pajem: {
    title: "Manual do Pajem / Florista",
    icon: Baby,
    intro: "Esta secção é para os pais ou responsáveis das crianças que participam no cortejo.",
    responsibilities: [
      "Caminhar no cortejo levando a almofada das alianças ou pétalas",
      "Seguir o caminho ensaiado até ao altar",
    ],
    dos: [
      "Ensaiar com a criança pelo menos 2-3 vezes antes do dia",
      "Levar snacks e entretenimento para a espera",
      "Ter um plano B caso a criança fique nervosa",
      "Vestir a criança confortavelmente",
      "Elogiar e encorajar bastante a criança",
    ],
    donts: [
      "Forçar a criança se estiver nervosa ou a chorar",
      "Esquecer de fazer o ensaio prévio",
      "Vestir a criança com roupa desconfortável",
      "Deixar a criança sem supervisão antes da cerimónia",
    ],
    faq: [
      { q: "E se a criança chorar ou não quiser ir?", a: "Está tudo bem! Pode ir com um dos pais ou simplesmente ficar sentada. Os noivos compreendem." },
      { q: "Que roupa deve usar?", a: "Os noivos geralmente indicam. Priorize conforto para a criança se sentir à vontade." },
      { q: "Qual a idade ideal?", a: "Entre 3 e 8 anos é o mais comum, mas depende da maturidade de cada criança." },
    ],
  },
  florista: {
    title: "Manual do Pajem / Florista",
    icon: Baby,
    intro: "Esta secção é para os pais ou responsáveis das crianças que participam no cortejo.",
    responsibilities: [
      "Caminhar no cortejo espalhando pétalas pelo caminho",
      "Seguir o ritmo ensaiado até ao altar",
    ],
    dos: [
      "Ensaiar com a criança pelo menos 2-3 vezes antes do dia",
      "Levar snacks e entretenimento para a espera",
      "Ter um plano B caso a criança fique nervosa",
      "Vestir a criança confortavelmente",
      "Elogiar e encorajar bastante a criança",
    ],
    donts: [
      "Forçar a criança se estiver nervosa ou a chorar",
      "Esquecer de fazer o ensaio prévio",
      "Vestir a criança com roupa desconfortável",
      "Deixar a criança sem supervisão antes da cerimónia",
    ],
    faq: [
      { q: "E se a criança chorar ou não quiser ir?", a: "Está tudo bem! Pode ir com um dos pais ou simplesmente ficar sentada. Os noivos compreendem." },
      { q: "Que roupa deve usar?", a: "Os noivos geralmente indicam. Priorize conforto para a criança se sentir à vontade." },
      { q: "Qual a idade ideal?", a: "Entre 3 e 8 anos é o mais comum, mas depende da maturidade de cada criança." },
    ],
  },
};

const GENERIC_GUIDE: RoleGuideData = {
  title: "Guia do Convidado Especial",
  icon: Sparkles,
  intro: "Você tem um lugar especial neste casamento. Aqui ficam algumas dicas úteis.",
  responsibilities: [
    "Honrar o convite especial que recebeu",
    "Estar presente e participar com alegria",
    "Apoiar os noivos neste dia memorável",
  ],
  dos: [
    "Chegar com antecedência à cerimónia",
    "Seguir o dress code indicado pelos noivos",
    "Desligar ou silenciar o telemóvel durante a cerimónia",
    "Aproveitar e celebrar com os noivos",
  ],
  donts: [
    "Chegar atrasado à cerimónia",
    "Usar o telemóvel para filmar/fotografar durante a cerimónia (deixe para o fotógrafo!)",
    "Vestir branco ou cores muito chamativas",
    "Publicar fotos nas redes sociais antes dos noivos",
  ],
  faq: [
    { q: "Posso levar acompanhante?", a: "Verifique o seu convite. Se indicar '+1', sim. Caso contrário, confirme com os noivos." },
    { q: "Preciso levar presente?", a: "É tradição, mas o mais importante é a sua presença. Muitos casais têm lista de presentes." },
  ],
};

function getGuide(role: string): RoleGuideData {
  const key = role.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  return ROLE_GUIDES[key] || GENERIC_GUIDE;
}

interface WeddingEventRoleGuideProps {
  role: string;
  themeColor: string;
}

export function WeddingEventRoleGuide({ role, themeColor }: WeddingEventRoleGuideProps) {
  const guide = getGuide(role);
  const Icon = guide.icon;

  return (
    <Card className="mx-auto max-w-md border-0 shadow-lg bg-card/80 backdrop-blur-sm">
      <CardHeader className="text-center pb-2">
        <div className="flex items-center justify-center gap-2 mb-1">
          <BookOpen className="w-5 h-5 text-muted-foreground" />
          <CardTitle className="text-lg font-serif">{guide.title}</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">{guide.intro}</p>
      </CardHeader>

      <CardContent className="pt-0">
        <Accordion type="multiple" defaultValue={["responsibilities"]} className="w-full">
          {/* Responsibilities */}
          <AccordionItem value="responsibilities">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline">
          <span className="flex items-center gap-2">
                <Icon className="w-4 h-4" style={{ color: themeColor }} />
                O Teu Papel
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2">
                {guide.responsibilities.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Heart className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: themeColor }} />
                    {item}
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>

          {/* Dos */}
          <AccordionItem value="dos">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Dicas Úteis ✨
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2">
                {guide.dos.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>

          {/* Don'ts */}
          <AccordionItem value="donts">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline">
              <span className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-amber-500" />
                Cuidados a Ter 💡
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2">
                {guide.donts.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>

          {/* FAQ */}
          <AccordionItem value="faq" className="border-b-0">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline">
              <span className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-muted-foreground" />
                Perguntas Frequentes
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {guide.faq.map((item, i) => (
                  <div key={i}>
                    <p className="text-sm font-medium text-foreground">{item.q}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{item.a}</p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
