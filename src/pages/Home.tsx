import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="grid">
      <div className="card">
        <h2>Welcome 👋</h2>
        <p>Bu demo; <b>Users</b> ve <b>Posts</b> listelerini, CRUD işlemlerini ve <code>userId</code> ilişkisini gösterir.</p>
        <div className="row">
          <Link to="/users" className="badge">Go to Users</Link>
          <Link to="/posts" className="badge">Go to Posts</Link>
        </div>
      </div>
    </div>
  );
}
