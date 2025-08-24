import React, { useState } from 'react';

function Register({ onRegister, onBulkRegister }) {
    const [formData, setFormData] = useState({
        tcKimlik: '',
        ad: '',
        gender: 'male',
        league: ''
    });

    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    
    // Toplu ekleme için state'ler
    const [showBulkAdd, setShowBulkAdd] = useState(false);
    const [bulkData, setBulkData] = useState('');
    const [bulkErrors, setBulkErrors] = useState([]);
    const [bulkSuccessMessage, setBulkSuccessMessage] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
        
        // Hata mesajını temizle
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        // TC kimlik için anlık kontrol
        if (name === 'tcKimlik') {
            // Sadece rakam girişine izin ver
            if (value && !/^\d*$/.test(value)) {
                setFormData(prevState => ({
                    ...prevState,
                    [name]: value.replace(/\D/g, '')
                }));
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!formData.tcKimlik) {
            newErrors.tcKimlik = 'TC Kimlik Numarası zorunludur';
        } else if (!/^\d+$/.test(formData.tcKimlik)) {
            newErrors.tcKimlik = 'TC Kimlik Numarası sadece rakam içermelidir';
        }

        if (!formData.ad.trim()) {
            newErrors.ad = 'Ad zorunludur';
        }

        if (!formData.league.trim()) {
            newErrors.league = 'Lig bilgisi zorunludur';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            // TC kimlik numarası daha önce kullanılmış mı kontrol et
            const isDuplicate = window.registeredUsers && window.registeredUsers.some(user => 
                user.tcKimlik === formData.tcKimlik
            );

            if (isDuplicate) {
                setErrors({ tcKimlik: 'Bu TC Kimlik Numarası zaten kayıtlı!' });
                return;
            }

            setSuccessMessage('Kayıt başarıyla tamamlandı!');
            onRegister(formData); // Kayıt bilgisini üst komponente gönder
            
                            setFormData({
                    tcKimlik: '',
                    ad: '',
                    gender: 'male',
                    league: ''
                });

            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        }
    };

    // Toplu veri parse etme fonksiyonu
    const parseBulkData = (text) => {
        const lines = text.trim().split('\n').filter(line => line.trim());
        const participants = [];
        const parseErrors = [];

        lines.forEach((line, index) => {
            const lineNumber = index + 1;
            const parts = line.split('-');
            
            if (parts.length !== 4) {
                parseErrors.push(`Satır ${lineNumber}: Format hatası. Doğru format: "ID-Ad Soyad-Cinsiyet-Lig"`);
                return;
            }

            const [id, name, gender, league] = parts.map(part => part.trim());
            
            // TC Kimlik kontrol
            if (!id || !/^\d+$/.test(id)) {
                parseErrors.push(`Satır ${lineNumber}: TC Kimlik sadece rakam olmalıdır`);
                return;
            }

            // Ad kontrol
            if (!name) {
                parseErrors.push(`Satır ${lineNumber}: Ad boş olamaz`);
                return;
            }

            // Cinsiyet kontrol
            const normalizedGender = gender.toLowerCase();
            if (!['erkek', 'kadın', 'male', 'female'].includes(normalizedGender)) {
                parseErrors.push(`Satır ${lineNumber}: Cinsiyet "erkek" veya "kadın" olmalıdır`);
                return;
            }

            // Lig kontrol
            if (!league) {
                parseErrors.push(`Satır ${lineNumber}: Lig bilgisi boş olamaz`);
                return;
            }

            // TC Kimlik tekrar kontrolü
            const tcExists = participants.some(p => p.tcKimlik === id) || 
                            (window.registeredUsers && window.registeredUsers.some(user => user.tcKimlik === id));
            
            if (tcExists) {
                parseErrors.push(`Satır ${lineNumber}: TC Kimlik ${id} zaten kayıtlı veya listede tekrarlanıyor`);
                return;
            }

            // Cinsiyet dönüştürme
            const genderValue = normalizedGender === 'erkek' || normalizedGender === 'male' ? 'male' : 'female';

            participants.push({
                tcKimlik: id,
                ad: name,
                gender: genderValue,
                league: league.toLowerCase()
            });
        });

        return { participants, errors: parseErrors };
    };

    // Toplu ekleme submit fonksiyonu
    const handleBulkSubmit = (e) => {
        e.preventDefault();
        
        if (!bulkData.trim()) {
            setBulkErrors(['Lütfen katılımcı verilerini giriniz']);
            return;
        }

        const { participants, errors } = parseBulkData(bulkData);
        
        if (errors.length > 0) {
            setBulkErrors(errors);
            setBulkSuccessMessage('');
            return;
        }

        if (participants.length === 0) {
            setBulkErrors(['Geçerli katılımcı verisi bulunamadı']);
            return;
        }

        // Tüm katılımcıları toplu olarak ekle
        onBulkRegister(participants);

        setBulkSuccessMessage(`${participants.length} katılımcı başarıyla eklendi!`);
        setBulkData('');
        setBulkErrors([]);

        setTimeout(() => {
            setBulkSuccessMessage('');
            setShowBulkAdd(false);
        }, 3000);
    };

    return (
        <div className="register-container">
            <div className="register-header">
                <h2>Katılımcı Kayıt</h2>
                <div className="register-buttons">
                    <button 
                        type="button" 
                        className={`mode-btn ${!showBulkAdd ? 'active' : ''}`}
                        onClick={() => setShowBulkAdd(false)}
                    >
                        📝 Tekli Kayıt
                    </button>
                    <button 
                        type="button" 
                        className={`mode-btn ${showBulkAdd ? 'active' : ''}`}
                        onClick={() => setShowBulkAdd(true)}
                    >
                        📋 Toplu Kayıt
                    </button>
                </div>
            </div>

            {!showBulkAdd ? (
                // Tekli kayıt formu
                <>
                    {successMessage && <div className="success-message">{successMessage}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>TC Kimlik No:</label>
                            <input
                                type="text"
                                name="tcKimlik"
                                value={formData.tcKimlik}
                                onChange={handleInputChange}
                                placeholder="TC Kimlik No"
                            />
                            {errors.tcKimlik && <span className="error">{errors.tcKimlik}</span>}
                        </div>

                        <div className="form-group">
                            <label>Ad:</label>
                            <input
                                type="text"
                                name="ad"
                                value={formData.ad}
                                onChange={handleInputChange}
                            />
                            {errors.ad && <span className="error">{errors.ad}</span>}
                        </div>

                        <div className="form-group">
                            <label>Cinsiyet:</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                            >
                                <option value="male">Erkek</option>
                                <option value="female">Kadın</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Lig:</label>
                            <input
                                type="text"
                                name="league"
                                value={formData.league}
                                onChange={handleInputChange}
                                placeholder="örn: sarı, beyaz, kırmızı"
                            />
                            {errors.league && <span className="error">{errors.league}</span>}
                        </div>

                        <button type="submit">Kayıt Ol</button>
                    </form>
                </>
            ) : (
                // Toplu kayıt formu
                <>
                    <div className="bulk-info">
                        <h3>📋 Toplu Katılımcı Kayıt</h3>
                        <p className="bulk-description">
                            Her satıra bir katılımcı gelecek şekilde aşağıdaki formatı kullanın:
                        </p>
                        <div className="format-example">
                            <strong>Format:</strong> TC_Kimlik-Ad_Soyad-Cinsiyet-Lig
                            <br />
                            <strong>Örnek:</strong>
                            <br />
                            1-Mehmet Murat Yazıcı-erkek-sarı
                            <br />
                            2-Ahmet Yılmaz-erkek-sarı
                            <br />
                            3-Hasan Demir-erkek-beyaz
                            <br />
                            4-Ayşe Kaya-kadın-beyaz
                        </div>
                    </div>

                    {bulkSuccessMessage && <div className="success-message">{bulkSuccessMessage}</div>}
                    
                    {bulkErrors.length > 0 && (
                        <div className="bulk-errors">
                            <h4>❌ Hatalar:</h4>
                            <ul>
                                {bulkErrors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <form onSubmit={handleBulkSubmit}>
                        <div className="form-group">
                            <label>Katılımcı Verileri:</label>
                            <textarea
                                value={bulkData}
                                onChange={(e) => setBulkData(e.target.value)}
                                placeholder="12345678901-Mehmet Murat Yazıcı-erkek&#10;98765432109-Ayşe Fatma Kaya-kadın"
                                rows="10"
                                className="bulk-textarea"
                            />
                        </div>

                        <button type="submit" className="bulk-submit-btn">
                            📋 Toplu Kayıt Yap
                        </button>
                    </form>
                </>
            )}
        </div>
    );
}

export default Register;