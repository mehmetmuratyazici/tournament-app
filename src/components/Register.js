import React, { useState } from 'react';

function Register({ onRegister }) {
    const [formData, setFormData] = useState({
        tcKimlik: '',
        ad: '',
        gender: 'male'
    });

    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

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
                gender: 'male'
            });

            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        }
    };

    return (
        <div className="register-container">
            <h2>Kayıt Formu</h2>
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

                <button type="submit">Kayıt Ol</button>
            </form>
        </div>
    );
}

export default Register;