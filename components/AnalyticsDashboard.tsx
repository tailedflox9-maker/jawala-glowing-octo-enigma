import React, { useState, useEffect } from 'react';
import { 
  getAnalyticsSummary, 
  getAllUsers, 
  getRecentVisits, 
  AnalyticsSummary,
  UserTrackingData,
  VisitLog 
} from '../trackingService';

interface AnalyticsDashboardProps {
  onClose: () => void;
  onBack: () => void;
  onBackToAdmin: () => void;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ onClose, onBack, onBackToAdmin }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [users, setUsers] = useState<UserTrackingData[]>([]);
  const [recentVisits, setRecentVisits] = useState<VisitLog[]>([]);
  const [activeTab, setActiveTab] = useState<'summary' | 'details'>('summary');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const [summaryData, usersData, visitsData] = await Promise.all([
        getAnalyticsSummary(),
        getAllUsers(),
        getRecentVisits(100)
      ]);
      
      setSummary(summaryData);
      setUsers(usersData);
      setRecentVisits(visitsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('mr-IN', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'आत्ताच';
    if (diffMins < 60) return `${diffMins} मिनिटे आधी`;
    if (diffHours < 24) return `${diffHours} तास आधी`;
    if (diffDays < 7) return `${diffDays} दिवस आधी`;
    return formatDate(dateString);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-surface rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl">
          <div className="w-12 h-12 border-4 border-t-primary border-gray-200 rounded-full animate-spin"></div>
          <p className="text-text-secondary font-semibold">माहिती लोड करत आहे...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fadeInUp backdrop-blur-sm" style={{animationDuration: '0.3s'}} onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fadeInUp" style={{animationDuration: '0.3s'}} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={onBackToAdmin} 
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                title="मागे जा"
              >
                <i className="fas fa-arrow-left text-lg"></i>
              </button>
              <div>
                <h2 className="text-2xl font-bold font-poppins flex items-center gap-3">
                  <i className="fas fa-chart-line"></i>
                  अँनालिटिक्स डॅशबोर्ड
                </h2>
                <p className="text-white/80 text-sm mt-1">वापरकर्ता आणि भेटींचा तपशील</p>
              </div>
            </div>
            <button 
              onClick={loadAnalytics}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2 font-semibold backdrop-blur-sm text-sm"
            >
              <i className="fas fa-sync-alt"></i>
              <span className="hidden sm:inline">रिफ्रेश</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="p-6 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Users Card */}
            <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <i className="fas fa-users text-xl text-blue-600"></i>
                </div>
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-bold">
                  एकूण
                </span>
              </div>
              <h3 className="text-3xl font-bold text-blue-600 mb-1">
                {summary?.total_unique_users || 0}
              </h3>
              <p className="text-xs text-gray-600 font-medium">युनिक वापरकर्ते</p>
            </div>

            {/* Total Visits Card */}
            <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <i className="fas fa-eye text-xl text-green-600"></i>
                </div>
                <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full font-bold">
                  एकूण
                </span>
              </div>
              <h3 className="text-3xl font-bold text-green-600 mb-1">
                {summary?.total_visits || 0}
              </h3>
              <p className="text-xs text-gray-600 font-medium">एकूण भेटी</p>
            </div>

            {/* Average Visits Card */}
            <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <i className="fas fa-chart-line text-xl text-purple-600"></i>
                </div>
                <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full font-bold">
                  सरासरी
                </span>
              </div>
              <h3 className="text-3xl font-bold text-purple-600 mb-1">
                {summary && summary.total_unique_users > 0 
                  ? (summary.total_visits / summary.total_unique_users).toFixed(1)
                  : '0'}
              </h3>
              <p className="text-xs text-gray-600 font-medium">प्रति वापरकर्ता</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-6">
          <div className="flex gap-1">
            {[
              { id: 'summary', label: 'सारांश', icon: 'fa-chart-pie' },
              { id: 'details', label: 'तपशील', icon: 'fa-list' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-3 font-semibold rounded-t-xl transition-all text-sm ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 border-b-4 border-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <i className={`fas ${tab.icon} mr-2`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto bg-gray-50" style={{maxHeight: 'calc(90vh - 320px)'}}>
          <div className="p-6">
            {activeTab === 'summary' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Top Users */}
                <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                    <i className="fas fa-trophy text-yellow-500"></i>
                    टॉप 5 सक्रिय वापरकर्ते
                  </h3>
                  <div className="space-y-3">
                    {users
                      .slice()
                      .sort((a, b) => (b.total_visits || 0) - (a.total_visits || 0))
                      .slice(0, 5)
                      .map((user, index) => (
                        <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold ${
                              index === 0 ? 'bg-yellow-100 text-yellow-600' :
                              index === 1 ? 'bg-gray-200 text-gray-600' :
                              index === 2 ? 'bg-orange-100 text-orange-600' :
                              'bg-gray-100 text-gray-500'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 text-sm">{user.user_name}</p>
                              <p className="text-xs text-gray-500">
                                {formatRelativeTime(user.last_visit_at || '')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg font-bold text-sm">
                              {user.total_visits}
                            </span>
                          </div>
                        </div>
                      ))}
                    {users.length === 0 && (
                      <div className="text-center py-8">
                        <i className="fas fa-users text-4xl text-gray-300 mb-2"></i>
                        <p className="text-gray-500 text-sm">अद्याप वापरकर्ते नाहीत</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                    <i className="fas fa-history text-green-600"></i>
                    अलीकडील क्रियाकलाप
                  </h3>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {recentVisits.slice(0, 10).map((visit, index) => (
                      <div key={visit.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <i className="fas fa-user text-green-600 text-xs"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate text-sm">{visit.user_name || 'अतिथी'}</p>
                          <p className="text-xs text-gray-500">
                            {formatRelativeTime(visit.visited_at || '')}
                          </p>
                        </div>
                      </div>
                    ))}
                    {recentVisits.length === 0 && (
                      <div className="text-center py-8">
                        <i className="fas fa-clock text-4xl text-gray-300 mb-2"></i>
                        <p className="text-gray-500 text-sm">अद्याप क्रियाकलाप नाही</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'details' && (
              <div className="space-y-5">
                {/* All Users Table */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                  <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <i className="fas fa-users text-blue-600"></i>
                      सर्व वापरकर्ते ({users.length})
                    </h3>
                  </div>
                  {users.length > 0 ? (
                    <div className="overflow-x-auto max-h-96">
                      <table className="w-full">
                        <thead className="bg-gray-100 border-b border-gray-200 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">#</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">नाव</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">पहिली भेट</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">शेवटची भेट</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-700">भेटी</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {users
                            .slice()
                            .sort((a, b) => (b.total_visits || 0) - (a.total_visits || 0))
                            .map((user, index) => (
                              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3">
                                  <span className="text-gray-500 font-semibold text-sm">{index + 1}</span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                      <i className="fas fa-user text-blue-600 text-xs"></i>
                                    </div>
                                    <span className="font-bold text-gray-800 text-sm">{user.user_name}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-xs text-gray-600">
                                    {new Date(user.first_visit_at || '').toLocaleDateString('mr-IN', {
                                      day: 'numeric',
                                      month: 'short'
                                    })}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-xs text-gray-600">
                                    {formatRelativeTime(user.last_visit_at || '')}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full font-bold text-sm">
                                    {user.total_visits}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <i className="fas fa-users text-5xl text-gray-300 mb-3"></i>
                      <p className="text-gray-500">अद्याप कोणतेही वापरकर्ते नाहीत</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-200 p-4 rounded-b-xl">
          <div className="text-xs text-gray-500 text-center">
            <i className="fas fa-info-circle mr-1"></i>
            शेवटचे अपडेट: {summary?.last_updated ? formatDate(summary.last_updated) : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
