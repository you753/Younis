import { useState } from 'react';
import logoAlmuhasebAlaathim from '@assets/ChatGPT Image 7 يوليو 2025، 02_26_11 م-Photoroom_1751895605009.png';

export default function DirectLogin() {
  const [username, setUsername] = useState('YOUNIS1234');
  const [password, setPassword] = useState('Aa123456');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('جاري تسجيل الدخول...');

    try {
      console.log('بدء تسجيل الدخول:', { username, password });
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim()
        }),
      });

      console.log('حالة الاستجابة:', response.status);

      if (response.ok) {
        const userData = await response.json();
        console.log('تم تسجيل الدخول بنجاح:', userData);
        setMessage('تم تسجيل الدخول بنجاح! جاري التحويل...');
        
        // تأكد من حفظ البيانات
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('user', JSON.stringify(userData));
        
        // انتظار ثانية واحدة ثم إعادة تحميل الصفحة
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'خطأ غير معروف' }));
        setMessage(`فشل تسجيل الدخول: ${errorData.message}`);
        console.error('خطأ في تسجيل الدخول:', errorData);
      }
    } catch (error) {
      console.error('خطأ في الشبكة:', error);
      setMessage('خطأ في الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  };

  // تجربة تسجيل دخول تلقائي
  const handleAutoLogin = async () => {
    setMessage('جاري تسجيل الدخول التلقائي...');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: 'YOUNIS1234',
          password: 'Aa123456'
        }),
      });

      if (response.ok) {
        const userData = await response.json();
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('user', JSON.stringify(userData));
        setMessage('تم تسجيل الدخول! جاري التحويل...');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setMessage('فشل تسجيل الدخول التلقائي');
      }
    } catch (error) {
      setMessage('خطأ في تسجيل الدخول التلقائي');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        padding: '30px'
      }}>
        {/* الشعار */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ 
            position: 'relative', 
            display: 'inline-block', 
            marginBottom: '15px' 
          }}>
            <div style={{
              position: 'absolute',
              inset: '-15px',
              border: '4px solid #d97706',
              borderRadius: '20px',
              transform: 'rotate(45deg)',
              opacity: 0.8
            }}></div>
            <div style={{
              position: 'relative',
              background: '#000',
              borderRadius: '12px',
              padding: '12px',
              width: '80px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src={logoAlmuhasebAlaathim} 
                alt="المحاسب الأعظم"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
          </div>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: '#1f2937',
            marginBottom: '8px'
          }}>المحاسب الأعظم</h1>
          <p style={{ color: '#6b7280' }}>نظام محاسبي متكامل للشركات</p>
        </div>

        {/* النموذج */}
        <form onSubmit={handleLogin} style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '500',
              color: '#374151'
            }}>
              اسم المستخدم
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="أدخل اسم المستخدم"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '500',
              color: '#374151'
            }}>
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="أدخل كلمة المرور"
            />
          </div>

          {message && (
            <div style={{
              padding: '12px',
              marginBottom: '20px',
              backgroundColor: message.includes('بنجاح') ? '#d1fae5' : '#fef2f2',
              color: message.includes('بنجاح') ? '#065f46' : '#991b1b',
              borderRadius: '6px',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              background: isLoading ? '#9ca3af' : 'linear-gradient(90deg, #d97706, #eab308)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginBottom: '10px'
            }}
          >
            {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>

        {/* زر تسجيل دخول تلقائي */}
        <button
          onClick={handleAutoLogin}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '10px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          تسجيل دخول تلقائي (YOUNIS1234)
        </button>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#6b7280' }}>
          <p>© 2025 المحاسب الأعظم. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </div>
  );
}