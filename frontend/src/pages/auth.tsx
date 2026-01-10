import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
// Componentes importados (mantidos)
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react"; 
import "@/static/auth/style.css"; // Estilos

const Auth = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Login States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");

  // Controle de visibilidade da senha
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Estado para feedback visual do Login
  const [loginFeedback, setLoginFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // REMOVIDA A LÓGICA DE CADASTRO E VERIFICAÇÃO

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginFeedback(null);

    try {
      const res = await fetch("http://localhost:5000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ email: loginEmail, senha: loginPass })
      });

      const data = await res.json();

      if (res.ok) {
        // Assume que qualquer login bem-sucedido é de um administrador
        login(data.user); 
        setLoginFeedback({ type: 'success', message: "Login realizado com sucesso! Redirecionando para a administração..." });

        setTimeout(() => {
          // REDIRECIONAMENTO DIRETO PARA A ÁREA ADMINISTRATIVA
          navigate("/admin"); 
        }, 1000);

      } else {
        setLoginFeedback({ type: 'error', message: data.error || "Credenciais inválidas." });
      }
    } catch (error) {
      setLoginFeedback({ type: 'error', message: "Erro de conexão com o servidor." });
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
              <p className="subtitle">Acesse o painel administrativo</p> {/* Texto ajustado */}
            </div>

            {/* O formulário de Login permanece o mesmo */}
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