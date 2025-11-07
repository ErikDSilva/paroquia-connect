export default function Contato() {
  return (

    <div className="min-h-screen p-8">

      {/* Cabeçalho da seção */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Entre em Contato</h1>
        <p className="text-blue-700">
          Tire suas dúvidas e entre em contato com a paróquia
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Informações de contato */}
        <div className="flex-1 border-l-4 border-blue-800 pl-8 text-blue-900 font-bold space-y-10 text-lg">
          <p>Endereço</p>
          <p>Telefone</p>
          <p>Email</p>
        </div>

        {/* Formulário */}
        <div className="flex-1 border border-black rounded-md p-6 shadow-sm">
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-900 font-bold">
            {/* Linha 1 */}
            <div>
              <label>Nome</label>
              <input
                type="text"
                className="w-full border border-gray-400 rounded-sm bg-gray-100 p-1"
              />
            </div>
            <div>
              <label>Email</label>
              <input
                type="email"
                className="w-full border border-gray-400 rounded-sm bg-gray-100 p-1"
              />
            </div>

            {/* Linha 2 */}
            <div>
              <label>Telefone</label>
              <input
                type="text"
                className="w-full border border-gray-400 rounded-sm bg-gray-100 p-1"
              />
            </div>
            <div>
              <label>Assunto</label>
              <input
                type="text"
                className="w-full border border-gray-400 rounded-sm bg-gray-100 p-1"
              />
            </div>

            {/* Linha 3 — Mensagem */}
            <div className="md:col-span-2">
              <label>Mensagem</label>
              <textarea
                rows={4}
                className="w-full border border-gray-400 rounded-sm bg-gray-100 p-1"
              ></textarea>
            </div>

            {/* Botão */}
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-black font-bold py-2 rounded-sm"
              >
                ENVIAR MENSAGEM
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
