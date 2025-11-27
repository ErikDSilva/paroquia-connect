import { useEffect, useState } from "react";
import axios from 'axios';


interface Evento {
  mensagem: string;
  valor: number;
}

export default function Teste() {

  // UseEffect para buscar as tarefas quando o componente for montado
  const [numeros, setNumeros] = useState<number[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/v1/mensagem")
      .then(response => response.json())
      .then((data: number[]) => {
        setNumeros(data); // <-- array vindo do Flask
      })
      .catch(err => console.error(err));
  }, []);


  return (
    <div>
      <h1>teste</h1>
      <ul>
        {numeros.map(n => (
          <li key={n}>{n}</li>
        ))}
      </ul>
    </div>
  );
}