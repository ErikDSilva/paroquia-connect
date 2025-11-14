import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail } from "lucide-react";
import "@/static/contatos/style.css"

const Contato = () => {
  return (
    <div className="contato-page">
      <Header />
      
      <main className="main-container">
        <div className="content-wrapper">
          <div className="header-section">
            <h1 className="title">Entre em Contato</h1>
            <p className="subtitle">Tire suas dúvidas e entre em contato com a paróquia</p>
          </div>

          <div className="grid-layout">
            {/* Contact Information */}
            <div>
              <Card className="contact-info-card">
                <h2 className="card-title">Informações de Contato</h2>
                
                <div className="info-list">
                  <div className="info-item">
                    <div className="icon-container">
                      <MapPin className="icon" />
                    </div>
                    <div>
                      <h3 className="info-heading">Endereço</h3>
                      <p className="info-text">
                        Rua da Igreja, 123<br />
                        Centro - CEP 12345-678<br />
                        Cidade - Estado
                      </p>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="icon-container">
                      <Phone className="icon" />
                    </div>
                    <div>
                      <h3 className="info-heading">Telefone</h3>
                      <p className="info-text">
                        (11) 1234-5678<br />
                        (11) 98765-4321
                      </p>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="icon-container">
                      <Mail className="icon" />
                    </div>
                    <div>
                      <h3 className="info-heading">Email</h3>
                      <p className="info-text">
                        contato@paroquia.com.br<br />
                        secretaria@paroquia.com.br
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="hours-card">
                <h2 className="card-title">Horário de Atendimento</h2>
                <div className="hours-list">
                  <div className="hours-item">
                    <span className="hours-label">Segunda a Sexta:</span>
                    <span className="hours-time">14:00 - 17:00</span>
                  </div>
                  <div className="hours-item">
                    <span className="hours-label">Sábado:</span>
                    <span className="hours-time">09:00 - 12:00</span>
                  </div>
                  <div className="hours-item">
                    <span className="hours-label">Domingo:</span>
                    <span className="hours-time">Após as missas</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Contact Form */}
            <Card className="form-card">
              <h2 className="card-title">Enviar Mensagem</h2>
              
              <form className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nome</label>
                    <Input placeholder="Seu nome" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <Input type="email" placeholder="seu@email.com" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Telefone</label>
                  <Input placeholder="(11) 12345-6789" />
                </div>

                <div className="form-group">
                  <label className="form-label">Assunto</label>
                  <Input placeholder="Sobre o que deseja falar?" />
                </div>

                <div className="form-group">
                  <label className="form-label">Mensagem</label>
                  <Textarea 
                    placeholder="Digite sua mensagem aqui..." 
                    className="textarea-input"
                  />
                </div>

                <Button className="submit-button" size="lg">
                  ENVIAR MENSAGEM
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contato;