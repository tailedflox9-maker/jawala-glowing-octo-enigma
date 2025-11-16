import React, { useState, useEffect } from 'react';

interface UserNamePopupProps {
  onSave: (name: string) => void;
}

const UserNamePopup: React.FC<UserNamePopupProps> = ({ onSave }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      setError('कृपया तुमचे नाव प्रविष्ट करा');
      return;
    }
    
    if (trimmedName.length < 2) {
      setError('नाव किमान २ अक्षरांचे असावे');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await onSave(trimmedName);
    } catch (err) {
      setError('काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.');
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onSave('अतिथी');
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fadeInUp backdrop-blur-sm" style={{ animationDuration: '0.3s' }}>
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fadeInUp" style={{ animationDelay: '0.1s' }} onClick={e => e.stopPropagation()}>
        {/* Welcome Icon */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-3">
            <span className="text-4xl">👋</span>
          </div>
          <h3 className="text-2xl font-bold text-primary mb-1">स्वागत आहे!</h3>
          <p className="text-text-secondary text-sm">जवळा व्यवसाय निर्देशिकेत</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="userName" className="block text-sm font-semibold text-text-primary mb-2">
              तुमचे नाव
            </label>
            <input
              id="userName"
              type="text"
              value={name}
              onChange={e => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="उदा. राज कुमार"
              className="w-full p-3 border-2 border-border-color rounded-xl bg-background focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              disabled={isSubmitting}
              autoFocus
              maxLength={50}
            />
            {error && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="space-y-2 pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] shadow-lg"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="fas fa-spinner fa-spin"></i>
                  प्रक्रिया करत आहे...
                </span>
              ) : (
                <span>सुरू करा</span>
              )}
            </button>
            
            <button
              type="button"
              onClick={handleSkip}
              disabled={isSubmitting}
              className="w-full bg-gray-200 hover:bg-gray-300 text-text-secondary font-semibold py-2.5 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              नंतर
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserNamePopup;
