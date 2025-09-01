const { login } = useAuth();
const navigate = useNavigate();
const location = useLocation();
const from = location.state?.from?.pathname || '/home';

const handleLogin = async () => {
  try {
    // Esempio login API (da adattare alla tua api)
    const res = await axios.post('/api/auth/login', {
      emailOrUsername,
      password,
    });

    const { accessToken, user } = res.data;

    // 🚨 🚨 🚨 IMPORTANTE → Passi sia token che user (oggetto completo) 🚨 🚨 🚨
    login(accessToken, user);

    navigate(from, { replace: true });
  } catch (error) {
    console.error("Errore nel login", error);
    // Gestisci errore
  }
};
