import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { USER_ROLES } from '../constants';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';

const AdminPage = () => {
  const [companies, setCompanies] = useState([]);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCompanies = async () => {
      const { data, error } = await supabase.from('companies').select('id, name, export_amount');

      if (error) {
        console.error('Ошибка получения данных:', error.message);
      } else {
        setCompanies(data);
      }
    };

    const getUserFromCookie = () => {
      const userCookie = Cookies.get('user');
      if (userCookie) {
        const parsedUser = JSON.parse(userCookie);
        setUser(parsedUser);
        if (parsedUser.user_metadata.role !== USER_ROLES.ADMIN) {
          router.push('/');
        }
      } else {
        router.push('/login');
      }
    };

    fetchCompanies();
    getUserFromCookie();
  }, []);

  const handleUpdateExportAmount = async (companyId, exportAmount) => {
    const { data, error } = await supabase
      .from('companies')
      .update({ export_amount: exportAmount })
      .eq('id', companyId);

    if (error) {
      console.error('Ошибка обновления данных:', error.message);
    } else {
      setCompanies((prevCompanies) =>
        prevCompanies.map((company) => (company.id === companyId ? { ...company, export_amount: exportAmount } : company))
      );
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Админ-панель</h1>
      <table className="table-auto w-full">
        <thead>
          <tr>
            <th className="px-4 py-2">Название компании</th>
            <th className="px-4 py-2">Экспорт (USD)</th>
            <th className="px-4 py-2">Действия</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr key={company.id}>
              <td className="border px-4 py-2">{company.name}</td>
              <td className="border px-4 py-2">
                <input
                  type="number"
                  value={company.export_amount}
                  onChange={(e) => handleUpdateExportAmount(company.id, e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded"
                />
              </td>
              <td className="border px-4 py-2">
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded"
                  onClick={() => handleUpdateExportAmount(company.id, company.export_amount)}
                >
                  Сохранить
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPage;