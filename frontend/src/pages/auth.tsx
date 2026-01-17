import { useState, useRef } from "react"; // Adicionado useRef
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react"; 
import ReCAPTCHA from "react-google-recaptcha"; // Import do componente

import "@/static/auth/style.css"; 

const RECAPTCHA_SITE_KEY = "6LdY90osAAAAANCFZOABYhw12VGgc3Pu3k0QfDyA"; 

const API_URL = import.meta.env.VITE_API_URL;


const Auth = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Login States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  
  // States do Recaptcha
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<ReCAPTCHA>(null);

  // Controle de visibilidade da senha
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Estado para feedback visual do Login
  const [loginFeedback, setLoginFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const onCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginFeedback(null);

    // 1. Validação Visual do Captcha
    if (!captchaToken) {
        setLoginFeedback({ type: 'error', message: "Por favor, confirme que você não é um robô." });
        return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ 
            email: loginEmail, 
            senha: loginPass,
            recaptchaToken: captchaToken // Enviando o token
        })
      });

      const data = await res.json();

      if (res.ok) {
        login(data.user); 
        setLoginFeedback({ type: 'success', message: "Login realizado com sucesso! Redirecionando..." });

        setTimeout(() => {
          navigate("/admin"); 
        }, 1000);

      } else {
        setLoginFeedback({ type: 'error', message: data.error || "Credenciais inválidas." });
        
        // Se a senha estiver errada, resetamos o captcha para o usuário tentar de novo
        captchaRef.current?.reset();
        setCaptchaToken(null);
      }
    } catch (error) {
      setLoginFeedback({ type: 'error', message: "Erro de conexão com o servidor." });
      // Reseta em caso de erro de rede também
      captchaRef.current?.reset();
      setCaptchaToken(null);
    }
  };


  return (
    <div className="auth-page">
      <main className="auth-main">
        <div className="auth-content-wrapper">
          <Card className="auth-card">
            <div className="auth-header">
              <div className="logo-wrapper">
                <span className="logo-text">P</span>
              </div>
              <h1 className="title">Bem-vindo</h1>
              <p className="subtitle">Acesse o painel administrativo</p>
            </div>

            <form className="form-stack" onSubmit={handleLoginSubmit}>
              
              {loginFeedback && (
                <div 
                  style={{
                    padding: "12px",
                    marginBottom: "16px",
                    borderRadius: "6px",
                    fontSize: "0.9rem",
                    textAlign: "center",
                    backgroundColor: loginFeedback.type === 'success' ? '#dcfce7' : '#fee2e2',
                    color: loginFeedback.type === 'success' ? '#166534' : '#991b1b',
                    border: `1px solid ${loginFeedback.type === 'success' ? '#86efac' : '#fca5a5'}`
                  }}
                >
                  {loginFeedback.message}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Email</label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Senha</label>
                <div className="relative">
                  <Input
                    type={showLoginPass ? "text" : "password"} 
                    placeholder="••••••••"
                    value={loginPass}
                    onChange={e => setLoginPass(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPass(!showLoginPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    {showLoginPass ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* RECAPTCHA ADICIONADO AQUI */}
              <div className="flex justify-center my-4">
                <ReCAPTCHA
                    ref={captchaRef}
                    sitekey={RECAPTCHA_SITE_KEY}
                    onChange={onCaptchaChange}
                />
              </div>

              <Button type="submit" className="btn-primary" size="lg">
                Entrar
              </Button>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Auth;