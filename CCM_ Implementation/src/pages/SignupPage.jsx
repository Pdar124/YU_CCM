import Signup from '../components/auth/Signup';

function SignupPage({ setUser }) {
  return (
    <Signup
      onSignupSuccess={(userData) =>
        setUser(userData)
      }
    />
  );
}

export default SignupPage;