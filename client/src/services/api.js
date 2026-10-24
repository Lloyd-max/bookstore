const API_URL = 'http://localhost:5000/api';

export async function fetchBooks() {
  try {
    const response = await fetch(`${API_URL}/books`);
    if (!response.ok) throw new Error('Failed to fetch books');
    return await response.json();
  } catch (err) {
    console.error('Error fetching books:', err);
    return [];
  }
}

export async function loginUser(email, password) {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include' // Crucial for session cookies
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export async function registerUser(email, password) {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include'
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Registration failed');
  return data;
}

export async function checkAuth() {
  try {
    const response = await fetch(`${API_URL}/me`, {
      credentials: 'include'
    });
    return await response.json();
  } catch (err) {
    console.error('Auth check failed:', err);
    return { loggedIn: false };
  }
}

export async function logoutUser() {
  const response = await fetch(`${API_URL}/logout`, {
    method: 'POST',
    credentials: 'include'
  });
  return await response.json();
}