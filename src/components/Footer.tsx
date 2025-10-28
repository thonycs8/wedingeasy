import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-8 bg-foreground text-background border-t">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Brand & Copyright */}
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            <span className="font-semibold">wedigneasy</span>
            <span className="text-muted text-sm">© {new Date().getFullYear()} Todos os direitos reservados</span>
          </div>
          
          {/* Links */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <Link 
              to="/privacy-policy" 
              className="text-muted hover:text-background transition-colors"
            >
              Política de Privacidade
            </Link>
            <span className="text-muted">•</span>
            <Link 
              to="/gdpr" 
              className="text-muted hover:text-background transition-colors"
            >
              GDPR
            </Link>
            <span className="text-muted">•</span>
            <Link 
              to="/cookies" 
              className="text-muted hover:text-background transition-colors"
            >
              Cookies
            </Link>
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
