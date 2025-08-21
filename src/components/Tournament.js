import React, { useState } from 'react';

function Tournament({ registeredUsers }) {
    const [showFixture, setShowFixture] = useState(false);
    const [fixtures, setFixtures] = useState([]);
    const [selectedGender, setSelectedGender] = useState('male');

    // Cinsiyet bazlı katılımcıları filtrele
    const maleUsers = registeredUsers.filter(user => user.gender === 'male');
    const femaleUsers = registeredUsers.filter(user => user.gender === 'female');

    const createFixture = () => {
        const selectedUsers = selectedGender === 'male' ? maleUsers : femaleUsers;
        
        if (selectedUsers.length < 2) {
            alert(`${selectedGender === 'male' ? 'Erkek' : 'Kadın'} kategorisinde fikstür oluşturmak için en az 2 kayıt gereklidir!`);
            return;
        }

        let players = [...selectedUsers];
        let matches = [];

        // Oyuncuları karıştır
        for (let i = players.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [players[i], players[j]] = [players[j], players[i]];
        }

        // Eşleştirmeleri oluştur
        for (let i = 0; i < players.length - 1; i += 2) {
            matches.push({
                player1: players[i],
                player2: players[i + 1]
            });
        }

        // Tek sayıda oyuncu varsa, son oyuncu bay geçer
        if (players.length % 2 !== 0) {
            matches.push({
                player1: players[players.length - 1],
                player2: { ad: 'BAY' }
            });
        }

        setFixtures(matches);
        setShowFixture(true);
    };

    return (
        <div className="tournament-container">
            <h3>Katılımcı Listesi</h3>
            
            <div className="gender-selector">
                <button 
                    className={`gender-btn ${selectedGender === 'male' ? 'active' : ''}`}
                    onClick={() => setSelectedGender('male')}
                >
                    👨 Erkek ({maleUsers.length})
                </button>
                <button 
                    className={`gender-btn ${selectedGender === 'female' ? 'active' : ''}`}
                    onClick={() => setSelectedGender('female')}
                >
                    👩 Kadın ({femaleUsers.length})
                </button>
            </div>

            <div className="participants-section">
                <h4>{selectedGender === 'male' ? 'Erkek' : 'Kadın'} Katılımcılar</h4>
                <div className="registered-users">
                    {(selectedGender === 'male' ? maleUsers : femaleUsers).map((user, index) => (
                        <div key={index} className="user-item">
                            <span className="user-name">{user.ad}</span>
                            <span className="user-tc">{user.tcKimlik}</span>
                        </div>
                    ))}
                    {(selectedGender === 'male' ? maleUsers : femaleUsers).length === 0 && (
                        <div className="no-participants">
                            Bu kategoride henüz katılımcı bulunmuyor.
                        </div>
                    )}
                </div>
            </div>

            <div className="fixture-section">
                {/* <button 
                    className="fixture-button"
                    onClick={createFixture}
                    disabled={(selectedGender === 'male' ? maleUsers : femaleUsers).length < 2}
                >
                    {selectedGender === 'male' ? 'Erkek' : 'Kadın'} Fikstürü Oluştur
                </button> */}

                {showFixture && (
                    <div className="fixture-popup">
                        <div className="fixture-content">
                            <h4>{selectedGender === 'male' ? 'Erkek' : 'Kadın'} Fikstürü</h4>
                            {fixtures.map((match, index) => (
                                <div key={index} className="match">
                                    {match.player1.ad} vs {match.player2.ad}
                                </div>
                            ))}
                            <button onClick={() => setShowFixture(false)}>Kapat</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Tournament;