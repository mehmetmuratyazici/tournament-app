import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

function AdminDashboard({ registeredUsers, onDeleteUser, onUpdateUser }) {
    // Admin authentication state
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const [adminPassword, setAdminPassword] = useState('');
    const [showPasswordModal, setShowPasswordModal] = useState(true);
    
    // Player swap state
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [swapMode, setSwapMode] = useState(false);
    
    // Court assignment state
    const [courtAssignmentMode, setCourtAssignmentMode] = useState(false);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('18:00');
    const [showCourtSchedule, setShowCourtSchedule] = useState(false);
    const [courtSchedule, setCourtSchedule] = useState(() => {
        const saved = localStorage.getItem('courtSchedule');
        return saved ? JSON.parse(saved) : {};
    });
    const [matchSwapMode, setMatchSwapMode] = useState(false);
    const [selectedMatchForSwap, setSelectedMatchForSwap] = useState(null);
    const [collapsedTimeSlots, setCollapsedTimeSlots] = useState(() => {
        const saved = localStorage.getItem('collapsedTimeSlots');
        return saved ? JSON.parse(saved) : {};
    });
    
    // Date-based planning state
    const [showDatePlanning, setShowDatePlanning] = useState(false);
    const [showDateSchedule, setShowDateSchedule] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [weekdayStartTime, setWeekdayStartTime] = useState('18:00');
    const [weekdayEndTime, setWeekdayEndTime] = useState('22:00');
    const [weekendStartTime, setWeekendStartTime] = useState('09:00');
    const [weekendEndTime, setWeekendEndTime] = useState('18:00');
    const [dateBasedSchedule, setDateBasedSchedule] = useState(() => {
        const saved = localStorage.getItem('dateBasedSchedule');
        return saved ? JSON.parse(saved) : {};
    });
    
    // Kort bilgileri - 4 kort
    const courts = [
        { id: 1, name: 'Kort 1' },
        { id: 2, name: 'Kort 2' },
        { id: 3, name: 'Kort 3' },
        { id: 4, name: 'Kort 4' }
    ];
    
    // Admin password hash - in a real app this would be stored securely
    const ADMIN_PASSWORD_HASH = '5ebe655f'; // Huseyin61

    // Check if admin is already authenticated
    useEffect(() => {
        const authStatus = localStorage.getItem('adminAuthenticated');
        if (authStatus === 'true') {
            setIsAdminAuthenticated(true);
            setShowPasswordModal(false);
        }
    }, []);

    // Hash function for password
    const hashPassword = (password) => {
        // Simple hash implementation (not cryptographically secure, but better than plain text)
        let hash = 0;
        if (password.length === 0) return hash.toString(16);
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        // Add some salt-like behavior
        const salt = 'admin_salt_2024';
        let saltedHash = hash;
        for (let i = 0; i < salt.length; i++) {
            const char = salt.charCodeAt(i);
            saltedHash = ((saltedHash << 5) - saltedHash) + char;
            saltedHash = saltedHash & saltedHash;
        }
        return saltedHash.toString(16);
    };

    // Handle admin authentication
    const handleAdminLogin = () => {
        const hashedInput = hashPassword(adminPassword);
        
        if (hashedInput === ADMIN_PASSWORD_HASH) {
            setIsAdminAuthenticated(true);
            setShowPasswordModal(false);
            localStorage.setItem('adminAuthenticated', 'true');
            setAdminPassword('');
        } else {
            alert('Yanlış şifre! Sadece görüntüleme modunda çalışacaksınız.');
            setShowPasswordModal(false);
            setAdminPassword('');
        }
    };

    // Handle admin logout
    const handleAdminLogout = () => {
        setIsAdminAuthenticated(false);
        localStorage.removeItem('adminAuthenticated');
        setShowPasswordModal(true);
    };

    const [tournaments, setTournaments] = useState(() => {
        // Local storage'dan turnuva verilerini yükle (initial state olarak)
        const savedTournaments = localStorage.getItem('tournaments');
        return savedTournaments ? JSON.parse(savedTournaments) : {
            male: { 
                groups: [], 
                eliminationRounds: [], 
                competitionRounds: [],
                currentRound: 1, 
                isActive: false,
                phase: 'groups',
                champion: null,
                runnerUp: null,
                competitionChampion: null,
                competitionRunnerUp: null,
                mainTournamentCompleted: false,
                competitionCompleted: false,
                isCompleted: false
            },
            female: { 
                groups: [], 
                eliminationRounds: [], 
                competitionRounds: [],
                currentRound: 1, 
                isActive: false,
                phase: 'groups',
                champion: null,
                runnerUp: null,
                competitionChampion: null,
                competitionRunnerUp: null,
                mainTournamentCompleted: false,
                competitionCompleted: false,
                isCompleted: false
            }
        };
    });

    // Local storage'a turnuva verilerini kaydet
    useEffect(() => {
        localStorage.setItem('tournaments', JSON.stringify(tournaments));
    }, [tournaments]);

    // Court schedule'ı localStorage'a kaydet
    useEffect(() => {
        if (Object.keys(courtSchedule).length > 0) {
            localStorage.setItem('courtSchedule', JSON.stringify(courtSchedule));
        }
    }, [courtSchedule]);

    // Collapsed time slots'ı localStorage'a kaydet
    useEffect(() => {
        localStorage.setItem('collapsedTimeSlots', JSON.stringify(collapsedTimeSlots));
    }, [collapsedTimeSlots]);

    // Date-based schedule'ı localStorage'a kaydet
    useEffect(() => {
        if (Object.keys(dateBasedSchedule).length > 0) {
            localStorage.setItem('dateBasedSchedule', JSON.stringify(dateBasedSchedule));
        }
    }, [dateBasedSchedule]);

    // Sayfa yüklendiğinde court schedule varsa göster
    useEffect(() => {
        if (Object.keys(courtSchedule).length > 0) {
            setShowCourtSchedule(true);
        }
    }, []);

    const [selectedGender, setSelectedGender] = useState('male');
    const [groupSize, setGroupSize] = useState(4);
    const [showCreateTournament, setShowCreateTournament] = useState(false);

    // Turnuva oluştur
    const createTournament = () => {
        if (registeredUsers.length < 3) {
            alert('En az 3 katılımcı gereklidir!');
            return;
        }

        const genderUsers = registeredUsers.filter(user => user.gender === selectedGender);
        
        if (genderUsers.length < 3) {
            alert(`${selectedGender === 'male' ? 'Erkek' : 'Kadın'} kategorisinde en az 3 katılımcı gereklidir!`);
            return;
        }

        // Akıllı grup oluşturma
        const shuffledUsers = [...genderUsers].sort(() => Math.random() - 0.5);
        const groups = createSmartGroups(shuffledUsers, groupSize);

        setTournaments(prev => ({
            ...prev,
            [selectedGender]: {
                ...prev[selectedGender],
                groups,
                currentRound: 1,
                isActive: true,
                phase: 'groups'
            }
        }));

        setShowCreateTournament(false);
    };

    // Akıllı grup oluşturma fonksiyonu - Kurallara uygun
    const createSmartGroups = (players, maxPlayersPerGroup) => {
        const totalParticipants = players.length;
        const minGroupSize = 3;
        
        // Grup boyutlarını hesapla - Basit ve doğru
        function calculateGroupSizes(totalParticipants, maxGroupSize) {
            // Özel durumlar
            if (totalParticipants <= maxGroupSize && totalParticipants >= 3) {
                return [totalParticipants];
            }
            if (totalParticipants < 3) {
                return [totalParticipants];
            }
            
            // Tüm mümkün kombinasyonları dene ve en iyisini seç
            // En iyi = en çok max boyutlu grup
            let bestResult = [];
            let maxMaxGroups = 0;
            
            // Kaç tane max grup olabileceğini dene (0'dan max'a kadar)
            let maxPossibleGroups = Math.floor(totalParticipants / maxGroupSize);
            
            for (let maxGroups = maxPossibleGroups; maxGroups >= 0; maxGroups--) {
                let remaining = totalParticipants - (maxGroups * maxGroupSize);
                
                // Kalanı minimum 3'lü gruplarla bölebiliyor muyuz?
                if (canDivideRemaining(remaining, maxGroupSize)) {
                    let result = []; 
                    
                    // Max grupları ekle
                    for (let i = 0; i < maxGroups; i++) {
                        result.push(maxGroupSize);
                    }
                    
                    // Kalanı böl
                    let remainingGroups = divideRemaining(remaining, maxGroupSize);
                    result = result.concat(remainingGroups);
                    
                    // Bu sonuç daha iyi mi?
                    if (maxGroups > maxMaxGroups) {
                        maxMaxGroups = maxGroups;
                        bestResult = result;
                    }
                    
                    break; // İlk geçerli sonucu al (en çok max grup olan)
                }
            }
            
            return bestResult.length > 0 ? bestResult : [totalParticipants];
        };
        
        // Kalanı bölebiliyor muyuz kontrol et
        function canDivideRemaining(remaining, maxGroupSize) {
            if (remaining === 0) return true;
            if (remaining < 3) return false; // Min grup boyutu
            if (remaining <= maxGroupSize) return true;
            
            // Recursive kontrol
            for (let groupSize = 3; groupSize <= Math.min(remaining, maxGroupSize); groupSize++) {
                if (canDivideRemaining(remaining - groupSize, maxGroupSize)) {
                    return true;
                }
            }
            return false;
        }
        
        // Kalanı böl
        function divideRemaining(remaining, maxGroupSize) {
            if (remaining === 0) return [];
            if (remaining <= maxGroupSize) return [remaining];
            
            // En büyük mümkün gruptan başla
            for (let groupSize = Math.min(remaining, maxGroupSize); groupSize >= 3; groupSize--) {
                let nextRemaining = remaining - groupSize;
                if (canDivideRemaining(nextRemaining, maxGroupSize)) {
                    return [groupSize].concat(divideRemaining(nextRemaining, maxGroupSize));
                }
            }
            
            return [remaining]; // Son çare
        }

        
        // Grup boyutlarını al
        const groupSizes = calculateGroupSizes(totalParticipants, maxPlayersPerGroup);
        
        if (groupSizes.length === 0) {
            return [];
        }
        
        // Grup objelerini oluştur
        let groups = [];
        let playerIndex = 0;
        
        for (let i = 0; i < groupSizes.length; i++) {
            const groupSize = groupSizes[i];
            const groupPlayers = players.slice(playerIndex, playerIndex + groupSize);
            
            groups.push({
                id: i + 1,
                players: groupPlayers,
                matches: createGroupMatches(groupPlayers),
                standings: calculateStandings(groupPlayers, [])
            });
            
            playerIndex += groupSize;
        }

        return groups;
    };

    // Grup maçlarını oluştur
    const createGroupMatches = (players) => {
        const matches = [];
        for (let i = 0; i < players.length; i++) {
            for (let j = i + 1; j < players.length; j++) {
                matches.push({
                    id: `${i}-${j}`,
                    player1: players[i],
                    player2: players[j],
                    player1Score: null,
                    player2Score: null,
                    winner: null,
                    isPlayed: false
                });
                }
            }
        return matches;
    };

    // Puan durumu hesapla
    const calculateStandings = (players, matches) => {
        const standings = players.map(player => ({
            player,
            played: 0,
            won: 0,
            lost: 0,
            points: 0
        }));

        matches.forEach(match => {
            if (match.isPlayed && match.winner) {
                const winnerIndex = standings.findIndex(s => s.player.tcKimlik === match.winner.tcKimlik);
                const loserIndex = standings.findIndex(s => 
                    s.player.tcKimlik === (match.winner.tcKimlik === match.player1.tcKimlik ? match.player2.tcKimlik : match.player1.tcKimlik)
                );

                if (winnerIndex !== -1 && loserIndex !== -1) {
                    standings[winnerIndex].played++;
                    standings[winnerIndex].won++;
                    standings[winnerIndex].points += 3;
                    standings[loserIndex].played++;
                    standings[loserIndex].lost++;
                }
            }
        });

        return standings.sort((a, b) => b.points - a.points || b.won - a.won);
    };

    // Maç sonucu güncelle
    const updateMatchResult = (groupId, matchId, player1Score, player2Score) => {
        
        setTournaments(prev => {
            const newTournaments = { ...prev };
            const tournament = newTournaments[selectedGender];
            if (groupId === 'competition') {
                // Competition maçları için
                console.log('Competition maç güncelleniyor:', { matchId, player1Score, player2Score });
                
                // Competition rounds'u tamamen yeniden oluştur
                const updatedCompetitionRounds = tournament.competitionRounds.map(round => 
                    round.map(match => {
                        if (match.id === matchId) {
                            const updatedMatch = {
                                ...match,
                                player1Score: parseInt(player1Score),
                                player2Score: parseInt(player2Score),
                                winner: player1Score > player2Score ? match.player1 : match.player2,
                                isPlayed: true
                            };
                            console.log('Maç güncellendi:', updatedMatch);
                            return updatedMatch;
                        }
                        return match;
                    })
                );
                
                // State'i güncelle - tüm tournament'ı yeniden oluştur
                newTournaments[selectedGender] = {
                    ...tournament,
                    competitionRounds: updatedCompetitionRounds
                };
                console.log('Competition rounds güncellendi!');
            } else if (tournament.phase === 'groups') {
                const group = tournament.groups.find(g => g.id === groupId);
                if (group) {
                    const match = group.matches.find(m => m.id === matchId);
                    if (match) {
                        match.player1Score = parseInt(player1Score);
                        match.player2Score = parseInt(player2Score);
                        match.winner = player1Score > player2Score ? match.player1 : match.player2;
                        match.isPlayed = true;

                        // Puan durumunu güncelle
                        group.standings = calculateStandings(group.players, group.matches);
                    }
                }
            } else if (tournament.phase === 'elimination') {
                const currentRound = tournament.eliminationRounds[tournament.currentRound - 1];
                if (currentRound) {
                    const match = currentRound.find(m => m.id === matchId);
                    if (match) {
                        match.player1Score = parseInt(player1Score);
                        match.player2Score = parseInt(player2Score);
                        match.winner = player1Score > player2Score ? match.player1 : match.player2;
                        match.isPlayed = true;
                    }
                }
            } else if (groupId === 'competition') {
                // Competition maçları için
                console.log('Competition maç güncelleniyor:', { matchId, player1Score, player2Score });
                
                // Competition rounds'u tamamen yeniden oluştur
                const updatedCompetitionRounds = tournament.competitionRounds.map(round => 
                    round.map(match => {
                        if (match.id === matchId) {
                            const updatedMatch = {
                                ...match,
                                player1Score: parseInt(player1Score),
                                player2Score: parseInt(player2Score),
                                winner: player1Score > player2Score ? match.player1 : match.player2,
                                isPlayed: true
                            };
                            console.log('Maç güncellendi:', updatedMatch);
                            return updatedMatch;
                        }
                        return match;
                    })
                );
                
                // State'i güncelle - tüm tournament'ı yeniden oluştur
                newTournaments[selectedGender] = {
                    ...tournament,
                    competitionRounds: updatedCompetitionRounds
                };
                console.log('Competition rounds güncellendi!');
            }

            return newTournaments;
        });
    };

    // Grup aşaması bitince eleme turuna geç
    const startEliminationPhase = () => {
        const tournament = tournaments[selectedGender];
        const qualifiedPlayers = tournament.groups.flatMap(group => 
            group.standings.slice(0, 2).map(s => s.player)
        );
        
        // Elenen oyuncular (grup aşamasından)
        const eliminatedPlayers = tournament.groups.flatMap(group => 
            group.standings.slice(2).map(s => s.player)
        );

        if (qualifiedPlayers.length < 2) {
            alert('Eleme turu için yeterli oyuncu yok!');
            return;
        }

        // Eleme turu maçlarını oluştur
        const eliminationMatches = [];
        for (let i = 0; i < qualifiedPlayers.length; i += 2) {
            if (i + 1 < qualifiedPlayers.length) {
                eliminationMatches.push({
                    id: `elim-${i}`,
                    player1: qualifiedPlayers[i],
                    player2: qualifiedPlayers[i + 1],
                    player1Score: null,
                    player2Score: null,
                    winner: null,
                    isPlayed: false
                });
            } else {
                // Tek kalan oyuncu varsa, bir sonraki tura geçir
                eliminationMatches.push({
                    id: `elim-${i}`,
                    player1: qualifiedPlayers[i],
                    player2: null,
                    player1Score: null,
                    player2Score: null,
                    winner: qualifiedPlayers[i],
                    isPlayed: true
                });
            }
        }

        // Competition turu maçlarını oluştur (elenenler için)
        let competitionMatches = [];
        if (eliminatedPlayers.length >= 2) {
            for (let i = 0; i < eliminatedPlayers.length; i += 2) {
                if (i + 1 < eliminatedPlayers.length) {
                    competitionMatches.push({
                        id: `comp-${i}`,
                        player1: eliminatedPlayers[i],
                        player2: eliminatedPlayers[i + 1],
                        player1Score: null,
                        player2Score: null,
                        winner: null,
                        isPlayed: false
                    });
                } else {
                    // Tek kalan oyuncu varsa, bir sonraki tura geçir
                    competitionMatches.push({
                        id: `comp-${i}`,
                        player1: eliminatedPlayers[i],
                        player2: null,
                        player1Score: null,
                        player2Score: null,
                        winner: eliminatedPlayers[i],
                        isPlayed: true
                    });
                }
            }
        }

        setTournaments(prev => ({
            ...prev,
            [selectedGender]: {
                ...prev[selectedGender],
                phase: 'elimination',
                eliminationRounds: [eliminationMatches],
                competitionRounds: competitionMatches.length > 0 ? [competitionMatches] : [],
                currentRound: 1
            }
        }));
    };

    // Sonraki eleme turu için fikstür oluştur
    const createNextEliminationRound = () => {
        const tournament = tournaments[selectedGender];
        const currentRound = tournament.eliminationRounds[tournament.currentRound - 1];
        const winners = currentRound
            .filter(match => match.isPlayed && match.winner)
            .map(match => match.winner);

        if (winners.length < 2) {
            // Ana turnuva tamamlandı, birinci ve ikinci belirlendi
            const champion = winners[0];
            
            // Runner up için son turda oynanan maçlarda şampiyon olmayan oyuncuları bul
            const lastRound = tournament.eliminationRounds[tournament.currentRound - 1];
            let runnerUp = null;
            
            // Debug için tüm son tur maçlarını logla
            console.log('Son Tur Maçları:', lastRound.map(match => ({
                id: match.id,
                player1: match.player1?.ad,
                player2: match.player2?.ad,
                winner: match.winner?.ad,
                isPlayed: match.isPlayed
            })));
            
            // Son turda oynanan tüm maçları kontrol et ve şampiyon olmayan oyuncuları bul
            const potentialRunnerUps = [];
            for (const match of lastRound) {
                if (match.isPlayed && match.player1 && match.player2) {
                    if (match.winner === champion) {
                        // Bu maçta şampiyon kazandı, diğer oyuncu potansiyel runner up
                        const otherPlayer = match.player1 === champion ? match.player2 : match.player1;
                        potentialRunnerUps.push(otherPlayer);
                        console.log('Potansiyel Runner Up Bulundu:', otherPlayer?.ad);
                    }
                } else {
                    console.log('Maç atlandı:', {
                        isPlayed: match.isPlayed,
                        hasPlayer1: !!match.player1,
                        hasPlayer2: !!match.player2
                    });
                }
            }
            
            // İlk bulunan oyuncuyu runner up yap
            if (potentialRunnerUps.length > 0) {
                runnerUp = potentialRunnerUps[0];
            }
            
            // Debug için log
            console.log('Ana Turnuva Runner Up Hesaplama:', {
                champion: champion?.ad,
                potentialRunnerUps: potentialRunnerUps.map(p => p?.ad),
                selectedRunnerUp: runnerUp?.ad,
                lastRoundLength: lastRound.length
            });
            
            // Competition devam ediyor mu kontrol et
            const hasActiveCompetition = tournament.competitionRounds && 
                tournament.competitionRounds.length > 0 && 
                !tournament.competitionCompleted;
            
            setTournaments(prev => ({
                ...prev,
                [selectedGender]: {
                    ...prev[selectedGender],
                    mainTournamentCompleted: true,
                    champion: champion,
                    runnerUp: runnerUp,
                    // Competition devam ediyorsa turnuvayı aktif tut
                    isActive: hasActiveCompetition
                }
            }));
            return;
        }

        // Yeni eleme turu maçları oluştur
        const newEliminationMatches = [];
        for (let i = 0; i < winners.length; i += 2) {
            if (i + 1 < winners.length) {
                newEliminationMatches.push({
                    id: `elim-${tournament.currentRound}-${i}`,
                    player1: winners[i],
                    player2: winners[i + 1],
                    player1Score: null,
                    player2Score: null,
                    winner: null,
                    isPlayed: false
                });
            } else {
                // Tek kalan oyuncu varsa, bir sonraki tura geçir
                newEliminationMatches.push({
                    id: `elim-${tournament.currentRound}-${i}`,
                    player1: winners[i],
                    player2: null,
                    player1Score: null,
                    player2Score: null,
                    winner: winners[i],
                    isPlayed: true
                });
            }
        }

        setTournaments(prev => ({
            ...prev,
            [selectedGender]: {
                ...prev[selectedGender],
                eliminationRounds: [...prev[selectedGender].eliminationRounds, newEliminationMatches],
                currentRound: prev[selectedGender].currentRound + 1
            }
        }));
    };

    // Sonraki competition turu için fikstür oluştur
    const createNextCompetitionRound = () => {
        const tournament = tournaments[selectedGender];
        const currentRound = tournament.competitionRounds[tournament.competitionRounds.length - 1];
        const winners = currentRound
            .filter(match => match.isPlayed && match.winner)
            .map(match => match.winner);

        if (winners.length < 2) {
            // Competition tamamlandı, birinci ve ikinci belirlendi
            const competitionChampion = winners[0];
            
            // Competition runner up için son turda oynanan maçlarda şampiyon olmayan oyuncuları bul
            const lastCompetitionRound = tournament.competitionRounds[tournament.competitionRounds.length - 1];
            let competitionRunnerUp = null;
            
            // Debug için tüm son competition turu maçlarını logla
            console.log('Son Competition Turu Maçları:', lastCompetitionRound.map(match => ({
                id: match.id,
                player1: match.player1?.ad,
                player2: match.player2?.ad,
                winner: match.winner?.ad,
                isPlayed: match.isPlayed
            })));
            
            // Son turda oynanan tüm maçları kontrol et ve şampiyon olmayan oyuncuları bul
            const potentialCompetitionRunnerUps = [];
            for (const match of lastCompetitionRound) {
                if (match.isPlayed && match.player1 && match.player2) {
                    if (match.winner === competitionChampion) {
                        // Bu maçta şampiyon kazandı, diğer oyuncu potansiyel runner up
                        const otherPlayer = match.player1 === competitionChampion ? match.player2 : match.player1;
                        potentialCompetitionRunnerUps.push(otherPlayer);
                        console.log('Potansiyel Competition Runner Up Bulundu:', otherPlayer?.ad);
                    }
                } else {
                    console.log('Competition Maç atlandı:', {
                        isPlayed: match.isPlayed,
                        hasPlayer1: !!match.player1,
                        hasPlayer2: !!match.player2
                    });
                }
            }
            
            // İlk bulunan oyuncuyu runner up yap
            if (potentialCompetitionRunnerUps.length > 0) {
                competitionRunnerUp = potentialCompetitionRunnerUps[0];
            }
            
            // Debug için log
            console.log('Competition Runner Up Hesaplama:', {
                competitionChampion: competitionChampion?.ad,
                potentialCompetitionRunnerUps: potentialCompetitionRunnerUps.map(p => p?.ad),
                selectedCompetitionRunnerUp: competitionRunnerUp?.ad,
                lastCompetitionRoundLength: lastCompetitionRound.length
            });
            
            setTournaments(prev => ({
                ...prev,
                [selectedGender]: {
                    ...prev[selectedGender],
                    competitionCompleted: true,
                    competitionChampion: competitionChampion,
                    competitionRunnerUp: competitionRunnerUp
                }
            }));
            return;
        }

        // Yeni competition turu maçları oluştur
        const newCompetitionMatches = [];
        for (let i = 0; i < winners.length; i += 2) {
            if (i + 1 < winners.length) {
                newCompetitionMatches.push({
                    id: `comp-${tournament.competitionRounds.length}-${i}`,
                    player1: winners[i],
                    player2: winners[i + 1],
                    player1Score: null,
                    player2Score: null,
                    winner: null,
                    isPlayed: false
                });
            } else {
                // Tek kalan oyuncu varsa, bir sonraki tura geçir
                newCompetitionMatches.push({
                    id: `comp-${tournament.competitionRounds.length}-${i}`,
                    player1: winners[i],
                    player2: null,
                    player1Score: null,
                    player2Score: null,
                    winner: winners[i],
                    isPlayed: true
                });
            }
        }

        setTournaments(prev => ({
            ...prev,
            [selectedGender]: {
                ...prev[selectedGender],
                competitionRounds: [...prev[selectedGender].competitionRounds, newCompetitionMatches]
            }
        }));
    };

    // Oyuncu değiştirme fonksiyonu
    const swapPlayers = (player1, player2, group1Id, group2Id) => {
        if (!isAdminAuthenticated) {
            alert('Bu işlem için admin yetkisi gereklidir!');
            return;
        }

        // Maçlar oynanmış mı kontrol et
        const tournament = tournaments[selectedGender];
        const hasPlayedMatches = tournament.groups.some(group => 
            group.matches.some(match => match.isPlayed)
        );

        if (hasPlayedMatches) {
            alert('Maçlar başladıktan sonra oyuncu değişikliği yapılamaz!');
            return;
        }

        setTournaments(prev => {
            const newTournaments = { ...prev };
            const tournament = newTournaments[selectedGender];
            
            // Grupları bul
            const group1 = tournament.groups.find(g => g.id === group1Id);
            const group2 = tournament.groups.find(g => g.id === group2Id);
            
            if (group1 && group2) {
                // Oyuncuları değiştir
                const player1Index = group1.players.findIndex(p => p.tcKimlik === player1.tcKimlik);
                const player2Index = group2.players.findIndex(p => p.tcKimlik === player2.tcKimlik);
                
                if (player1Index !== -1 && player2Index !== -1) {
                    // Oyuncuları değiştir
                    [group1.players[player1Index], group2.players[player2Index]] = 
                    [group2.players[player2Index], group1.players[player1Index]];
                    
                    // Maç listesini yeniden oluştur
                    group1.matches = createGroupMatches(group1.players);
                    group2.matches = createGroupMatches(group2.players);
                    
                    // Puan durumunu sıfırla
                    group1.standings = calculateStandings(group1.players, group1.matches);
                    group2.standings = calculateStandings(group2.players, group2.matches);
                    
                    console.log(`Oyuncular değiştirildi: ${player1.ad} <-> ${player2.ad}`);
                }
            }
            
            return newTournaments;
        });
        
        // Swap modunu kapat
        setSwapMode(false);
        setSelectedPlayer(null);
    };

    // Oyuncu seçme fonksiyonu
    const handlePlayerSelect = (player, groupId) => {
        if (!isAdminAuthenticated) return;
        
        if (!swapMode) {
            // İlk oyuncu seçildi
            setSelectedPlayer({ player, groupId });
            setSwapMode(true);
        } else {
            // İkinci oyuncu seçildi
            if (selectedPlayer.groupId === groupId && selectedPlayer.player.tcKimlik === player.tcKimlik) {
                // Aynı oyuncu seçildi, iptal et
                setSwapMode(false);
                setSelectedPlayer(null);
            } else {
                // Farklı oyuncu seçildi, değiştir
                swapPlayers(selectedPlayer.player, player, selectedPlayer.groupId, groupId);
            }
        }
    };
    
    // Zaman hesaplama fonksiyonu (saatleri dakikaya çevir)
    const timeToMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    };
    
    // Dakikaları saate çevir
    const minutesToTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };
    
    // Maçları kortlara yerleştir ve zaman çizelgesi oluştur
    // Gelişmiş Kort Çizelgesi - Tek Gün veya Tarih Aralığı
    const assignCourtsAndSchedule = () => {
        if (!isAdminAuthenticated) {
            alert('Bu işlem için admin yetkisi gereklidir!');
            return;
        }

        // Eğer tarih aralığı seçilmişse, tarih bazlı planlama yap
        if (startDate && endDate) {
            createDateBasedSchedule();
            return;
        }

        // Tek gün için basit planlama (eski sistem)
        const startMinutes = timeToMinutes(startTime);
        const endMinutes = timeToMinutes(endTime);

        if (endMinutes <= startMinutes) {
            alert('Bitiş saati başlangıç saatinden sonra olmalıdır!');
            return;
        }

        const availableHours = Math.floor((endMinutes - startMinutes) / 60);
        if (availableHours < 1) {
            alert('En az 1 saat süre olmalıdır!');
            return;
        }

        // Tüm maçları al (oynanmış + oynanmamış)
        const allMatches = getAllMatches();
        const maxMatchesInTimeRange = availableHours * courts.length;
        
        if (allMatches.length > maxMatchesInTimeRange) {
            const recommendedEndTime = minutesToTime(startMinutes + Math.ceil(allMatches.length / courts.length) * 60);
            alert(`Uyarı: ${allMatches.length} maç için önerilen bitiş saati: ${recommendedEndTime}. Fazla maçlar kesilecek.`);
        }

        const matchesToSchedule = allMatches.slice(0, maxMatchesInTimeRange);

        // Çizelge oluştur
        const schedule = {};
        let currentTime = startMinutes;
        
        for (let i = 0; i < matchesToSchedule.length; i += courts.length) {
            const matchBatch = matchesToSchedule.slice(i, i + courts.length);
            const timeSlot = minutesToTime(currentTime);
            
            schedule[timeSlot] = {
                startTime: timeSlot,
                endTime: minutesToTime(currentTime + 60),
                courts: {}
            };
            
            matchBatch.forEach((match, courtIndex) => {
                const court = courts[courtIndex];
                schedule[timeSlot].courts[court.id] = {
                    courtId: court.id,
                    courtName: court.name,
                    match: match
                };
            });
            
            currentTime += 60;
        }
        
        setCourtSchedule(schedule);
        setShowCourtSchedule(true);
        
        // Date-based schedule'ı temizle çünkü tek gün modundayız
        setDateBasedSchedule({});
        
        console.log('Tek gün kort çizelgesi oluşturuldu:', schedule);
    };
    
    // Maç değiştirme fonksiyonu
    const swapMatches = (match1Info, match2Info) => {
        if (!isAdminAuthenticated) {
            alert('Bu işlem için admin yetkisi gereklidir!');
            return;
        }

        const newSchedule = { ...courtSchedule };
        
        // İlk maçın yerini al
        const time1 = match1Info.timeSlot;
        const court1 = match1Info.courtId;
        const match1 = newSchedule[time1].courts[court1].match;
        
        // İkinci maçın yerini al
        const time2 = match2Info.timeSlot;
        const court2 = match2Info.courtId;
        const match2 = newSchedule[time2].courts[court2].match;
        
        // Maçları değiştir
        newSchedule[time1].courts[court1].match = match2;
        newSchedule[time2].courts[court2].match = match1;
        
        setCourtSchedule(newSchedule);
        setMatchSwapMode(false);
        setSelectedMatchForSwap(null);
        
        console.log(`Maçlar değiştirildi: ${time1} ${court1} <-> ${time2} ${court2}`);
    };
    
    // Maç seçme fonksiyonu (değiştirme için)
    const handleMatchSelect = (timeSlot, courtId, match) => {
        if (!isAdminAuthenticated || !matchSwapMode) return;
        
        const matchInfo = { timeSlot, courtId, match };
        
        if (!selectedMatchForSwap) {
            // İlk maç seçildi
            setSelectedMatchForSwap(matchInfo);
        } else {
            // İkinci maç seçildi
            if (selectedMatchForSwap.timeSlot === timeSlot && selectedMatchForSwap.courtId === courtId) {
                // Aynı maç seçildi, iptal et
                setSelectedMatchForSwap(null);
                setMatchSwapMode(false);
            } else {
                // Farklı maç seçildi, değiştir
                swapMatches(selectedMatchForSwap, matchInfo);
            }
        }
    };
    
    // Tarih bazlı çizelgede maç değiştirme fonksiyonu
    const swapDateScheduleMatches = (match1Info, match2Info) => {
        if (!isAdminAuthenticated) {
            alert('Bu işlem için admin yetkisi gereklidir!');
            return;
        }

        const newSchedule = { ...dateBasedSchedule };
        
        // İlk maçın yerini al
        const date1 = match1Info.date;
        const time1 = match1Info.timeSlot;
        const court1 = match1Info.courtId;
        const match1 = newSchedule[date1].timeSlots[time1].courts[court1].match;
        
        // İkinci maçın yerini al
        const date2 = match2Info.date;
        const time2 = match2Info.timeSlot;
        const court2 = match2Info.courtId;
        const match2 = newSchedule[date2].timeSlots[time2].courts[court2].match;
        
        // Maçları yer değiştir
        newSchedule[date1].timeSlots[time1].courts[court1].match = match2;
        newSchedule[date2].timeSlots[time2].courts[court2].match = match1;
        
        setDateBasedSchedule(newSchedule);
        setMatchSwapMode(false);
        setSelectedMatchForSwap(null);
        
        console.log('Tarih bazlı çizelgede maçlar değiştirildi:', {
            match1: `${typeof match1.player1 === 'object' ? match1.player1.ad : match1.player1} vs ${typeof match1.player2 === 'object' ? match1.player2.ad : match1.player2}`,
            match2: `${typeof match2.player1 === 'object' ? match2.player1.ad : match2.player1} vs ${typeof match2.player2 === 'object' ? match2.player2.ad : match2.player2}`,
            oldPositions: { date1, time1, court1, date2, time2, court2 }
        });
    };
    
    // Tarih bazlı çizelgede maç seçme fonksiyonu
    const handleDateScheduleMatchSelect = (date, timeSlot, courtId, match) => {
        if (!isAdminAuthenticated || !matchSwapMode) return;
        
        const matchInfo = { date, timeSlot, courtId, match };
        
        if (!selectedMatchForSwap) {
            // İlk maç seçildi
            setSelectedMatchForSwap(matchInfo);
        } else {
            // İkinci maç seçildi
            if (selectedMatchForSwap.date === date && 
                selectedMatchForSwap.timeSlot === timeSlot && 
                selectedMatchForSwap.courtId === courtId) {
                // Aynı maç seçildi, iptal et
                setSelectedMatchForSwap(null);
                setMatchSwapMode(false);
            } else {
                // Farklı maç seçildi, değiştir
                swapDateScheduleMatches(selectedMatchForSwap, matchInfo);
            }
        }
    };
    
    // Time slot toggle fonksiyonu
    const toggleTimeSlot = (timeSlot) => {
        setCollapsedTimeSlots(prev => ({
            ...prev,
            [timeSlot]: !prev[timeSlot]
        }));
    };
    
    // Hepsini aç/kapat fonksiyonları
    const expandAllTimeSlots = () => {
        setCollapsedTimeSlots({});
    };
    
    const collapseAllTimeSlots = () => {
        const allTimeSlots = Object.keys(courtSchedule);
        const allCollapsed = allTimeSlots.reduce((acc, timeSlot) => {
            acc[timeSlot] = true;
            return acc;
        }, {});
        setCollapsedTimeSlots(allCollapsed);
    };
    
    // Hafta sonu kontrolü (Cumartesi = 6, Pazar = 0)
    const isWeekend = (date) => {
        const day = new Date(date).getDay();
        return day === 0 || day === 6;
    };
    
    // Tarih aralığındaki günleri hesapla
    const getDateRange = (start, end) => {
        const dates = [];
        const startDate = new Date(start);
        const endDate = new Date(end);
        
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            dates.push(new Date(d));
        }
        return dates;
    };
    
    // Bir günde kaç maç sığar hesapla
    const getMatchCapacityForDate = (date) => {
        const weekend = isWeekend(date);
        const startTime = weekend ? weekendStartTime : weekdayStartTime;
        const endTime = weekend ? weekendEndTime : weekdayEndTime;
        
        const startMinutes = timeToMinutes(startTime);
        const endMinutes = timeToMinutes(endTime);
        const availableHours = Math.floor((endMinutes - startMinutes) / 60);
        
        return availableHours * courts.length;
    };
    
    // Tüm maçları getir (oynanmış ve oynanmamış)
    const getAllMatches = () => {
        const tournament = tournaments[selectedGender];
        if (!tournament.isActive) return [];
        
        let allMatches = [];
        let matchIdCounter = 1;
        
        // Grup maçları
        if (tournament.groups && tournament.groups.length > 0) {
            tournament.groups.forEach((group) => {
                group.matches.forEach((match) => {
                    if (match.player2) { // Sadece iki oyunculu maçları dahil et
                        allMatches.push({
                            id: `group-${group.id}-${match.id}`,
                            displayId: matchIdCounter++,
                            type: 'group',
                            groupId: group.id,
                            groupName: `Grup ${group.id}`,
                            player1: match.player1,
                            player2: match.player2,
                            originalMatch: match,
                            isPlayed: match.isPlayed || false,
                            result: match.result || null
                        });
                    }
                });
            });
        }
        
        // Eleme maçları
        if (tournament.eliminationRounds && tournament.eliminationRounds.length > 0) {
            tournament.eliminationRounds.forEach((round, roundIndex) => {
                round.forEach((match) => {
                    if (match.player2) { // Sadece iki oyunculu maçları dahil et
                        allMatches.push({
                            id: `elim-${roundIndex}-${match.id}`,
                            displayId: matchIdCounter++,
                            type: 'elimination',
                            roundName: `Eleme Turu ${roundIndex + 1}`,
                            player1: match.player1,
                            player2: match.player2,
                            originalMatch: match,
                            isPlayed: match.isPlayed || false,
                            result: match.result || null
                        });
                    }
                });
            });
        }
        
        // Competition maçları
        if (tournament.competitionRounds && tournament.competitionRounds.length > 0) {
            tournament.competitionRounds.forEach((round, roundIndex) => {
                round.forEach((match) => {
                    if (match.player2) { // Sadece iki oyunculu maçları dahil et
                        allMatches.push({
                            id: `comp-${roundIndex}-${match.id}`,
                            displayId: matchIdCounter++,
                            type: 'competition',
                            roundName: `Competition Turu ${roundIndex + 1}`,
                            player1: match.player1,
                            player2: match.player2,
                            originalMatch: match,
                            isPlayed: match.isPlayed || false,
                            result: match.result || null
                        });
                    }
                });
            });
        }
        
        return allMatches;
    };
    
    // Geriye kalan (oynanmamış) maçları getir
    const getRemainingMatches = () => {
        return getAllMatches().filter(match => !match.isPlayed);
    };
    
    // Tarih bazlı planlama oluştur (TÜM maçlar için)
    const createDateBasedSchedule = () => {
        if (!isAdminAuthenticated) {
            alert('Bu işlem için admin yetkisi gereklidir!');
            return;
        }
        
        if (!startDate || !endDate) {
            alert('Başlangıç ve bitiş tarihlerini seçin!');
            return;
        }
        
        if (new Date(startDate) >= new Date(endDate)) {
            alert('Bitiş tarihi başlangıç tarihinden sonra olmalıdır!');
            return;
        }
        
        const allMatches = getAllMatches();
        if (allMatches.length === 0) {
            alert('Planlama için maç bulunmuyor!');
            return;
        }
        
        const dateRange = getDateRange(startDate, endDate);
        const schedule = {};
        let matchIndex = 0;
        
        // Her güne maçları dağıt
        for (const date of dateRange) {
            if (matchIndex >= allMatches.length) break;
            
            const dateStr = date.toISOString().split('T')[0];
            const capacity = getMatchCapacityForDate(date);
            const weekend = isWeekend(date);
            
            const dayMatches = allMatches.slice(matchIndex, matchIndex + capacity);
            if (dayMatches.length === 0) continue;
            
            const dayStartTime = weekend ? weekendStartTime : weekdayStartTime;
            const dayEndTime = weekend ? weekendEndTime : weekdayEndTime;
            
            // Günün istatistiklerini hesapla
            const playedCount = dayMatches.filter(match => match.isPlayed).length;
            const remainingCount = dayMatches.filter(match => !match.isPlayed).length;
            
            schedule[dateStr] = {
                date: dateStr,
                dayName: date.toLocaleDateString('tr-TR', { weekday: 'long' }),
                isWeekend: weekend,
                startTime: dayStartTime,
                endTime: dayEndTime,
                capacity: capacity,
                matches: dayMatches,
                playedMatches: playedCount,
                remainingMatches: remainingCount,
                timeSlots: createTimeSlotsForDay(dayMatches, dayStartTime)
            };
            
            matchIndex += dayMatches.length;
        }
        
        // Tüm maçlar sığmadıysa uyarı
        if (matchIndex < allMatches.length) {
            const remainingCount = allMatches.length - matchIndex;
            alert(`${remainingCount} maç belirlenen tarih aralığına sığmadı! Daha uzun bir tarih aralığı seçin.`);
        }
        
        setDateBasedSchedule(schedule);
        setShowDatePlanning(false);
        
        const totalPlayed = Object.values(schedule).reduce((sum, day) => sum + day.playedMatches, 0);
        const totalRemaining = Object.values(schedule).reduce((sum, day) => sum + day.remainingMatches, 0);
        
        console.log('Tarih bazlı çizelge oluşturuldu:', {
            schedule,
            totalDays: Object.keys(schedule).length,
            totalMatches: allMatches.length,
            playedMatches: totalPlayed,
            remainingMatches: totalRemaining
        });
    };
    
    // Bir gün için zaman dilimlerini oluştur
    const createTimeSlotsForDay = (matches, startTime) => {
        const timeSlots = {};
        const courtCount = courts.length;
        let currentTime = timeToMinutes(startTime);
        
        for (let i = 0; i < matches.length; i += courtCount) {
            const matchBatch = matches.slice(i, i + courtCount);
            const timeSlot = minutesToTime(currentTime);
            
            timeSlots[timeSlot] = {
                startTime: timeSlot,
                endTime: minutesToTime(currentTime + 60),
                courts: {}
            };
            
            matchBatch.forEach((match, courtIndex) => {
                const court = courts[courtIndex];
                timeSlots[timeSlot].courts[court.id] = {
                    courtId: court.id,
                    courtName: court.name,
                    match: match
                };
            });
            
            currentTime += 60;
        }
        
        return timeSlots;
    };

    const currentTournament = tournaments[selectedGender];

    return (
        <div className="admin-dashboard">
            {/* Admin Authentication Modal */}
            {showPasswordModal && (
                <div className="admin-auth-modal">
                    <div className="modal-content">
                        <h3>🔐 Yetkilendirme</h3>
                        <p>Değişiklik yapabilmek için şifre giriniz.</p>
                        <div className="form-group">
                            <input
                                type="password"
                                placeholder="Admin şifresi"
                                value={adminPassword}
                                onChange={(e) => setAdminPassword(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                            />
                        </div>
                        <div className="modal-buttons">
                            <button onClick={handleAdminLogin} className="login-btn">
                                Giriş Yap
                            </button>
                            <button onClick={() => setShowPasswordModal(false)} className="view-only-btn">
                                Sadece Görüntüle
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Admin Status Bar */}
            <div className="admin-status-bar">
                <div className="status-info">
                    {isAdminAuthenticated ? (
                        <span className="status-authenticated">✅ Admin Yetkisi: Tam Erişim</span>
                    ) : (
                        <span className="status-view-only">👁️ Admin Yetkisi: Sadece Görüntüleme</span>
                    )}
                </div>
                {isAdminAuthenticated && (
                    <button onClick={handleAdminLogout} className="logout-btn">
                        Çıkış Yap
                    </button>
                )}
            </div>
            
            <div className="dashboard-controls">
                <div className="gender-selector">
                    <button 
                        className={selectedGender === 'male' ? 'active' : ''}
                        onClick={() => setSelectedGender('male')}
                    >
                        Erkek Turnuvası
                    </button>
                    <button 
                        className={selectedGender === 'female' ? 'active' : ''}
                        onClick={() => setSelectedGender('female')}
                    >
                        Kadın Turnuvası
                    </button>
                </div>

                <div className="tournament-buttons">
                    {!currentTournament.isActive ? (
                        isAdminAuthenticated && (
                            <button 
                                className="create-tournament-btn"
                                onClick={() => setShowCreateTournament(true)}
                            >
                                {selectedGender === 'male' ? 'Erkek' : 'Kadın'} Turnuvası Başlat
                            </button>
                        )
                    ) : (
                        isAdminAuthenticated && (
                            <button 
                                className="reset-tournament-btn"
                                onClick={() => {
                                    if (window.confirm(`${selectedGender === 'male' ? 'Erkek' : 'Kadın'} turnuvasını sıfırlamak istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
                                        setTournaments(prev => ({
                                            ...prev,
                                            [selectedGender]: {
                                                groups: [],
                                                eliminationRounds: [],
                                                competitionRounds: [],
                                                currentRound: 1,
                                                isActive: false,
                                                phase: 'groups',
                                                champion: null,
                                                runnerUp: null,
                                                competitionChampion: null,
                                                competitionRunnerUp: null,
                                                mainTournamentCompleted: false,
                                                competitionCompleted: false,
                                                isCompleted: false
                                            }
                                        }));
                                    }
                                }}
                            >
                                {selectedGender === 'male' ? 'Erkek' : 'Kadın'} Turnuvasını Sıfırla
                            </button>
                        )
                    )}
                </div>

                {/* Kort Yerleşimi Kontrolleri */}
                {isAdminAuthenticated && currentTournament.isActive && (
                    <div className="court-assignment-controls">
                        <div className="court-controls-header">
                            <h4>🎾 Kort Yerleşimi ve Zaman Çizelgesi</h4>
                        </div>
                        
                        <div className="court-settings">
                            <div className="planning-mode-toggle">
                                <button 
                                    className={`mode-toggle-btn ${!startDate ? 'active' : ''}`}
                                    onClick={() => {
                                        setStartDate('');
                                        setEndDate('');
                                    }}
                                >
                                    📅 Tek Gün
                                </button>
                                <button 
                                    className={`mode-toggle-btn ${startDate ? 'active' : ''}`}
                                    onClick={() => {
                                        const today = new Date().toISOString().split('T')[0];
                                        const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                                        setStartDate(today);
                                        setEndDate(nextWeek);
                                    }}
                                >
                                    📆 Tarih Aralığı
                                </button>
                            </div>

                            {/* Tek Gün Modu */}
                            {!startDate && (
                                <div className="single-day-controls">
                                    <div className="time-controls">
                                        <div className="time-setting">
                                            <label htmlFor="start-time">Başlangıç Saati:</label>
                                            <input
                                                id="start-time"
                                                type="time"
                                                value={startTime}
                                                onChange={(e) => setStartTime(e.target.value)}
                                            />
                                        </div>
                                        <div className="time-setting">
                                            <label htmlFor="end-time">Bitiş Saati:</label>
                                            <input
                                                id="end-time"
                                                type="time"
                                                value={endTime}
                                                onChange={(e) => setEndTime(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="court-info">
                                        <span>⚽ Toplam maçlar: {getAllMatches().length}</span>
                                        <span>⏳ Kalan: {getRemainingMatches().length}</span>
                                        <span>🏟️ Kort sayısı: {courts.length}</span>
                                        <span>⏰ Süre: {
                                            startTime && endTime && timeToMinutes(endTime) > timeToMinutes(startTime) ? 
                                            Math.floor((timeToMinutes(endTime) - timeToMinutes(startTime)) / 60) + ' saat' : 
                                            '0 saat'
                                        }</span>
                                        <span>📊 Kapasite: {
                                            startTime && endTime && timeToMinutes(endTime) > timeToMinutes(startTime) ? 
                                            Math.floor((timeToMinutes(endTime) - timeToMinutes(startTime)) / 60) * courts.length + ' maç' : 
                                            '0 maç'
                                        }</span>
                                    </div>
                                </div>
                            )}

                            {/* Tarih Aralığı Modu */}
                            {startDate && (
                                <div className="date-range-controls">
                                    <div className="date-inputs">
                                        <div className="date-input">
                                            <label htmlFor="start-date">Başlangıç Tarihi:</label>
                                            <input
                                                id="start-date"
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                            />
                                        </div>
                                        <div className="date-input">
                                            <label htmlFor="end-date">Bitiş Tarihi:</label>
                                            <input
                                                id="end-date"
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="time-settings-compact">
                                        <div className="weekday-settings-compact">
                                            <h5>📅 Hafta İçi</h5>
                                            <div className="time-inputs-compact">
                                                <input
                                                    type="time"
                                                    value={weekdayStartTime}
                                                    onChange={(e) => setWeekdayStartTime(e.target.value)}
                                                />
                                                <span>-</span>
                                                <input
                                                    type="time"
                                                    value={weekdayEndTime}
                                                    onChange={(e) => setWeekdayEndTime(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="weekend-settings-compact">
                                            <h5>🏖️ Hafta Sonu</h5>
                                            <div className="time-inputs-compact">
                                                <input
                                                    type="time"
                                                    value={weekendStartTime}
                                                    onChange={(e) => setWeekendStartTime(e.target.value)}
                                                />
                                                <span>-</span>
                                                <input
                                                    type="time"
                                                    value={weekendEndTime}
                                                    onChange={(e) => setWeekendEndTime(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="date-planning-info">
                                        {startDate && endDate && (
                                            <div className="preview-stats">
                                                <span>📅 Gün sayısı: {getDateRange(startDate, endDate).length}</span>
                                                <span>⚽ Toplam maçlar: {getAllMatches().length}</span>
                                                <span>⏳ Kalan: {getRemainingMatches().length}</span>
                                                <span>📊 Kapasite: {
                                                    getDateRange(startDate, endDate).reduce((total, date) => 
                                                        total + getMatchCapacityForDate(date), 0
                                                    )
                                                } maç</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="court-buttons">
                            <button 
                                className="assign-courts-btn"
                                onClick={assignCourtsAndSchedule}
                            >
                                {startDate ? '📅 Tarih Çizelgesi Oluştur' : '🏟️ Kortları Yerleştir'}
                            </button>
                            
                            {(Object.keys(courtSchedule).length > 0 || Object.keys(dateBasedSchedule).length > 0) && (
                                <>
                                    <button 
                                        className="view-schedule-btn"
                                        onClick={() => {
                                            if (Object.keys(dateBasedSchedule).length > 0) {
                                                setShowDateSchedule(!showDateSchedule);
                                            } else {
                                                setShowCourtSchedule(!showCourtSchedule);
                                            }
                                        }}
                                    >
                                        {(showCourtSchedule || showDateSchedule) ? '❌ Çizelgeyi Gizle' : '📋 Çizelgeyi Göster'}
                                    </button>
                                    
                                    <button 
                                        className="reset-schedule-btn"
                                        onClick={() => {
                                            if (window.confirm('Tüm çizelgeyi sıfırlamak istediğinizden emin misiniz?')) {
                                                setCourtSchedule({});
                                                setDateBasedSchedule({});
                                                setShowCourtSchedule(false);
                                                setShowDateSchedule(false);
                                                setMatchSwapMode(false);
                                                localStorage.removeItem('courtSchedule');
                                                localStorage.removeItem('dateBasedSchedule');
                                            }
                                        }}
                                    >
                                        🗑️ Çizelgeyi Sıfırla
                                    </button>
                                </>
                            )}
                            
                            {showCourtSchedule && Object.keys(courtSchedule).length > 0 && (
                                <button 
                                    className="swap-matches-btn"
                                    onClick={() => {
                                        setMatchSwapMode(!matchSwapMode);
                                        setSelectedMatchForSwap(null);
                                    }}
                                >
                                    {matchSwapMode ? '❌ Değiştirmeyi İptal Et' : '🔄 Maç Değiştir'}
                                </button>
                            )}
                        </div>
                    </div>
                )}



                {isAdminAuthenticated && (
                    <button 
                        className="clear-data-btn"
                        onClick={() => {
                            if (window.confirm('Tüm verileri temizlemek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
                                localStorage.removeItem('registeredUsers');
                                localStorage.removeItem('tournaments');
                                window.location.reload();
                            }
                        }}
                    >
                        Verileri Temizle
                    </button>
                )}

                {/* <button 
                    className="debug-btn"
                    onClick={() => {
                        console.log('Local Storage - registeredUsers:', localStorage.getItem('registeredUsers'));
                        console.log('Local Storage - tournaments:', localStorage.getItem('tournaments'));
                        console.log('Current State - registeredUsers:', registeredUsers);
                        console.log('Current State - tournaments:', tournaments);
                    }}
                >
                    Debug
                </button> */}
            </div>

            {showCreateTournament && (
                <div className="create-tournament-modal">
                    <div className="modal-content">
                        <h3>Turnuva Ayarları</h3>
                        <div className="form-group">
                            <label>Maksimum Oyuncu Sayısı Per Grup:</label>
                            <select value={groupSize} onChange={(e) => setGroupSize(parseInt(e.target.value))}>
                                <option value={2}>2 Oyuncu</option>
                                <option value={3}>3 Oyuncu</option>
                                <option value={4}>4 Oyuncu</option>
                                <option value={5}>5 Oyuncu</option>
                                <option value={6}>6 Oyuncu</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <p className="info-text">
                                📊 Grup dağılımı otomatik olarak hesaplanacaktır:<br/>
                                • Her grup en az 3 kişilik olacak<br/>
                                • Her grupta maksimum {groupSize} oyuncu olacak<br/>
                                • Grup sayısı katılımcı sayısına göre otomatik hesaplanacak
                            </p>
                        </div>
                        <div className="modal-buttons">
                            <button onClick={createTournament}>Turnuvayı Başlat</button>
                            <button onClick={() => setShowCreateTournament(false)}>İptal</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Kort Çizelgesi Görünümü - Tek Gün */}
            {showCourtSchedule && Object.keys(courtSchedule).length > 0 && !startDate && (
                <div className="court-schedule-view">
                    <div className="schedule-header">
                        <h3>🏟️ Kort Çizelgesi - {selectedGender === 'male' ? 'Erkek' : 'Kadın'} Turnuvası</h3>
                        <div className="schedule-info">
                            <span>📅 {startTime} - {endTime}</span>
                            <span>🎾 Toplam {courts.length} kort</span>
                            <span>📊 {Object.keys(courtSchedule).length} zaman dilimi</span>
                        </div>
                        
                        {/* Collapse/Expand Controls */}
                        <div className="schedule-controls">
                            <div className="collapse-controls">
                                <button 
                                    className="collapse-btn expand-all"
                                    onClick={expandAllTimeSlots}
                                    title="Tüm zaman dilimlerini aç"
                                >
                                    📂 Hepsini Aç
                                </button>
                                <button 
                                    className="collapse-btn collapse-all"
                                    onClick={collapseAllTimeSlots}
                                    title="Tüm zaman dilimlerini kapat"
                                >
                                    📁 Hepsini Kapat
                                </button>
                            </div>
                        </div>
                        
                        {/* Maç Değiştirme Modu Bilgisi */}
                        {matchSwapMode && (
                            <div className="match-swap-info">
                                <div className="swap-mode-alert">
                                    🔄 <strong>Maç Değiştirme Modu Aktif</strong>
                                    <br/>
                                    {selectedMatchForSwap ? (
                                        <span>
                                            Seçilen maç: <strong>{selectedMatchForSwap.match.player1.ad} vs {selectedMatchForSwap.match.player2.ad}</strong> 
                                            ({selectedMatchForSwap.timeSlot} - {courts.find(c => c.id === selectedMatchForSwap.courtId)?.name})
                                            <br/>Değiştirmek istediğiniz maçı seçin
                                        </span>
                                    ) : (
                                        'Değiştirmek istediğiniz ilk maçı seçin'
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="schedule-grid">
                        {Object.entries(courtSchedule).map(([timeSlot, timeData]) => {
                            const isCollapsed = collapsedTimeSlots[timeSlot];
                            return (
                                <div key={timeSlot} className={`time-slot ${isCollapsed ? 'collapsed' : ''}`}>
                                    <div 
                                        className="time-slot-header clickable"
                                        onClick={() => toggleTimeSlot(timeSlot)}
                                        title="Zaman dilimini açmak/kapatmak için tıklayın"
                                    >
                                        <div className="time-slot-title">
                                            <h4>⏰ {timeData.startTime} - {timeData.endTime}</h4>
                                            <div className="time-slot-stats">
                                                <span>{Object.keys(timeData.courts).length}/{courts.length} kort dolu</span>
                                            </div>
                                        </div>
                                        <div className="collapse-indicator">
                                            {isCollapsed ? '▼' : '▲'}
                                        </div>
                                    </div>
                                    
                                    {!isCollapsed && (
                                        <div className="courts-grid">
                                    {courts.map(court => {
                                        const courtMatch = timeData.courts[court.id];
                                        return (
                                            <div 
                                                key={court.id} 
                                                className={`court-card ${
                                                    matchSwapMode && courtMatch ? 'swap-mode' : ''
                                                } ${
                                                    selectedMatchForSwap && 
                                                    selectedMatchForSwap.timeSlot === timeSlot && 
                                                    selectedMatchForSwap.courtId === court.id
                                                        ? 'selected-for-swap' : ''
                                                } ${
                                                    matchSwapMode && 
                                                    courtMatch && 
                                                    selectedMatchForSwap && 
                                                    (selectedMatchForSwap.timeSlot !== timeSlot || selectedMatchForSwap.courtId !== court.id)
                                                        ? 'can-swap' : ''
                                                }`}
                                                onClick={() => courtMatch && handleMatchSelect(timeSlot, court.id, courtMatch.match)}
                                                title={
                                                    matchSwapMode && courtMatch
                                                        ? selectedMatchForSwap && selectedMatchForSwap.timeSlot === timeSlot && selectedMatchForSwap.courtId === court.id
                                                            ? 'Bu maç seçildi, başka bir maç seçin'
                                                            : 'Bu maç ile değiştirmek için tıklayın'
                                                        : ''
                                                }
                                            >
                                                <div className="court-header">
                                                    <span className="court-name">{court.name}</span>
                                                    <span className="court-status">
                                                        {courtMatch ? '🎾' : '🚫'}
                                                    </span>
                                                </div>
                                                
                                                {courtMatch ? (
                                                    <div className="court-match">
                                                        <div className="match-type">
                                                            {courtMatch.match.type === 'group' && (
                                                                <span className="type-badge group">{courtMatch.match.groupName}</span>
                                                            )}
                                                            {courtMatch.match.type === 'elimination' && (
                                                                <span className="type-badge elimination">{courtMatch.match.roundName}</span>
                                                            )}
                                                            {courtMatch.match.type === 'competition' && (
                                                                <span className="type-badge competition">{courtMatch.match.roundName}</span>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="match-players">
                                                            <div className="player">{courtMatch.match.player1.ad}</div>
                                                            <div className="vs">VS</div>
                                                            <div className="player">{courtMatch.match.player2.ad}</div>
                                                        </div>
                                                        
                                                        <div className="match-id">Maç #{courtMatch.match.displayId}</div>
                                                        
                                                        {courtMatch.match.isPlayed && (
                                                            <div className="match-completed">✅ Tamamlandı</div>
                                                        )}
                                                        
                                                        {matchSwapMode && (
                                                            <div className="swap-indicator">
                                                                {selectedMatchForSwap && selectedMatchForSwap.timeSlot === timeSlot && selectedMatchForSwap.courtId === court.id
                                                                    ? '🔄 Seçildi'
                                                                    : selectedMatchForSwap
                                                                        ? '⬅️ Değiştir'
                                                                        : '👆 Seç'
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="court-empty">
                                                        <span>Boş</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="schedule-summary">
                        <h4>📋 Özet</h4>
                        <div className="summary-stats">
                            <div className="stat-item">
                                <span className="stat-label">Toplam Maç:</span>
                                <span className="stat-value">
                                    {Object.values(courtSchedule).reduce((total, timeData) => 
                                        total + Object.keys(timeData.courts).length, 0
                                    )}
                                </span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Tahmini Süre:</span>
                                <span className="stat-value">
                                    {Object.keys(courtSchedule).length} saat
                                </span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Bitiş Saati:</span>
                                <span className="stat-value">
                                    {Object.values(courtSchedule)[Object.keys(courtSchedule).length - 1]?.endTime || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tarih Bazlı Çizelge Görüntüleme */}
            {showDateSchedule && Object.keys(dateBasedSchedule).length > 0 && (
                <div className="date-schedule-view">
                    <div className="date-schedule-header">
                        <h3>📅 Tarih Bazlı Maç Çizelgesi</h3>
                        <div className="schedule-summary">
                            <span>📊 Toplam {Object.keys(dateBasedSchedule).length} gün</span>
                            <span>⚽ Toplam {
                                Object.values(dateBasedSchedule).reduce((total, day) => total + day.matches.length, 0)
                            } maç</span>
                        </div>
                        
                        {/* Date Schedule Controls */}
                        <div className="date-schedule-controls">
                            <button 
                                className="date-swap-matches-btn"
                                onClick={() => {
                                    setMatchSwapMode(!matchSwapMode);
                                    setSelectedMatchForSwap(null);
                                }}
                            >
                                {matchSwapMode ? '❌ Maç Değişimini İptal Et' : '🔄 Maç Değiştir'}
                            </button>
                        </div>
                        
                        {/* Maç Değiştirme Modu Bilgisi */}
                        {matchSwapMode && (
                            <div className="match-swap-info">
                                <div className="swap-mode-alert">
                                    🔄 <strong>Maç Değiştirme Modu Aktif</strong>
                                    <br/>
                                    {selectedMatchForSwap ? (
                                        <span>
                                            Seçilen maç: <strong>
                                                {typeof selectedMatchForSwap.match.player1 === 'object' ? selectedMatchForSwap.match.player1.ad : selectedMatchForSwap.match.player1} vs {typeof selectedMatchForSwap.match.player2 === 'object' ? selectedMatchForSwap.match.player2.ad : selectedMatchForSwap.match.player2}
                                            </strong> 
                                            ({selectedMatchForSwap.timeSlot})
                                            <br/>Değiştirmek istediğiniz maçı seçin
                                        </span>
                                    ) : (
                                        'Değiştirmek istediğiniz ilk maçı seçin'
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="date-schedule-grid">
                        {Object.values(dateBasedSchedule)
                            .sort((a, b) => new Date(a.date) - new Date(b.date))
                            .map((daySchedule) => (
                            <div key={daySchedule.date} className="date-schedule-day">
                                <div className="day-header">
                                    <div className="day-info">
                                        <h4>{new Date(daySchedule.date).toLocaleDateString('tr-TR', { 
                                            weekday: 'long', 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}</h4>
                                        <span className={`day-type ${daySchedule.isWeekend ? 'weekend' : 'weekday'}`}>
                                            {daySchedule.isWeekend ? '🏖️ Hafta Sonu' : '📅 Hafta İçi'}
                                        </span>
                                    </div>
                                    <div className="day-stats">
                                        <span>⏰ {daySchedule.startTime} - {daySchedule.endTime}</span>
                                        <span>⚽ {daySchedule.matches.length} maç</span>
                                        <span>✅ {daySchedule.playedMatches || 0} oynanmış</span>
                                        <span>⏳ {daySchedule.remainingMatches || 0} kalan</span>
                                        <span>📊 {daySchedule.capacity} kapasite</span>
                                    </div>
                                </div>
                                
                                <div className="day-time-slots">
                                    {Object.entries(daySchedule.timeSlots).map(([timeSlot, slotData]) => (
                                        <div key={timeSlot} className="time-slot-day">
                                            <div className="time-slot-header-day">
                                                <h5>{slotData.startTime} - {slotData.endTime}</h5>
                                                <span className="court-count">
                                                    {Object.keys(slotData.courts).length}/{courts.length} kort
                                                </span>
                                            </div>
                                            
                                            <div className="courts-grid-day">
                                                {courts.map((court) => {
                                                    const courtData = slotData.courts[court.id];
                                                    return (
                                                        <div 
                                                            key={court.id} 
                                                            className={`court-card-day ${
                                                                matchSwapMode && courtData ? 'swap-mode' : ''
                                                            } ${
                                                                selectedMatchForSwap && 
                                                                selectedMatchForSwap.date === daySchedule.date &&
                                                                selectedMatchForSwap.timeSlot === timeSlot && 
                                                                selectedMatchForSwap.courtId === court.id
                                                                    ? 'selected-for-swap' : ''
                                                            } ${
                                                                matchSwapMode && 
                                                                courtData && 
                                                                selectedMatchForSwap && 
                                                                !(selectedMatchForSwap.date === daySchedule.date &&
                                                                  selectedMatchForSwap.timeSlot === timeSlot && 
                                                                  selectedMatchForSwap.courtId === court.id)
                                                                    ? 'can-swap' : ''
                                                            }`}
                                                            onClick={() => courtData && handleDateScheduleMatchSelect(daySchedule.date, timeSlot, court.id, courtData.match)}
                                                            title={
                                                                matchSwapMode && courtData
                                                                    ? selectedMatchForSwap && 
                                                                      selectedMatchForSwap.date === daySchedule.date &&
                                                                      selectedMatchForSwap.timeSlot === timeSlot && 
                                                                      selectedMatchForSwap.courtId === court.id
                                                                        ? 'Bu maç seçildi, başka bir maç seçin'
                                                                        : 'Bu maç ile değiştirmek için tıklayın'
                                                                    : ''
                                                            }
                                                        >
                                                            <div className="court-header-day">
                                                                <span className="court-name-day">{court.name}</span>
                                                                {courtData ? (
                                                                    <span className="court-status-day occupied">🏓</span>
                                                                ) : (
                                                                    <span className="court-status-day empty">➖</span>
                                                                )}
                                                            </div>
                                                            
                                                            {courtData ? (
                                                                <div className={`court-match-day ${courtData.match.isPlayed ? 'played' : 'pending'}`}>
                                                                    {/* Swap Indicator */}
                                                                    {matchSwapMode && (
                                                                        <div className="swap-indicator">
                                                                            {selectedMatchForSwap && 
                                                                             selectedMatchForSwap.date === daySchedule.date &&
                                                                             selectedMatchForSwap.timeSlot === timeSlot && 
                                                                             selectedMatchForSwap.courtId === court.id
                                                                                ? '✅ SEÇİLDİ' 
                                                                                : '🔄 DEĞİŞTİR'}
                                                                        </div>
                                                                    )}
                                                                    
                                                                    <div className="match-type-day">
                                                                        <span className={`type-badge ${courtData.match.type}`}>
                                                                            {courtData.match.type === 'group' ? 'Grup' : 
                                                                             courtData.match.type === 'elimination' ? 'Eleme' : 'Competition'}
                                                                        </span>
                                                                        {courtData.match.isPlayed && (
                                                                            <span className="match-status played">✅ Oynanmış</span>
                                                                        )}
                                                                    </div>
                                                                    
                                                                    <div className="match-players-day">
                                                                        <span className="player">
                                                                            {typeof courtData.match.player1 === 'object' ? courtData.match.player1.ad : courtData.match.player1}
                                                                        </span>
                                                                        <span className="vs">VS</span>
                                                                        <span className="player">
                                                                            {typeof courtData.match.player2 === 'object' ? courtData.match.player2.ad : courtData.match.player2}
                                                                        </span>
                                                                    </div>
                                                                    
                                                                    {courtData.match.isPlayed && courtData.match.result && (
                                                                        <div className="match-result">
                                                                            <span className="result-score">
                                                                                {courtData.match.result.player1Score} - {courtData.match.result.player2Score}
                                                                            </span>
                                                                            <span className="winner">
                                                                                🏆 {courtData.match.result.winner}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    <div className="match-details">
                                                                        {courtData.match.groupName && (
                                                                            <span className="group-name">{courtData.match.groupName}</span>
                                                                        )}
                                                                        {courtData.match.roundName && (
                                                                            <span className="round-name">{courtData.match.roundName}</span>
                                                                        )}
                                                                        <span className="match-id">#{courtData.match.displayId}</span>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="court-empty-day">
                                                                    <span>Boş</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {currentTournament.mainTournamentCompleted && currentTournament.competitionCompleted ? (
                // Her iki turnuva da tamamlandı - Sonuçlar ekranı
                <div className="tournament-results">
                    <h2>🏆 TURNUVA SONUÇLARI 🏆</h2>
                    
                    {/* Ana Turnuva Sonuçları */}
                    <div className="main-tournament-results">
                        <h3>🥇 Ana Turnuva</h3>
                        <div className="results-grid">
                            <div className="result-item champion">
                                <div className="medal">🥇</div>
                                <div className="player-name">{currentTournament.champion.ad}</div>
                                <div className="player-title">Şampiyon</div>
                                <div className="player-tc">TC: {currentTournament.champion.tcKimlik}</div>
                            </div>
                            {currentTournament.runnerUp && (
                                <div className="result-item runner-up">
                                    <div className="medal">🥈</div>
                                    <div className="player-name">{currentTournament.runnerUp.ad}</div>
                                    <div className="player-title">İkinci</div>
                                    <div className="player-tc">TC: {currentTournament.runnerUp.tcKimlik}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Competition Sonuçları */}
                    <div className="competition-results">
                        <h3>🏆 Competition (İkinci Şans)</h3>
                        <div className="results-grid">
                            <div className="result-item competition-champion">
                                <div className="medal">🏆</div>
                                <div className="player-name">{currentTournament.competitionChampion.ad}</div>
                                <div className="player-title">Competition Şampiyonu</div>
                                <div className="player-tc">TC: {currentTournament.competitionChampion.tcKimlik}</div>
                            </div>
                            {currentTournament.competitionRunnerUp && (
                                <div className="result-item competition-runner-up">
                                    <div className="medal">🥈</div>
                                    <div className="player-name">{currentTournament.competitionRunnerUp.ad}</div>
                                    <div className="player-title">Competition İkincisi</div>
                                    <div className="player-tc">TC: {currentTournament.competitionRunnerUp.tcKimlik}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {isAdminAuthenticated && (
                        <button 
                            className="restart-tournament-btn"
                            onClick={() => {
                                setTournaments(prev => ({
                                    ...prev,
                                    [selectedGender]: {
                                        groups: [],
                                        eliminationRounds: [],
                                        competitionRounds: [],
                                        currentRound: 1,
                                        isActive: false,
                                        phase: 'groups',
                                        champion: null,
                                        runnerUp: null,
                                        competitionChampion: null,
                                        competitionRunnerUp: null,
                                        mainTournamentCompleted: false,
                                        competitionCompleted: false,
                                        isCompleted: false
                                    }
                                }));
                            }}
                        >
                            Yeni Turnuva Başlat
                        </button>
                    )}
                </div>
            ) : currentTournament.mainTournamentCompleted && !currentTournament.competitionCompleted ? (
                // Ana turnuva tamamlandı ama competition devam ediyor
                <div className="tournament-partial-results">
                    <h2>🏆 ANA TURNUVA TAMAMLANDI 🏆</h2>
                    
                    {/* Ana Turnuva Sonuçları */}
                    <div className="main-tournament-results">
                        <h3>🥇 Ana Turnuva</h3>
                        <div className="results-grid">
                            <div className="result-item champion">
                                <div className="medal">🥇</div>
                                <div className="player-name">{currentTournament.champion.ad}</div>
                                <div className="player-title">Şampiyon</div>
                                <div className="player-tc">TC: {currentTournament.champion.tcKimlik}</div>
                            </div>
                            {currentTournament.runnerUp && (
                                <div className="result-item runner-up">
                                    <div className="medal">🥈</div>
                                    <div className="player-name">{currentTournament.runnerUp.ad}</div>
                                    <div className="player-title">İkinci</div>
                                    <div className="player-tc">TC: {currentTournament.runnerUp.tcKimlik}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="competition-continuing-notice">
                        <h3>🏆 Competition Devam Ediyor</h3>
                        <p>Ana turnuva tamamlandı. Competition maçları devam ediyor...</p>
                    </div>
                    
                    {/* Competition Maçları - Devam Eden */}
                    {currentTournament.competitionRounds && currentTournament.competitionRounds.length > 0 && (
                        <div className="competition-section">
                            <h4>🏆 Competition (İkinci Şans) - Devam Eden Maçlar</h4>
                            {currentTournament.competitionRounds.map((round, roundIndex) => (
                                <div key={roundIndex} className="competition-round">
                                    <h5>Competition Turu {roundIndex + 1}</h5>
                                    {round.map(match => (
                                        <div key={match.id} className="match-item">
                                            <div className="match-players">
                                                <span>{match.player1.ad}</span>
                                                <span>vs</span>
                                                <span>{match.player2 ? match.player2.ad : 'Bay'}</span>
                                            </div>
                                            
                                            {!match.isPlayed ? (
                                                <div className="match-inputs">
                                                    {isAdminAuthenticated ? (
                                                        <>
                                                            <input
                                                                type="number"
                                                                placeholder="Skor 1"
                                                                value={match.player1Score || ''}
                                                                onChange={(e) => {
                                                                    setTournaments(prev => {
                                                                        const newTournaments = { ...prev };
                                                                        const tournament = newTournaments[selectedGender];
                                                                        const currentRound = tournament.competitionRounds[roundIndex];
                                                                        if (currentRound) {
                                                                            const matchToUpdate = currentRound.find(m => m.id === match.id);
                                                                            if (matchToUpdate) {
                                                                                matchToUpdate.player1Score = e.target.value;
                                                                            }
                                                                        }
                                                                        return newTournaments;
                                                                    });
                                                                }}
                                                            />
                                                            <span>-</span>
                                                            <input
                                                                type="number"
                                                                placeholder="Skor 2"
                                                                value={match.player1Score || ''}
                                                                onChange={(e) => {
                                                                    setTournaments(prev => {
                                                                        const newTournaments = { ...prev };
                                                                        const tournament = newTournaments[selectedGender];
                                                                        const currentRound = tournament.competitionRounds[roundIndex];
                                                                        if (currentRound) {
                                                                            const matchToUpdate = currentRound.find(m => m.id === match.id);
                                                                            if (matchToUpdate) {
                                                                                matchToUpdate.player2Score = e.target.value;
                                                                            }
                                                                        }
                                                                        return newTournaments;
                                                                    });
                                                                }}
                                                            />
                                                        </>
                                                    ) : (
                                                        <div className="score-display">
                                                            <span className="score-placeholder">Skor girişi için yetki gerekli</span>
                                                        </div>
                                                    )}
                                                    {isAdminAuthenticated && (
                                                        <button 
                                                            className="confirm-score-btn"
                                                            onClick={() => updateMatchResult('competition', match.id, match.player1Score, match.player2Score)}
                                                            disabled={!match.player1Score || !match.player2Score}
                                                        >
                                                            Onayla
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="match-result">
                                                    {isAdminAuthenticated ? (
                                                        <span 
                                                            className="winner editable" 
                                                            onClick={() => {
                                                                setTournaments(prev => {
                                                                    const newTournaments = { ...prev };
                                                                    const tournament = newTournaments[selectedGender];
                                                                    const currentRound = tournament.competitionRounds[roundIndex];
                                                                    if (currentRound) {
                                                                        const matchToUpdate = currentRound.find(m => m.id === match.id);
                                                                        if (matchToUpdate) {
                                                                            matchToUpdate.isPlayed = false;
                                                                            matchToUpdate.winner = null;
                                                                            matchToUpdate.player1Score = null;
                                                                            matchToUpdate.player2Score = null;
                                                                        }
                                                                    }
                                                                    return newTournaments;
                                                                });
                                                            }}
                                                            title="Skoru düzenlemek için tıklayın"
                                                        >
                                                            {match.winner.ad}
                                                        </span>
                                                    ) : (
                                                        <span className="winner">{match.winner.ad}</span>
                                                    )}
                                                    <span className="score">{match.player1Score} - {match.player2Score}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ))}

                            {currentTournament.competitionRounds && currentTournament.competitionRounds.length > 0 && (
                                isAdminAuthenticated && (
                                    <button 
                                        className="next-competition-btn"
                                        onClick={createNextCompetitionRound}
                                        disabled={!currentTournament.competitionRounds[currentTournament.competitionRounds.length - 1] || currentTournament.competitionRounds[currentTournament.competitionRounds.length - 1].some(match => !match.isPlayed)}
                                    >
                                        Sonraki Competition Turu
                                    </button>
                                )
                            )}
                        </div>
                    )}
                </div>
            ) : currentTournament.isActive ? (
                <div className="tournament-info">
                    <h3>{selectedGender === 'male' ? 'Erkek' : 'Kadın'} Turnuvası - {currentTournament.phase === 'groups' ? 'Grup Aşaması' : 'Eleme Turu'} - Tur {currentTournament.currentRound}</h3>
                    
                    {currentTournament.phase === 'groups' ? (
                        // Grup aşaması
                        <>
                            {/* Swap Mode Bilgisi */}
                            {swapMode && (
                                <div className="swap-mode-info">
                                    <div className="swap-mode-alert">
                                        🔄 <strong>Oyuncu Değiştirme Modu Aktif</strong>
                                        <br/>
                                        Değiştirmek istediğiniz oyuncuyu seçin
                                        {selectedPlayer && (
                                            <span className="selected-player">
                                                <br/>Seçilen: <strong>{selectedPlayer.player.ad}</strong> (Grup {selectedPlayer.groupId})
                                            </span>
                                        )}
                                        <button 
                                            className="cancel-swap-btn"
                                            onClick={() => {
                                                setSwapMode(false);
                                                setSelectedPlayer(null);
                                            }}
                                        >
                                            İptal
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Swap Mode Butonu */}
                            {isAdminAuthenticated && !swapMode && (
                                <div className="swap-controls">
                                    <button 
                                        className="enable-swap-btn"
                                        onClick={() => setSwapMode(true)}
                                        disabled={currentTournament.groups.some(group => 
                                            group.matches.some(match => match.isPlayed)
                                        )}
                                    >
                                        🔄 Oyuncu Değiştir
                                    </button>
                                    {currentTournament.groups.some(group => 
                                        group.matches.some(match => match.isPlayed)
                                    ) && (
                                        <div className="swap-disabled-info">
                                            ⚠️ Maçlar başladıktan sonra oyuncu değişikliği yapılamaz
                                        </div>
                                    )}
                                </div>
                            )}

                            {currentTournament.groups.map(group => (
                                <div key={group.id} className="tournament-group">
                                    <h4>Grup {group.id}</h4>
                                    
                                    {/* Grup Oyuncuları */}
                                    <div className="group-players">
                                        <h5>Oyuncular</h5>
                                        <div className="players-grid">
                                            {group.players.map((player, playerIndex) => (
                                                <div 
                                                    key={playerIndex} 
                                                    className={`player-item ${
                                                        swapMode ? 'swap-mode' : ''
                                                    } ${
                                                        selectedPlayer && 
                                                        selectedPlayer.groupId === group.id && 
                                                        selectedPlayer.player.tcKimlik === player.tcKimlik
                                                            ? 'selected-for-swap' : ''
                                                    } ${
                                                        swapMode && 
                                                        selectedPlayer && 
                                                        selectedPlayer.groupId !== group.id
                                                            ? 'can-swap' : ''
                                                    }`}
                                                    onClick={() => handlePlayerSelect(player, group.id)}
                                                    title={
                                                        swapMode 
                                                            ? selectedPlayer && selectedPlayer.player.tcKimlik === player.tcKimlik
                                                                ? 'Bu oyuncuyu değiştirmek için başka bir oyuncu seçin'
                                                                : 'Bu oyuncu ile değiştirmek için tıklayın'
                                                            : 'Oyuncu değiştirme modu için tıklayın'
                                                    }
                                                >
                                                    <div className="player-name">{player.ad}</div>
                                                    <div className="player-tc">{player.tcKimlik}</div>
                                                    {swapMode && (
                                                        <div className="swap-indicator">
                                                            {selectedPlayer && selectedPlayer.player.tcKimlik === player.tcKimlik
                                                                ? '🔄 Seçildi'
                                                                : selectedPlayer && selectedPlayer.groupId !== group.id
                                                                    ? '⬅️ Değiştir'
                                                                    : '👆 Seç'
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="group-matches">
                                        <h5>Maçlar</h5>
                                        {group.matches.map(match => (
                                            <div key={match.id} className="match-item">
                                                <div className="match-players">
                                                    <span>{match.player1.ad}</span>
                                                    <span>vs</span>
                                                    <span>{match.player2.ad}</span>
                                                </div>
                                                
                                                {!match.isPlayed ? (
                                                    <div className="match-inputs">
                                                        {isAdminAuthenticated ? (
                                                            <>
                                                                <input
                                                                    type="number"
                                                                    placeholder="Skor 1"
                                                                    value={match.player1Score || ''}
                                                                    onChange={(e) => {
                                                                        setTournaments(prev => {
                                                                            const newTournaments = { ...prev };
                                                                            const tournament = newTournaments[selectedGender];
                                                                            const groupToUpdate = tournament.groups.find(g => g.id === group.id);
                                                                            if (groupToUpdate) {
                                                                                const matchToUpdate = groupToUpdate.matches.find(m => m.id === match.id);
                                                                                if (matchToUpdate) {
                                                                                    matchToUpdate.player1Score = e.target.value;
                                                                                }
                                                                            }
                                                                            return newTournaments;
                                                                        });
                                                                    }}
                                                                />
                                                                <span>-</span>
                                                                <input
                                                                    type="number"
                                                                    placeholder="Skor 2"
                                                                    value={match.player2Score || ''}
                                                                    onChange={(e) => {
                                                                        setTournaments(prev => {
                                                                            const newTournaments = { ...prev };
                                                                            const tournament = newTournaments[selectedGender];
                                                                            const groupToUpdate = tournament.groups.find(g => g.id === group.id);
                                                                            if (groupToUpdate) {
                                                                                const matchToUpdate = groupToUpdate.matches.find(m => m.id === match.id);
                                                                                if (matchToUpdate) {
                                                                                    matchToUpdate.player2Score = e.target.value;
                                                                                }
                                                                            }
                                                                            return newTournaments;
                                                                        });
                                                                    }}
                                                                />
                                                            </>
                                                        ) : (
                                                            <div className="score-display">
                                                                <span className="score-placeholder">Skor girişi için yetki gerekli</span>
                                                            </div>
                                                        )}
                                                        {isAdminAuthenticated && (
                                                            <button 
                                                                className="confirm-score-btn"
                                                                onClick={() => updateMatchResult(group.id, match.id, match.player1Score, match.player2Score)}
                                                                disabled={!match.player1Score || !match.player2Score}
                                                            >
                                                                Onayla
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="match-result">
                                                        {isAdminAuthenticated ? (
                                                            <span 
                                                                className="winner editable" 
                                                                onClick={() => {
                                                                    setTournaments(prev => {
                                                                        const newTournaments = { ...prev };
                                                                        const tournament = newTournaments[selectedGender];
                                                                        const groupToUpdate = tournament.groups.find(g => g.id === group.id);
                                                                        if (groupToUpdate) {
                                                                            const matchToUpdate = groupToUpdate.matches.find(m => m.id === match.id);
                                                                            if (matchToUpdate) {
                                                                                matchToUpdate.isPlayed = false;
                                                                                matchToUpdate.winner = null;
                                                                                matchToUpdate.player1Score = null;
                                                                                matchToUpdate.player2Score = null;
                                                                            }
                                                                            // Puan durumunu güncelle
                                                                            groupToUpdate.standings = calculateStandings(groupToUpdate.players, groupToUpdate.matches);
                                                                        }
                                                                        return newTournaments;
                                                                    });
                                                                }}
                                                                title="Skoru düzenlemek için tıklayın"
                                                            >
                                                                {match.winner.ad}
                                                            </span>
                                                        ) : (
                                                            <span className="winner">{match.winner.ad}</span>
                                                        )}
                                                        <span className="score">{match.player1Score} - {match.player2Score}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="group-standings">
                                        <h5>Puan Durumu</h5>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Oyuncu</th>
                                                    <th>O</th>
                                                    <th>G</th>
                                                    <th>M</th>
                                                    <th>P</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {group.standings.map((standing, index) => (
                                                    <tr key={index}>
                                                        <td>{standing.player.ad}</td>
                                                        <td>{standing.played}</td>
                                                        <td>{standing.won}</td>
                                                        <td>{standing.lost}</td>
                                                        <td>{standing.points}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}

                            {isAdminAuthenticated && (
                                <button 
                                    className="next-round-btn"
                                    onClick={startEliminationPhase}
                                    disabled={currentTournament.groups.some(group => 
                                        group.matches.some(match => !match.isPlayed)
                                    )}
                                >
                                    Eleme Turuna Geç
                                </button>
                            )}
                        </>
                    ) : (
                        // Eleme turu
                        <>
                            {currentTournament.eliminationRounds && currentTournament.eliminationRounds.length > 0 ? (
                                currentTournament.eliminationRounds.map((round, roundIndex) => (
                                    <div key={roundIndex} className="elimination-round">
                                        <h4>Eleme Turu {roundIndex + 1}</h4>
                                        {round.map(match => (
                                            <div key={match.id} className="match-item">
                                                <div className="match-players">
                                                    <span>{match.player1.ad}</span>
                                                    <span>vs</span>
                                                    <span>{match.player2 ? match.player2.ad : 'Bay'}</span>
                                                </div>
                                                
                                                {!match.isPlayed ? (
                                                    <div className="match-inputs">
                                                        {isAdminAuthenticated ? (
                                                            <>
                                                                <input
                                                                    type="number"
                                                                    placeholder="Skor 1"
                                                                    value={match.player1Score || ''}
                                                                    onChange={(e) => {
                                                                        setTournaments(prev => {
                                                                            const newTournaments = { ...prev };
                                                                            const tournament = newTournaments[selectedGender];
                                                                            const currentRound = tournament.eliminationRounds[tournament.currentRound - 1];
                                                                            if (currentRound) {
                                                                                const matchToUpdate = currentRound.find(m => m.id === match.id);
                                                                                if (matchToUpdate) {
                                                                                    matchToUpdate.player1Score = e.target.value;
                                                                                }
                                                                            }
                                                                            return newTournaments;
                                                                        });
                                                                    }}
                                                                />
                                                                <span>-</span>
                                                                <input
                                                                    type="number"
                                                                    placeholder="Skor 2"
                                                                    value={match.player2Score || ''}
                                                                    onChange={(e) => {
                                                                        setTournaments(prev => {
                                                                            const newTournaments = { ...prev };
                                                                            const tournament = newTournaments[selectedGender];
                                                                            const currentRound = tournament.eliminationRounds[tournament.currentRound - 1];
                                                                            if (currentRound) {
                                                                                const matchToUpdate = currentRound.find(m => m.id === match.id);
                                                                                if (matchToUpdate) {
                                                                                    matchToUpdate.player2Score = e.target.value;
                                                                                }
                                                                            }
                                                                            return newTournaments;
                                                                        });
                                                                    }}
                                                                />
                                                            </>
                                                        ) : (
                                                            <div className="score-display">
                                                                <span className="score-placeholder">Skor girişi için yetki gerekli</span>
                                                            </div>
                                                        )}
                                                        {isAdminAuthenticated && (
                                                            <button 
                                                                className="confirm-score-btn"
                                                                onClick={() => updateMatchResult('elimination', match.id, match.player1Score, match.player2Score)}
                                                                disabled={!match.player1Score || !match.player2Score}
                                                            >
                                                                Onayla
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="match-result">
                                                        {isAdminAuthenticated ? (
                                                            <span 
                                                                className="winner editable" 
                                                                onClick={() => {
                                                                    setTournaments(prev => {
                                                                        const newTournaments = { ...prev };
                                                                        const tournament = newTournaments[selectedGender];
                                                                        const currentRound = tournament.eliminationRounds[tournament.currentRound - 1];
                                                                        if (currentRound) {
                                                                            const matchToUpdate = currentRound.find(m => m.id === match.id);
                                                                            if (matchToUpdate) {
                                                                                matchToUpdate.isPlayed = false;
                                                                                matchToUpdate.winner = null;
                                                                                matchToUpdate.player1Score = null;
                                                                                matchToUpdate.player2Score = null;
                                                                            }
                                                                        }
                                                                        return newTournaments;
                                                                    });
                                                                }}
                                                                title="Skoru düzenlemek için tıklayın"
                                                            >
                                                                {match.winner.ad}
                                                            </span>
                                                        ) : (
                                                            <span className="winner">{match.winner.ad}</span>
                                                        )}
                                                        <span className="score">{match.player1Score} - {match.player2Score}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ))
                            ) : (
                                <div className="no-elimination-rounds">
                                    <p>Henüz eleme turu başlamadı.</p>
                                </div>
                            )}

                            {currentTournament.eliminationRounds && currentTournament.eliminationRounds.length > 0 && (
                                isAdminAuthenticated && (
                                    <button 
                                        className="next-round-btn"
                                        onClick={createNextEliminationRound}
                                        disabled={!currentTournament.eliminationRounds[currentTournament.currentRound - 1] || currentTournament.eliminationRounds[currentTournament.currentRound - 1].some(match => !match.isPlayed)}
                                    >
                                        Sonraki Tur
                                    </button>
                                )
                            )}

                            {/* Competition Bölümü */}
                            {currentTournament.competitionRounds && currentTournament.competitionRounds.length > 0 && !currentTournament.competitionCompleted && (
                                <div className="competition-section">
                                    <h4>🏆 Competition (İkinci Şans)</h4>
                                    {currentTournament.competitionRounds.map((round, roundIndex) => (
                                        <div key={roundIndex} className="competition-round">
                                            <h5>Competition Turu {roundIndex + 1}</h5>
                                            {round.map(match => (
                                                <div key={match.id} className="match-item">
                                                    <div className="match-players">
                                                        <span>{match.player1.ad}</span>
                                                        <span>vs</span>
                                                        <span>{match.player2 ? match.player2.ad : 'Bay'}</span>
                                                    </div>
                                                    
                                                    {!match.isPlayed ? (
                                                        <div className="match-inputs">
                                                            {isAdminAuthenticated ? (
                                                                <>
                                                                    <input
                                                                        type="number"
                                                                        placeholder="Skor 1"
                                                                        value={match.player1Score || ''}
                                                                        onChange={(e) => {
                                                                            setTournaments(prev => {
                                                                                const newTournaments = { ...prev };
                                                                                const tournament = newTournaments[selectedGender];
                                                                                const currentRound = tournament.competitionRounds[roundIndex];
                                                                                if (currentRound) {
                                                                                    const matchToUpdate = currentRound.find(m => m.id === match.id);
                                                                                    if (matchToUpdate) {
                                                                                        matchToUpdate.player1Score = e.target.value;
                                                                                    }
                                                                                }
                                                                                return newTournaments;
                                                                            });
                                                                        }}
                                                                    />
                                                                    <span>-</span>
                                                                    <input
                                                                        type="number"
                                                                        placeholder="Skor 2"
                                                                        value={match.player2Score || ''}
                                                                        onChange={(e) => {
                                                                            setTournaments(prev => {
                                                                                const newTournaments = { ...prev };
                                                                                const tournament = newTournaments[selectedGender];
                                                                                const currentRound = tournament.competitionRounds[roundIndex];
                                                                                if (currentRound) {
                                                                                    const matchToUpdate = currentRound.find(m => m.id === match.id);
                                                                                    if (matchToUpdate) {
                                                                                        matchToUpdate.player2Score = e.target.value;
                                                                                    }
                                                                                }
                                                                                return newTournaments;
                                                                            });
                                                                        }}
                                                                    />
                                                                </>
                                                            ) : (
                                                                <div className="score-display">
                                                                    <span className="score-placeholder">Skor girişi için yetki gerekli</span>
                                                                </div>
                                                            )}
                                                            {isAdminAuthenticated && (
                                                                <button 
                                                                    className="confirm-score-btn"
                                                                    onClick={() => updateMatchResult('competition', match.id, match.player1Score, match.player2Score)}
                                                                    disabled={!match.player1Score || !match.player2Score}
                                                                >
                                                                    Onayla
                                                                </button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="match-result">
                                                            {isAdminAuthenticated ? (
                                                                <span 
                                                                    className="winner editable" 
                                                                    onClick={() => {
                                                                        setTournaments(prev => {
                                                                            const newTournaments = { ...prev };
                                                                            const tournament = newTournaments[selectedGender];
                                                                            const currentRound = tournament.competitionRounds[roundIndex];
                                                                            if (currentRound) {
                                                                                const matchToUpdate = currentRound.find(m => m.id === match.id);
                                                                                if (matchToUpdate) {
                                                                                    matchToUpdate.isPlayed = false;
                                                                                    matchToUpdate.winner = null;
                                                                                    matchToUpdate.player1Score = null;
                                                                                    matchToUpdate.player2Score = null;
                                                                                }
                                                                            }
                                                                            return newTournaments;
                                                                        });
                                                                    }}
                                                                    title="Skoru düzenlemek için tıklayın"
                                                                >
                                                                    {match.winner.ad}
                                                                </span>
                                                            ) : (
                                                                <span className="winner">{match.winner.ad}</span>
                                                            )}
                                                            <span className="score">{match.player1Score} - {match.player2Score}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ))}

                                    {currentTournament.competitionRounds && currentTournament.competitionRounds.length > 0 && (
                                        isAdminAuthenticated && (
                                            <button 
                                                className="next-competition-btn"
                                                onClick={createNextCompetitionRound}
                                                disabled={!currentTournament.competitionRounds[currentTournament.competitionRounds.length - 1] || currentTournament.competitionRounds[currentTournament.competitionRounds.length - 1].some(match => !match.isPlayed)}
                                            >
                                                Sonraki Competition Turu
                                            </button>
                                        )
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            ) : null}
        </div>
    );
}

export default AdminDashboard; 