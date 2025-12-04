import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import "@/static/auth/style.css";

const Auth = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Login States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");

  // Register States
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerPass, setRegisterPass] = useState("");
  const [registerConfirmPass, setRegisterConfirmPass] = useState("");

  // Verification States (Novo)
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [emailToVerify, setEmailToVerify] = useState(""); // Guarda o email para enviar junto com o código

  // Validação de Senha (Novo)
  const validatePassword = (password: string) => {
    if (password.length < 8) return "A senha deve ter no mínimo 8 caracteres.";
    if (!/[A-Z]/.test(password)) return "A senha deve ter pelo menos uma letra maiúscula.";
    if (!/[0-9]/.test(password)) return "A senha deve ter pelo menos um número.";
    // Opcional: caractere especial
    // if (!/[!@#$%^&*]/.test(password)) return "A senha deve ter um caractere especial.";
    return null;
  };

  // --- NOVA PARTE: USE EFFECT PARA NAVEGAÇÃO ---
  // useEffect(() => {
  //   // Esse código roda automaticamente assim que o 'user' for atualizado pelo login()
  //   if (user) {
  //     if (user.is_admin) {
  //       navigate("/admin");
  //     } else {
  //       navigate("/");
  //     }
  //   }
  // }, [user, navigate]); // <--- Monitora 'user' e 'navigate'



  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, senha: loginPass })
      });

      const data = await res.json();

      if (res.ok) {
        login(data.user);
        toast({ title: "Bem-vindo(a)!", description: "Login realizado com sucesso." });
        if (data.user.is_admin) {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        toast({ title: "Atenção", description: data.error, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Erro", description: "Erro de conexão com o servidor.", variant: "destructive" });
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validar Senhas Iguais
    if (registerPass !== registerConfirmPass) {
      toast({ title: "Erro", description: "As senhas não coincidem.", variant: "destructive" });
      return;
    }

    // 2. Validar Força da Senha
    const passwordError = validatePassword(registerPass);
    if (passwordError) {
      toast({ title: "Senha Fraca", description: passwordError, variant: "destructive" });
      return;
    }

    try {
      toast({ title: "Aguarde...", description: "Enviando código de verificação..." });

      const res = await fetch("http://localhost:5000/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // credentials: "include", // No registro não é estritamente necessário se não logar automaticamente, mas mal não faz.
        body: JSON.stringify({
          nome: registerName,
          email: registerEmail,
          senha: registerPass,
          telefone: registerPhone
        })
      });

      const data = await res.json();

      if (res.ok) {
        // Sucesso: Muda para a tela de digitar código
        setEmailToVerify(registerEmail);
        setVerificationStep(true);
        toast({ title: "Código Enviado!", description: "Verifique seu e-mail para confirmar o cadastro." });
      } else {
        toast({ title: "Erro", description: data.error, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao tentar cadastrar.", variant: "destructive" });
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/v1/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToVerify, codigo: verificationCode })
      });

      const data = await res.json();

      if (res.ok) {
        toast({ title: "Conta Verificada!", description: "Agora você pode fazer login." });
        setVerificationStep(false);
        // Opcional: recarregar a página ou mudar para a aba de login via estado se tivesse controle da Tab
        window.location.reload();
      } else {
        toast({ title: "Erro", description: data.error, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Erro", description: "Falha na verificação.", variant: "destructive" });
    }
  };

  return (
    <div className="auth-page">
      <Header />
      <main className="auth-main">
        <div className="auth-content-wrapper">
          <Card className="auth-card">
            <div className="auth-header">
              <div className="logo-wrapper">
                <span className="logo-text">P</span>
              </div>
              <h1 className="title">Bem-vindo</h1>
              <p className="subtitle">Acesse sua conta ou crie uma nova</p>
            </div>

            <Tabs defaultValue="login" className="tabs-full">
              <TabsList className="tabs-list-grid">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Cadastrar</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form className="form-stack" onSubmit={handleLoginSubmit}>
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
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={loginPass}
                      onChange={e => setLoginPass(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="btn-primary" size="lg">
                    Entrar
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                {/* LÓGICA DE EXIBIÇÃO: SE estiver verificando, mostra input de código. SE NÃO, mostra cadastro normal */}
                {verificationStep ? (
                  <form className="form-stack animate-in fade-in" onSubmit={handleVerificationSubmit}>
                    <div className="text-center mb-4">
                      <h3 className="font-semibold text-lg">Verifique seu E-mail</h3>
                      <p className="text-sm text-muted-foreground">Enviamos um código de 6 dígitos para <strong>{emailToVerify}</strong></p>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Código de Verificação</label>
                      <Input
                        className="text-center text-xl tracking-widest"
                        maxLength={6}
                        placeholder="000000"
                        value={verificationCode}
                        onChange={e => setVerificationCode(e.target.value)}
                        required
                      />
                    </div>

                    <Button type="submit" className="btn-success w-full" size="lg">
                      Confirmar Código
                    </Button>
                    <Button type="button" variant="ghost" className="w-full mt-2" onClick={() => setVerificationStep(false)}>
                      Voltar / Corrigir E-mail
                    </Button>
                  </form>
                ) : (
                  <form className="form-stack" onSubmit={handleRegisterSubmit}>
                    <div className="form-group">
                      <label className="form-label">Nome Completo</label>
                      <Input value={registerName} onChange={e => setRegisterName(e.target.value)} required />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Email (Google/Gmail)</label>
                      <Input type="email" value={registerEmail} onChange={e => setRegisterEmail(e.target.value)} required />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Telefone</label>
                      <Input value={registerPhone} onChange={e => setRegisterPhone(e.target.value)} />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Senha</label>
                      <Input type="password" value={registerPass} onChange={e => setRegisterPass(e.target.value)} required />
                      <p className="text-xs text-muted-foreground mt-1">Min. 8 caracteres, 1 maiúscula, 1 número.</p>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Confirmar Senha</label>
                      <Input type="password" value={registerConfirmPass} onChange={e => setRegisterConfirmPass(e.target.value)} required />
                    </div>

                    <Button type="submit" className="btn-accent" size="lg">
                      Criar Conta
                    </Button>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Auth;