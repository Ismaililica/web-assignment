import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { UsersAPI } from '../services/users';
import type { User } from '../types';
import Loading from '../components/Loading';
import ErrorBox from '../components/Error';

type Draft = Omit<User,'id'>;

export default function UsersPage() {
  const [data, setData] = useState<User[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Draft>({ name: '', username: '', email: '' });
  const [q] = useSearchParams();
  const filterUserId = q.get('focusUserId');

  useEffect(() => {
    (async () => {
      try {
        const list = await UsersAPI.list();
        setData(list);
      } catch (e) {
        setErr((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const focusedUser = useMemo(
    () => (filterUserId && data ? data.find(u => u.id === Number(filterUserId)) : undefined),
    [filterUserId, data]
  );

  async function createUser() {
    if (!draft.name || !draft.username || !draft.email) return;
    const tempId = Math.max(1000, ...(data ?? []).map(u => u.id)) + 1;
    const optimistic: User = { id: tempId, ...draft };
    setData(prev => prev ? [optimistic, ...prev] : [optimistic]);
    try {
      const created = await UsersAPI.create(draft);
      setData(prev => prev?.map(u => (u.id === tempId ? { ...created, id: created.id ?? tempId } as User : u)) ?? null);
    } catch {
      setData(prev => prev?.filter(u => u.id !== tempId) ?? null);
    }
    setDraft({ name: '', username: '', email: '' });
  }

  async function saveUser(id: number, body: Draft) {
    const old = data!;
    setData(old.map(u => (u.id === id ? { ...u, ...body } : u)));
    try {
      await UsersAPI.update(id, body);
    } catch {
      setData(old);
    } finally {
      setEditingId(null);
    }
  }

  async function deleteUser(id: number) {
    const old = data!;
    setData(old.filter(u => u.id !== id));
    try {
      await UsersAPI.remove(id);
    } catch {
      setData(old);
    }
  }

  if (loading) return <Loading />;
  if (err) return <ErrorBox message={err} />;

  return (
    <div className="grid">
      {focusedUser && (
        <div className="card">
          <b>Focused User:</b> {focusedUser.name} —{' '}
          <Link to={`/posts?userId=${focusedUser.id}`} className="badge">Show this user's posts</Link>
        </div>
      )}

      <div className="card">
        <h2>Users</h2>
        <div className="row" style={{ margin: '10px 0' }}>
          <input className="input" placeholder="Name" value={draft.name}
                 onChange={e => setDraft({ ...draft, name: e.target.value })} />
          <input className="input" placeholder="Username" value={draft.username}
                 onChange={e => setDraft({ ...draft, username: e.target.value })} />
          <input className="input" placeholder="Email" value={draft.email}
                 onChange={e => setDraft({ ...draft, email: e.target.value })} />
          <button onClick={createUser}>Add</button>
        </div>

        <table className="table">
          <thead>
            <tr><th>id</th><th>name</th><th>username</th><th>email</th><th>actions</th></tr>
          </thead>
          <tbody>
            {data?.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{editingId === u.id
                  ? <input className="input" defaultValue={u.name} onChange={e => (u.name = e.target.value)} />
                  : u.name}
                </td>
                <td>{editingId === u.id
                  ? <input className="input" defaultValue={u.username} onChange={e => (u.username = e.target.value)} />
                  : u.username}
                </td>
                <td>{editingId === u.id
                  ? <input className="input" defaultValue={u.email} onChange={e => (u.email = e.target.value)} />
                  : u.email}
                </td>
                <td className="row">
                  <Link to={`/posts?userId=${u.id}`} className="badge">Posts</Link>
                  {editingId === u.id ? (
                    <>
                      <button onClick={() => saveUser(u.id, { name: u.name, username: u.username, email: u.email })}>Save</button>
                      <button onClick={() => setEditingId(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setEditingId(u.id)}>Edit</button>
                      <button onClick={() => deleteUser(u.id)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p style={{ color: 'var(--muted)' }}>
          Not: JSONPlaceholder üzerinde CRUD kalıcı değildir. UI, *optimistic* olarak güncellenir.
        </p>
      </div>
    </div>
  );
}
