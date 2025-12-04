import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail } from "lucide-react";
import "@/static/contatos/style.css"

const Contato = () => {

  // Estado para armazenar os dados do formulário
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone: '',
        assunto: '',
        mensagem: '',
    });

    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');

    // Função para atualizar o estado quando um campo muda
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    // Função de submissão para enviar os dados para o backend Flask
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const FLASK_API_URL = 'http://localhost:5000/api/v1/enviar-email'; 

        setLoading(true);
        setStatus('');

        try {
            const response = await fetch(FLASK_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Envia os dados como JSON
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setStatus('success');
                // Limpa o formulário após o envio bem-sucedido
                setFormData({ nome: '', email: '', telefone: '', assunto: '', mensagem: '' });
            } else {
                // Captura o erro retornado pelo Flask, se houver
                const errorData = await response.json();
                console.error('Erro ao enviar mensagem:', errorData.error);
                setStatus('error');
            }
        } catch (error) {
            console.error('Erro de rede:', error);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = formData.nome.trim() && formData.email.trim() && formData.assunto.trim() && formData.mensagem.trim();

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
              
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nome</label>
                    <Input placeholder="Seu nome" name="nome" value={formData.nome} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <Input type="email" placeholder="seu@email.com" name="email" value={formData.email} onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Telefone</label>
                  <Input placeholder="(11) 12345-6789" name="telefone" value={formData.telefone} onChange={handleChange}/>
                </div>

                <div className="form-group">
                  <label className="form-label">Assunto</label>
                  <Input placeholder="Sobre o que deseja falar?" name="assunto" value={formData.assunto} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Mensagem</label>
                  <Textarea 
                    placeholder="Digite sua mensagem aqui..." 
                    className="textarea-input"
                    name="mensagem"
                    value={formData.mensagem}
                    onChange={handleChange}
                    required
                  />
                </div>

                {status === 'success' && (
                  <p style={{ color: 'green', fontWeight: 'bold', marginTop: '10px' }}>
                    Mensagem enviada com sucesso!
                  </p>
                  )}
                {status === 'error' && (
                  <p style={{ color: 'red', fontWeight: 'bold', marginTop: '10px' }}>
                  Erro ao enviar. Tente novamente.
                  </p>
                )}

                <Button className="submit-button" size="lg" type="submit" disabled={loading || !isFormValid}>
                  {loading ? 'Enviando...' : 'Enviar Mensagem'}
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