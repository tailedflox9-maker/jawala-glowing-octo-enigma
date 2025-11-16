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
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ onClose, onBack }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [users, setUsers] = useState<UserTrackingData[]>([]);
  const [recentVisits, setRecentVisits] = useState<VisitLog[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'visits'>('overview');

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
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-surface rounded-xl p-8 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-t-primary border-gray-200 rounded-full animate-spin"></div>
          <p className="text-text-secondary">माहिती लोड करत आहे...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-surface rounded-xl shadow-2xl w-full max-w-5xl my-8 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <header className="p-6 border-b border-border-color flex justify-between items-center sticky top-0 bg-surface/95 backdrop-blur-sm rounded-t-xl z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack} 
              className="text-text-secondary hover:text-primary transition-colors"
            >
              <i className="fas fa-arrow-left text-xl"></i>
            </button>
            <div>
              <h3 className="font-poppins text-2xl font-bold text-primary flex items-center gap-2">
                <i className="fas fa-chart-line"></i>
                अँनालिटिक्स डॅशबोर्ड
              </h3>
              <p className="text-sm text-text-secondary mt-1">वापरकर्ता आणि भेटी ट्रॅकिंग</p>
            </div>
          </div>
          <button 
            onClick={loadAnalytics}
            className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-2"
          >
            <i className="fas fa-sync-alt"></i>
            <span className="hidden sm:inline">रिफ्रेश</span>
          </button>
        </header>

        {/* Summary Cards */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-xl border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <i className="fas fa-users text-3xl text-primary"></i>
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">एकूण</span>
            </div>
            <p className="text-4xl font-bold text-primary mb-1">{summary?.total_unique_users || 0}</p>
            <p className="text-sm text-text-secondary">युनिक वापरकर्ते</p>
          </div>

          <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 p-6 rounded-xl border border-secondary/20">
            <div className="flex items-center justify-between mb-2">
              <i className="fas fa-eye text-3xl text-secondary"></i>
              <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded-full">एकूण</span>
            </div>
            <p className="text-4xl font-bold text-secondary mb-1">{summary?.total_visits || 0}</p>
            <p className="text-sm text-text-secondary">एकूण भेटी</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <i className="fas fa-chart-line text-3xl text-blue-600"></i>
              <span className="text-xs bg-blue-200 text-blue-700 px-2 py-1 rounded-full">सरासरी</span>
            </div>
            <p className="text-4xl font-bold text-blue-600 mb-1">
              {summary && summary.total_unique_users > 0 
                ? Math.round(summary.total_visits / summary.total_unique_users * 10) / 10
                : 0}
            </p>
            <p className="text-sm text-blue-700">प्रति वापरकर्ता भेटी</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-border-color">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 font-semibold rounded-t-lg transition-colors ${
                activeTab === 'overview'
                  ? 'bg-primary text-white'
                  : 'text-text-secondary hover:bg-gray-100'
              }`}
            >
              <i className="fas fa-chart-pie mr-2"></i>
              विहंगावलोकन
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 font-semibold rounded-t-lg transition-colors ${
                activeTab === 'users'
                  ? 'bg-primary text-white'
                  : 'text-text-secondary hover:bg-gray-100'
              }`}
            >
              <i className="fas fa-users mr-2"></i>
              वापरकर्ते ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('visits')}
              className={`px-6 py-3 font-semibold rounded-t-lg transition-colors ${
                activeTab === 'visits'
                  ? 'bg-primary text-white'
                  : 'text-text-secondary hover:bg-gray-100'
              }`}
            >
              <i className="fas fa-clock mr-2"></i>
              अलीकडील भेटी
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Users */}
                <div className="bg-background rounded-lg p-6">
                  <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <i className="fas fa-trophy text-yellow-500"></i>
                    सर्वाधिक सक्रिय वापरकर्ते
                  </h4>
                  <div className="space-y-3">
                    {users
                      .slice()
                      .sort((a, b) => (b.total_visits || 0) - (a.total_visits || 0))
                      .slice(0, 5)
                      .map((user, index) => (
                        <div key={user.id} className="flex items-center justify-between p-3 bg-surface rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className={`text-xl ${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📍'}`}>
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📍'}
                            </span>
                            <div>
                              <p className="font-semibold">{user.user_name}</p>
                              <p className="text-xs text-text-secondary">
                                शेवटची भेट: {formatRelativeTime(user.last_visit_at || '')}
                              </p>
                            </div>
                          </div>
                          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">
                            {user.total_visits} भेटी
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-background rounded-lg p-6">
                  <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <i className="fas fa-clock text-secondary"></i>
                    अलीकडील क्रियाकलाप
                  </h4>
                  <div className="space-y-3">
                    {recentVisits.slice(0, 5).map((visit, index) => (
                      <div key={visit.id} className="flex items-start gap-3 p-3 bg-surface rounded-lg">
                        <i className="fas fa-circle text-xs text-secondary mt-1.5"></i>
                        <div className="flex-1">
                          <p className="font-semibold">{visit.user_name || 'अतिथी'}</p>
                          <p className="text-xs text-text-secondary">
                            {formatRelativeTime(visit.visited_at || '')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-3">
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 mb-4">
                <p className="text-sm text-text-secondary flex items-center gap-2">
                  <i className="fas fa-info-circle text-primary"></i>
                  सर्व नोंदणीकृत वापरकर्त्यांची यादी
                </p>
              </div>
              {users.map(user => (
                <div key={user.id} className="bg-background p-4 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <i className="fas fa-user text-primary"></i>
                      </div>
                      <div>
                        <p className="font-bold text-lg">{user.user_name}</p>
                        <div className="text-sm text-text-secondary space-y-1 mt-1">
                          <p className="flex items-center gap-2">
                            <i className="fas fa-calendar-plus w-4"></i>
                            पहिली भेट: {formatDate(user.first_visit_at || '')}
                          </p>
                          <p className="flex items-center gap-2">
                            <i className="fas fa-clock w-4"></i>
                            शेवटची भेट: {formatRelativeTime(user.last_visit_at || '')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="bg-primary text-white px-4 py-2 rounded-lg font-bold">
                        {user.total_visits}
                      </div>
                      <p className="text-xs text-text-secondary mt-1">भेटी</p>
                    </div>
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <div className="text-center py-12">
                  <span className="text-6xl mb-4 block">📊</span>
                  <p className="text-text-secondary">अद्याप कोणतेही वापरकर्ते नाहीत</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'visits' && (
            <div className="space-y-2">
              <div className="bg-secondary/5 p-4 rounded-lg border border-secondary/20 mb-4">
                <p className="text-sm text-text-secondary flex items-center gap-2">
                  <i className="fas fa-info-circle text-secondary"></i>
                  अलीकडील {recentVisits.length} भेटींचा इतिहास
                </p>
              </div>
              {recentVisits.map((visit, index) => (
                <div key={visit.id} className="bg-background p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs bg-gray-200 text-text-secondary px-2 py-1 rounded">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-semibold">{visit.user_name || 'अतिथी'}</p>
                        <p className="text-xs text-text-secondary">
                          {visit.page_path || '/'}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-text-secondary">
                      {formatRelativeTime(visit.visited_at || '')}
                    </p>
                  </div>
                </div>
              ))}
              {recentVisits.length === 0 && (
                <div className="text-center py-12">
                  <span className="text-6xl mb-4 block">🕐</span>
                  <p className="text-text-secondary">अद्याप कोणतीही भेट नाही</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="p-4 border-t border-border-color text-center sticky bottom-0 bg-surface/95 backdrop-blur-sm rounded-b-xl">
          <p className="text-xs text-text-secondary">
            शेवटचे अपडेट: {summary?.last_updated ? formatDate(summary.last_updated) : 'N/A'}
          </p>
        </footer>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
