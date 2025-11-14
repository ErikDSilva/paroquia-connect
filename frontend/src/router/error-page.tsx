import { Link, useRouteError, isRouteErrorResponse } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();

  const errorMessages: Record<number | string, string> = {
    404: "Vamos te levar de volta para a Terra!",
    500: "Erro interno do servidor.",
    default: "Ocorreu um erro inesperado.",
  };

  let statusCode: number | string = "Ops, deu algum problema";
  let errorMessage = errorMessages.default;
  let statusText: string | undefined;
  let message: string | undefined;

  if (isRouteErrorResponse(error)) {
    statusCode = error.status;
    errorMessage = errorMessages[error.status] || errorMessages.default;
    statusText = error.statusText;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <section className="flex flex-col items-center justify-center min-h-[100vh] pb-8 pt-32 px-4 mx-auto max-w-screen-xl text-center lg:pb-16 lg:pt-32">
      <div className="max-w-md inline-flex justify-between items-center py-1 px-1 pe-4 mb-7 text-sm text-blue-700 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-400 dark:hover:bg-800">
        <span className="text-xs bg-[#ffea00] rounded-full text-black px-4 py-1.5 me-3">
          Ops
        </span>
        <span className="text-sm font-medium">Está página não existe</span>
        <svg
          className="w-2.5 h-2.5 ms-2 rtl:rotate-180"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 6 10"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 9 4-4-4-4"
          />
        </svg>
      </div>

      <h1 className="mb-4 text-3xl font-extrabold tracking-tight leading-none text-zinc-900 md:text-5xl lg:text-3xl dark:text-white">
        {errorMessage}
      </h1>

      {statusText && (
        <p className="mb-8 text-lg font-normal text-zinc-500 lg:text-xl sm:px-16 lg:px-48 dark:text-zinc-400">
          <i>{statusText}</i>
        </p>
      )}

      {message && (
        <p className="text-zinc-400 mb-5">
          <i>{message}</i>
        </p>
      )}

      <p className="text-sm mt-4 mb-9">Código do erro: {statusCode}</p>

      <div className="flex justify-center">
        <Link
          to="/"
          className="w-[200px] inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900"
        >
          Página inicial
          <svg
            className="w-3.5 h-3.5 ms-2 rtl:rotate-180"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 10"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 5h12m0 0L9 1m4 4L9 9"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
}
