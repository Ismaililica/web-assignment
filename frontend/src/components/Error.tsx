export default function ErrorBox({ message }: { message: string }) {
  return <div className="card" role="alert">Error: {message}</div>;
}
