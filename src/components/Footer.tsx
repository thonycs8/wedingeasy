import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-8 bg-foreground text-background border-t">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Brand & Copyright */}
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            <span className="font-semibold">Wedding Plan</span>
            <span className="text-muted text-sm">© {new Date().getFullYear()} Todos os direitos reservados</span>
          </div>
          
          {/* Links */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <a 
              href="#" 
              className="text-muted hover:text-background transition-colors"
            >
              Política de Privacidade
            </a>
            <span className="text-muted">•</span>
            <a 
              href="#" 
              className="text-muted hover:text-background transition-colors"
            >
              GDPR
            </a>
            <span className="text-muted">•</span>
            <a 
              href="#" 
              className="text-muted hover:text-background transition-colors"
            >
              Cookies
            </a>
          </div>
          
          {/* Attribution */}
          <div className="text-sm text-muted">
            Desenvolvido por{" "}
            <a 
              href="https://missaodesign.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-background hover:text-primary transition-colors font-medium"
            >
              Missão Design
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
