import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { USER_ROLES } from '../constants';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';

const MainPage = () => {
  const [companies, setCompanies] = useState([]);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCompanies = async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('name, export_amount')
        .order('export_amount', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Ошибка получения данных:', error.message);
      } else {
        setCompanies(data);
      }
    };

    const getUserFromCookie = () => {
      const userCookie = Cookies.get('user');
      if (userCookie) {
        setUser(JSON.parse(userCookie));
      } else {
        router.push('/login');
      }
    };

    fetchCompanies();
    getUserFromCookie();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    Cookies.remove('user');
    router.push('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Топ 10 компаний по экспорту IT в Каракалпакстане (2024 год)</h1>
      <table className="table-auto w-full">
        <thead>
          <tr>
            <th className="px-4 py-2">Название компании</th>
            {user.user_metadata.role === USER_ROLES.ADMIN && <th className="px-4 py-2">Экспорт (USD)</th>}
          </tr>
        </thead>
        <tbody>
          {companies.map((company, index) => (
            <tr key={company.id}>
              <td className="border px-4 py-2">{index + 1}. {company.name}</td>
              {user.user_metadata.role === USER_ROLES.ADMIN && (
                <td className="border px-4 py-2">{company.export_amount}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <button
        className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        onClick={handleLogout}
      >
        Выйти
      </button>
    </div>
  );
};

export default MainPage;