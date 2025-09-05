import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PostsAPI } from '../services/posts';
import { UsersAPI } from '../services/users';
import type { Post, User } from '../types';
import Loading from '../components/Loading';
import ErrorBox from '../components/Error';

type Draft = Omit<Post,'id'>;

export default function PostsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Draft>({ userId: 1, title: '', body: '' });
  const [q, setQ] = useSearchParams();
  const selectedUserId = Number(q.get('userId') || 0);

  useEffect(() => {
    (async () => {
      try {
        const [u, p] = await Promise.all([UsersAPI.list(), selectedUserId ? PostsAPI.byUser(selectedUserId) : PostsAPI.list()]);
        setUsers(u);
        setPosts(p);
      } catch (e) {
        setErr((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedUserId]);

  const userMap = useMemo(() => new Map(users.map(u => [u.id, u.name])), [users]);

  function setFilter(userId: number) {
    if (userId) setQ({ userId: String(userId) });
    else setQ({});
  }

  async function createPost() {
    if (!draft.title.trim()) return;
    const tempId = Math.max(1000, ...(posts ?? []).map(p => p.id)) + 1;
    const optimistic: Post = { id: tempId, ...draft };
    setPosts(prev => prev ? [optimistic, ...prev] : [optimistic]);
    try {
      const created = await PostsAPI.create(draft);
      setPosts(prev => prev?.map(p => (p.id === tempId ? { ...created, id: created.id ?? tempId } as Post : p)) ?? null);
    } catch {
      setPosts(prev => prev?.filter(p => p.id !== tempId) ?? null);
    }
    setDraft({ userId: draft.userId, title: '', body: '' });
  }

  async function savePost(id: number, body: Draft) {
    const old = posts!;
    setPosts(old.map(p => (p.id === id ? { ...p, ...body } : p)));
    try {
      await PostsAPI.update(id, body);
    } catch {
      setPosts(old);
    } finally {
      setEditingId(null);
    }
  }

  async function deletePost(id: number) {
    const old = posts!;
    setPosts(old.filter(p => p.id !== id));
    try {
      await PostsAPI.remove(id);
    } catch {
      setPosts(old);
    }
  }

  if (loading) return <Loading />;
  if (err) return <ErrorBox message={err} />;

  return (
    <div className="grid">
      <div className="card">
        <h2>Posts</h2>

        <div className="row" style={{ margin: '10px 0' }}>
          <label>Filter by user:{' '}
            <select value={selectedUserId || 0} onChange={e => setFilter(Number(e.target.value))}>
              <option value={0}>All</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </label>
        </div>

        <div className="row" style={{ margin: '10px 0' }}>
          <select value={draft.userId} onChange={e => setDraft({ ...draft, userId: Number(e.target.value) })}>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <input className="input" placeholder="Title" value={draft.title}
                 onChange={e => setDraft({ ...draft, title: e.target.value })} />
          <input className="input" placeholder="Body (optional)" value={draft.body}
                 onChange={e => setDraft({ ...draft, body: e.target.value })} />
          <button onClick={createPost}>Add</button>
        </div>

        <table className="table">
          <thead>
            <tr><th>id</th><th>user</th><th>title</th><th>actions</th></tr>
          </thead>
          <tbody>
            {posts?.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{userMap.get(p.userId) ?? `User #${p.userId}`}</td>
                <td>
                  {editingId === p.id
                    ? <input className="input" defaultValue={p.title} onChange={e => (p.title = e.target.value)} />
                    : p.title}
                </td>
                <td className="row">
                  {editingId === p.id ? (
                    <>
                      <button onClick={() => savePost(p.id, { userId: p.userId, title: p.title, body: p.body })}>Save</button>
                      <button onClick={() => setEditingId(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setEditingId(p.id)}>Edit</button>
                      <button onClick={() => deletePost(p.id)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="badge">Relation via <code>userId</code> (filter + username column)</p>
      </div>
    </div>
  );
}
