import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="nav">
      <Link to="/" style={{ fontWeight: 700 }}>Mini Admin</Link>
      <NavLink to="/users">Users</NavLink>
      <NavLink to="/posts">Posts</NavLink>
      <span className="badge">JSONPlaceholder</span>
    </nav>
  );
}
