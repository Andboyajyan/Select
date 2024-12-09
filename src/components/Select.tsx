import React, { useEffect, useState, useRef } from 'react';
import './Select.css';

type User = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  job?: string;
};

type Response = {
  data: User[];
  meta: {
    from: number;
    to: number;
    total: number;
  };
};

const API_URL = 'https://frontend-test-middle.vercel.app/api/users';

export const Select: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [modalWidth, setModalWidth] = useState<number>(0);

  const fetchUsers = async (page: number) => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}?page=${page}&limit=50`);
      const result: Response = await response.json();
      setUsers((prev) => [...prev, ...result.data]);
      setHasMore(result.meta.to < result.meta.total);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop === target.clientHeight && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers(page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, page]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (modalRef.current) {
      setModalWidth(modalRef.current.offsetWidth);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalRef.current]);

  return (
    <div className="select-container" ref={dropdownRef}>
      <button
        className={`select-button ${isOpen ? 'open' : ''}`}
        onClick={toggleDropdown}
        style={{ width: modalWidth }}
      >
        {selectedUser ? `${selectedUser.last_name} ${selectedUser.first_name}, ${selectedUser.job || 'No Job'}` : 'Select User'}
        <span className={`arrow ${isOpen ? 'open' : ''}`}>{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <div className="dropdown" ref={modalRef} onScroll={handleScroll}>
          {users.map((user) => (
            <div
              className={`dropdown-item ${selectedUser?.id === user.id ? 'selected' : ''}`}
              key={user.id}
              onClick={() => handleUserSelect(user)}
            >
              <div className="icon">{user.last_name[0]}</div>
              <div className="details">
                <div className="name">
                  {user.last_name} {user.first_name},
                </div>
                <span>&nbsp;</span>
                <div className="job">{user.job || 'No Job'}</div>
              </div>
            </div>
          ))}
          {loading && <div className="loading">Loading...</div>}
          {!hasMore && <div className="no-more">No more users</div>}
        </div>
      )}
    </div>
  );
};
