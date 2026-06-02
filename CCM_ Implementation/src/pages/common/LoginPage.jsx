import Login from '../../components/auth/Login';

function LoginPage({ setUser }) {
  return (
    <Login
      onLoginSuccess={(userData) => setUser(userData)}
      onGuestLogin={() =>
        setUser({ id: 'guest', role: 'guest', uid: null })
      }
    />
  );
}

export default LoginPage;
