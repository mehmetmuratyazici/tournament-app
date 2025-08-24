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
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('18:00');
    const [showCourtSchedule, setShowCourtSchedule] = useState(false);
    const [courtSchedule, setCourtSchedule] = useState(() => {
        const saved = localStorage.getItem('courtSchedule');
        return saved ? JSON.parse(saved) : {};
    });
    const [matchSwapMode, setMatchSwapMode] = useState(false);
    const [selectedMatchForSwap, setSelectedMatchForSwap] = useState(null);
    const [targetEmptySlot, setTargetEmptySlot] = useState(null);
    
    // Eleme turu swap state'leri
    const [eliminationSwapMode, setEliminationSwapMode] = useState(false);
    const [selectedEliminationPlayer, setSelectedEliminationPlayer] = useState(null);
    const [collapsedTimeSlots, setCollapsedTimeSlots] = useState(() => {
        const saved = localStorage.getItem('collapsedTimeSlots');
        return saved ? JSON.parse(saved) : {};
    });
    
    // Date-based planning state
    const [showDateSchedule, setShowDateSchedule] = useState(false);
    const [startDate, setStartDate] = useState(() => {
        const today = new Date().toISOString().split('T')[0];
        return today;
    });
    const [endDate, setEndDate] = useState(() => {
        const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        return nextWeek;
    });
    const [weekdayStartTime, setWeekdayStartTime] = useState('18:00');
    const [weekdayEndTime, setWeekdayEndTime] = useState('22:00');
    const [weekendStartTime, setWeekendStartTime] = useState('09:00');
    const [weekendEndTime, setWeekendEndTime] = useState('18:00');
    const [dateBasedSchedule, setDateBasedSchedule] = useState(() => {
        const saved = localStorage.getItem('dateBasedSchedule');
        return saved ? JSON.parse(saved) : {};
          });
      
      // League system state
      const [currentLeague, setCurrentLeague] = useState('all');
      const [leagues, setLeagues] = useState([]);
      
      // Extract leagues from registered users
      useEffect(() => {
          if (registeredUsers && registeredUsers.length > 0) {
              const leagueValues = registeredUsers.map(user => user.league);
              const uniqueLeagues = [...new Set(leagueValues.filter(Boolean))];
              setLeagues(uniqueLeagues.sort());
          }
      }, [registeredUsers]);
      
      // Safe string capitalization helper
      const capitalizeLeague = (league) => {
          if (!league || typeof league !== 'string') {
              return 'Bilinmeyen Lig';
          }
          return league.charAt(0).toUpperCase() + league.slice(1);
      };
      
      // Safe league normalization helper
      const normalizeLeague = (league) => {
          return league && typeof league === 'string' ? league.toLowerCase() : league;
      };
      
      // Initialize tournament structure for each league
      const initializeTournamentForLeague = (league) => {
          return {
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
              isCompleted: false,
              league: league
          };
      };
      
      // Ensure tournament structure exists for all leagues
      useEffect(() => {
          if (leagues.length > 0) {
              setTournaments(prev => {
                  const newTournaments = { ...prev };
                  leagues.forEach(league => {
                      if (!newTournaments[league]) {
                          newTournaments[league] = initializeTournamentForLeague(league);
                      }
                  });
                  return newTournaments;
              });
          }
      }, [leagues]);
      
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
                 return savedTournaments ? JSON.parse(savedTournaments) : {};
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

    // Removed currentLeague - using currentLeague instead
    const [groupSize, setGroupSize] = useState(4);
    const [showCreateTournament, setShowCreateTournament] = useState(false);

    // Turnuva oluştur
    const createTournament = (league) => {
        if (!league) {
            alert('Lig seçimi yapılmalıdır!');
            return;
        }

        const normalizedLeague = normalizeLeague(league);
        const leagueUsers = registeredUsers.filter(user => user.league === normalizedLeague);
        
        if (leagueUsers.length < 3) {
            alert(`${capitalizeLeague(league)} liginde en az 3 katılımcı gereklidir!`);
            return;
        }

        // Akıllı grup oluşturma
        const shuffledUsers = [...leagueUsers].sort(() => Math.random() - 0.5);
        const groups = createSmartGroups(shuffledUsers, groupSize);

        setTournaments(prev => ({
            ...prev,
            [league]: {
                ...prev[league],
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
            const tournament = newTournaments[currentLeague];
            if (!tournament) return prev;
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
                newTournaments[currentLeague] = {
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
                newTournaments[currentLeague] = {
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
        // Tüm liglerde oynanmamış maç var mı kontrol et
        const allUnplayedMatches = getAllUnplayedMatchesFromAllLeagues();
        
        if (allUnplayedMatches.length > 0) {
            const leagueBreakdown = allUnplayedMatches.reduce((acc, match) => {
                acc[match.league] = (acc[match.league] || 0) + 1;
                return acc;
            }, {});
            
            const leagueList = Object.entries(leagueBreakdown)
                .map(([league, count]) => `${league}: ${count} maç`)
                .join('\n');
            
            alert(`⚠️ ELEME TURUNA GEÇİLEMEZ!\n\n` +
                  `📋 Henüz oynanmamış maçlar var:\n\n` +
                  `${leagueList}\n\n` +
                  `🔄 Lütfen tüm maçları tamamlayın veya çizelgeyi sıfırlayın!`);
            return;
        }
        
        // Sadece mevcut lig için eleme turu oluştur
        const tournament = tournaments[currentLeague];
        if (!tournament) return;
        
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
            [currentLeague]: {
                ...prev[currentLeague],
                phase: 'elimination',
                eliminationRounds: [eliminationMatches],
                competitionRounds: competitionMatches.length > 0 ? [competitionMatches] : [],
                currentRound: 1
            }
        }));
        
        // Eleme turuna geçildiğinde mevcut çizelgeyi sıfırla
        console.log('🔄 Eleme turuna geçildi - Mevcut çizelge sıfırlanıyor...');
        
        // Court schedule'ı sıfırla
        setCourtSchedule({});
        localStorage.removeItem('courtSchedule');
        
        // Date-based schedule'ı sıfırla
        setDateBasedSchedule({});
        localStorage.removeItem('dateBasedSchedule');
        
        // Collapsed time slots'ı sıfırla
        setCollapsedTimeSlots({});
        localStorage.removeItem('collapsedTimeSlots');
        
        // Swap modlarını sıfırla
        setMatchSwapMode(false);
        setSelectedMatchForSwap(null);
        setTargetEmptySlot(null);
        
        // Çizelge görünümlerini kapat
        setShowCourtSchedule(false);
        
        console.log('✅ Çizelge sıfırlandı - Eleme turu maçları için yeni çizelge oluşturabilirsiniz');
        
        // Kullanıcıya bilgi ver
        alert(`🏆 ELEME TURUNA GEÇİLDİ!\n\n` +
              `✅ ${qualifiedPlayers.length} oyuncu eleme turunda\n` +
              `🏅 ${eliminatedPlayers.length} oyuncu competition turunda\n\n` +
              `📋 Mevcut çizelge sıfırlandı.\n` +
              `🔄 Eleme turu maçları için yeni çizelge oluşturun!\n\n` +
              `💡 İpucu: Tarih aralığı seçip "Çizelge Oluştur" butonuna tıklayarak eleme turu maçlarını planlayabilirsiniz.`);
    };



    // Eleme turunda oyuncular arası yer değiştirme (farklı maçlar arası)
    const swapEliminationPlayersBetweenMatches = (player1, player2, match1Id, match2Id) => {
        if (!isAdminAuthenticated) {
            alert('Bu işlem için admin yetkisi gereklidir!');
            return;
        }

        const tournament = tournaments[currentLeague];
        if (!tournament || !tournament.eliminationRounds) return;

        // Maçları bul
        let match1 = null;
        let match2 = null;
        let round1Index = -1;
        let round2Index = -1;
        let match1Index = -1;
        let match2Index = -1;

        for (let r = 0; r < tournament.eliminationRounds.length; r++) {
            const round = tournament.eliminationRounds[r];
            for (let m = 0; m < round.length; m++) {
                if (round[m].id === match1Id) {
                    match1 = round[m];
                    round1Index = r;
                    match1Index = m;
                }
                if (round[m].id === match2Id) {
                    match2 = round[m];
                    round2Index = r;
                    match2Index = m;
                }
            }
        }

        if (!match1 || !match2) {
            alert('Maç bulunamadı!');
            return;
        }

        if (match1.isPlayed || match2.isPlayed) {
            alert('Oynanmış maçlarda oyuncu değişikliği yapılamaz!');
            return;
        }

        // Oyuncuları değiştir
        if (match1.player1 === player1) {
            match1.player1 = player2;
        } else if (match1.player2 === player1) {
            match1.player2 = player2;
        }

        if (match2.player1 === player2) {
            match2.player1 = player1;
        } else if (match2.player2 === player2) {
            match2.player2 = player1;
        }

        // State'i güncelle
        setTournaments(prev => ({
            ...prev,
            [currentLeague]: {
                ...prev[currentLeague],
                eliminationRounds: [...prev[currentLeague].eliminationRounds]
            }
        }));

        console.log(`🔄 Eleme maçları arası oyuncu değiştirildi: ${player1.ad} ↔ ${player2.ad}`);
    };

    // Eleme turunda oyuncu seçme fonksiyonu
    const handleEliminationPlayerSelect = (player, matchId) => {
        if (!isAdminAuthenticated) return;
        
        if (!eliminationSwapMode) {
            // İlk oyuncu seçildi
            setSelectedEliminationPlayer({ player, matchId });
            setEliminationSwapMode(true);
            console.log(`🎯 Eleme oyuncusu seçildi: ${player.ad} (Maç: ${matchId})`);
        } else {
            // İkinci oyuncu seçildi
            if (selectedEliminationPlayer.matchId === matchId && selectedEliminationPlayer.player.tcKimlik === player.tcKimlik) {
                // Aynı oyuncu seçildi, iptal et
                setEliminationSwapMode(false);
                setSelectedEliminationPlayer(null);
                console.log('❌ Aynı oyuncu seçildi, swap iptal edildi');
            } else {
                // Farklı oyuncu seçildi, değiştir
                swapEliminationPlayersBetweenMatches(
                    selectedEliminationPlayer.player, 
                    player, 
                    selectedEliminationPlayer.matchId, 
                    matchId
                );
                // Swap modunu kapat
                setEliminationSwapMode(false);
                setSelectedEliminationPlayer(null);
            }
        }
    };

    // Sonraki eleme turu için fikstür oluştur
    const createNextEliminationRound = () => {
        const tournament = tournaments[currentLeague];
        if (!tournament) return;
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
                [currentLeague]: {
                    ...prev[currentLeague],
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
            [currentLeague]: {
                ...prev[currentLeague],
                eliminationRounds: [...prev[currentLeague].eliminationRounds, newEliminationMatches],
                currentRound: prev[currentLeague].currentRound + 1
            }
        }));
        
        // Yeni eleme turu oluşturulduğunda çizelgeyi sıfırla
        console.log('🔄 Yeni eleme turu oluşturuldu - Çizelge sıfırlanıyor...');
        
        // Court schedule'ı sıfırla
        setCourtSchedule({});
        localStorage.removeItem('courtSchedule');
        
        // Date-based schedule'ı sıfırla
        setDateBasedSchedule({});
        localStorage.removeItem('dateBasedSchedule');
        
        // Collapsed time slots'ı sıfırla
        setCollapsedTimeSlots({});
        localStorage.removeItem('collapsedTimeSlots');
        
        // Swap modlarını sıfırla
        setMatchSwapMode(false);
        setSelectedMatchForSwap(null);
        setTargetEmptySlot(null);
        
        // Çizelge görünümlerini kapat
        setShowCourtSchedule(false);
        
        console.log('✅ Çizelge sıfırlandı - Yeni eleme turu maçları için çizelge oluşturabilirsiniz');
        
        // Kullanıcıya bilgi ver
        alert(`🏆 YENİ ELEME TURU OLUŞTURULDU!\n\n` +
              `📋 Mevcut çizelge sıfırlandı.\n` +
              `🔄 Yeni eleme turu maçları için çizelge oluşturun!`);
    };

    // Sonraki competition turu için fikstür oluştur
    const createNextCompetitionRound = () => {
        const tournament = tournaments[currentLeague];
        if (!tournament) return;
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
                [currentLeague]: {
                    ...prev[currentLeague],
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
            [currentLeague]: {
                ...prev[currentLeague],
                competitionRounds: [...prev[currentLeague].competitionRounds, newCompetitionMatches]
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
        const tournament = tournaments[currentLeague];
        if (!tournament) return;
        const hasPlayedMatches = tournament.groups.some(group => 
            group.matches.some(match => match.isPlayed)
        );

        if (hasPlayedMatches) {
            alert('Maçlar başladıktan sonra oyuncu değişikliği yapılamaz!');
            return;
        }

        setTournaments(prev => {
            const newTournaments = { ...prev };
            const tournament = newTournaments[currentLeague];
            
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
    // Sadece Tarih Aralığı - Tek gün özelliği kaldırıldı
    const assignCourtsAndSchedule = () => {
        if (!isAdminAuthenticated) {
            alert('Bu işlem için admin yetkisi gereklidir!');
            return;
        }

        // Sadece tarih aralığı seçilmişse planlama yap
        if (startDate && endDate) {
            createDateBasedSchedule();
            return;
        }

        // Tarih aralığı seçilmemişse uyarı ver
        alert('Lütfen başlangıç ve bitiş tarihi seçin!');
        return;
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
        if (!isAdminAuthenticated) return;
        
        // Eğer boş kort seçilmişse, bu maçı oraya taşı
        if (targetEmptySlot) {
            const sourceMatchInfo = { timeSlot, courtId, match };
            handleMoveToEmptySlot(targetEmptySlot.timeSlot, targetEmptySlot.courtId, sourceMatchInfo);
            setTargetEmptySlot(null);
            setMatchSwapMode(false);
            return;
        }
        
        // Swap mode aktif değilse, aktifleştir
        if (!matchSwapMode) {
            setMatchSwapMode(true);
            setSelectedMatchForSwap({ timeSlot, courtId, match });
            console.log(`🔄 Swap modu aktifleştirildi: ${match.player1.ad} vs ${match.player2.ad} seçildi`);
            return;
        }
        
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

    // Seçilen maçı boş slota taşı
    const handleMoveToEmptySlot = (targetTimeSlot, targetCourtId, sourceMatchInfo = null) => {
        const matchToMove = sourceMatchInfo || selectedMatchForSwap;
        if (!matchToMove) return;

        const updatedSchedule = { ...courtSchedule };
        
        // Seçilen maçı kaynak yerden kaldır
        const sourceSlot = updatedSchedule[matchToMove.timeSlot];
        if (sourceSlot && sourceSlot.courts[matchToMove.courtId]) {
            delete sourceSlot.courts[matchToMove.courtId];
        }
        
        // Maçı hedef yere taşı
        if (!updatedSchedule[targetTimeSlot]) {
            updatedSchedule[targetTimeSlot] = {
                startTime: targetTimeSlot,
                endTime: minutesToTime(timeToMinutes(targetTimeSlot) + 60),
                courts: {}
            };
        }
        
        updatedSchedule[targetTimeSlot].courts[targetCourtId] = {
            match: matchToMove.match
        };
        
        setCourtSchedule(updatedSchedule);
        localStorage.setItem('courtSchedule', JSON.stringify(updatedSchedule));
        
        console.log(`📍 Maç taşındı: ${matchToMove.match.player1.ad} vs ${matchToMove.match.player2.ad}`);
        console.log(`   ${matchToMove.timeSlot} ${matchToMove.courtId} → ${targetTimeSlot} ${targetCourtId}`);
        
        setSelectedMatchForSwap(null);
    };
    
    // Boş kort'a tıklama fonksiyonu (maç atama için)
    const handleEmptyCourtClick = (timeSlot, courtId) => {
        if (!isAdminAuthenticated) return;
        
        // Swap mode'u aktifleştir ve boş kort'u hedef olarak işaretle
        setMatchSwapMode(true);
        setTargetEmptySlot({ timeSlot, courtId });
        
        console.log(`📍 Boş kort seçildi: ${timeSlot} - ${courtId}`);
        console.log(`🔄 Swap modu aktifleştirildi - Bu korta maç atamak için başka bir maç seçin`);
    };
    

    
    // Tarih bazlı çizelgede maç değiştirme fonksiyonu
    const swapDateScheduleMatches = (match1Info, match2Info) => {
        if (!isAdminAuthenticated || !match1Info || !match2Info) {
            alert('Bu işlem için admin yetkisi gereklidir!');
            return;
        }

        try {
            const newSchedule = { ...dateBasedSchedule };
            
            // İlk maçın yerini al
            const date1 = match1Info.date;
            const time1 = match1Info.timeSlot;
            const court1 = match1Info.courtId;
            
            // Güvenli kontroller
            if (!newSchedule[date1] || !newSchedule[date1].timeSlots || !newSchedule[date1].timeSlots[time1] || !newSchedule[date1].timeSlots[time1].courts || !newSchedule[date1].timeSlots[time1].courts[court1]) {
                console.error('İlk maç bilgisi bulunamadı:', { date1, time1, court1 });
                return;
            }
            
            const match1 = newSchedule[date1].timeSlots[time1].courts[court1].match;
            
            // İkinci maçın yerini al
            const date2 = match2Info.date;
            const time2 = match2Info.timeSlot;
            const court2 = match2Info.courtId;
            
            // Güvenli kontroller
            if (!newSchedule[date2] || !newSchedule[date2].timeSlots || !newSchedule[date2].timeSlots[time2] || !newSchedule[date2].timeSlots[time2].courts || !newSchedule[date2].timeSlots[time2].courts[court2]) {
                console.error('İkinci maç bilgisi bulunamadı:', { date2, time2, court2 });
                return;
            }
            
            const match2 = newSchedule[date2].timeSlots[time2].courts[court2].match;
            
            // Maçları yer değiştir
            newSchedule[date1].timeSlots[time1].courts[court1].match = match2;
            newSchedule[date2].timeSlots[time2].courts[court2].match = match1;
            
            setDateBasedSchedule(newSchedule);
            setMatchSwapMode(false);
            setSelectedMatchForSwap(null);
            
            console.log('Tarih bazlı çizelgede maçlar değiştirildi:', {
                match1: match1 ? `${typeof match1.player1 === 'object' ? match1.player1.ad : match1.player1} vs ${typeof match1.player2 === 'object' ? match1.player2.ad : match1.player2}` : 'N/A',
                match2: match2 ? `${typeof match2.player1 === 'object' ? match2.player1.ad : match2.player1} vs ${typeof match2.player2 === 'object' ? match2.player2.ad : match2.player2}` : 'N/A',
                oldPositions: { date1, time1, court1, date2, time2, court2 }
            });
        } catch (error) {
            console.error('Maç değiştirme hatası:', error);
            alert('Maç değiştirme sırasında bir hata oluştu!');
        }
    };
    
    // Tarih bazlı çizelgede boş kort'a tıklama fonksiyonu
    const handleEmptyCourtClickDateSchedule = (date, timeSlot, courtId) => {
        if (!isAdminAuthenticated) return;
        
        // Eğer zaten swap modu aktifse ve maç seçilmişse, bu boş korta taşı
        if (matchSwapMode && selectedMatchForSwap) {
            console.log(`📍 Seçilen maç boş korta taşınıyor: ${selectedMatchForSwap.match.player1.ad} vs ${selectedMatchForSwap.match.player2.ad}`);
            handleMoveToEmptySlotDateSchedule(date, timeSlot, courtId, selectedMatchForSwap);
            return;
        }
        
        // Swap mode'u aktifleştir ve boş kort'u hedef olarak işaretle
        setMatchSwapMode(true);
        setTargetEmptySlot({ date, timeSlot, courtId });
        
        console.log(`📍 Boş kort seçildi: ${date} ${timeSlot} - ${courtId}`);
        console.log(`🔄 Swap modu aktifleştirildi - Bu korta maç atamak için başka bir maç seçin`);
    };
    
    // Tarih bazlı çizelgede seçilen maçı boş slota taşı
    const handleMoveToEmptySlotDateSchedule = (targetDate, targetTimeSlot, targetCourtId, sourceMatchInfo) => {
        if (!sourceMatchInfo) {
            console.error('Taşınacak maç bilgisi eksik!');
            return;
        }
        
        const matchToMove = sourceMatchInfo;

        try {
            // State'i güncelle
            setDateBasedSchedule(prevSchedule => {
                const updatedSchedule = { ...prevSchedule };
                
                // Kaynak maçı kaldır
                const sourceDate = matchToMove.date;
                const sourceTimeSlot = matchToMove.timeSlot;
                const sourceCourtId = matchToMove.courtId;
                
                if (updatedSchedule[sourceDate] && updatedSchedule[sourceDate].timeSlots && updatedSchedule[sourceDate].timeSlots[sourceTimeSlot] && updatedSchedule[sourceDate].timeSlots[sourceTimeSlot].courts && updatedSchedule[sourceDate].timeSlots[sourceTimeSlot].courts[sourceCourtId]) {
                    delete updatedSchedule[sourceDate].timeSlots[sourceTimeSlot].courts[sourceCourtId].match;
                }
                
                // Hedef slota maçı ekle
                if (!updatedSchedule[targetDate]) {
                    updatedSchedule[targetDate] = { date: targetDate, timeSlots: {} };
                }
                if (!updatedSchedule[targetDate].timeSlots[targetTimeSlot]) {
                    updatedSchedule[targetDate].timeSlots[targetTimeSlot] = { startTime: targetTimeSlot, endTime: minutesToTime(timeToMinutes(targetTimeSlot) + 60), courts: {} };
                }
                if (!updatedSchedule[targetDate].timeSlots[targetTimeSlot].courts[targetCourtId]) {
                    updatedSchedule[targetDate].timeSlots[targetTimeSlot].courts[targetCourtId] = { courtId: targetCourtId, courtName: courts.find(c => c.id === targetCourtId)?.name };
                }
                
                updatedSchedule[targetDate].timeSlots[targetTimeSlot].courts[targetCourtId].match = matchToMove.match;
                
                return updatedSchedule;
            });
            
            // State'leri temizle
            setSelectedMatchForSwap(null);
            setMatchSwapMode(false);
            setTargetEmptySlot(null);
            
            console.log(`📍 Maç taşındı: ${matchToMove.match.player1.ad} vs ${matchToMove.match.player2.ad}`);
            console.log(`   ${matchToMove.date} ${matchToMove.timeSlot} ${matchToMove.courtId} → ${targetDate} ${targetTimeSlot} ${targetCourtId}`);
        } catch (error) {
            console.error('Maç taşıma hatası:', error);
            alert('Maç taşıma sırasında bir hata oluştu!');
        }
    };
    
    // Tarih bazlı çizelgede maç seçme fonksiyonu
    const handleDateScheduleMatchSelect = (date, timeSlot, courtId, match) => {
        if (!isAdminAuthenticated) return;
        
        // Eğer swap modu aktif değilse, aktifleştir
        if (!matchSwapMode) {
            setMatchSwapMode(true);
            setSelectedMatchForSwap({ date, timeSlot, courtId, match });
            console.log(`🎯 Maç seçildi: ${match.player1.ad} vs ${match.player2.ad}`);
            console.log(`🔄 Swap modu aktifleştirildi - Değiştirmek istediğiniz ikinci maçı seçin`);
            return;
        }
        
        // Eğer boş kort hedef olarak seçilmişse
        if (targetEmptySlot) {
            const sourceMatchInfo = { date, timeSlot, courtId, match };
            handleMoveToEmptySlotDateSchedule(targetEmptySlot.date, targetEmptySlot.timeSlot, targetEmptySlot.courtId, sourceMatchInfo);
            return;
        }
        
        if (!match) return;
        
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
                setTargetEmptySlot(null);
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
    
    // Tarih bazlı çizelgede time slot toggle fonksiyonu
    const toggleDateTimeSlot = (date, timeSlot) => {
        const key = `${date}-${timeSlot}`;
        setCollapsedTimeSlots(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };
    
    // Tarih bazlı çizelgede gün toggle fonksiyonu
    const toggleDay = (date) => {
        const key = `day-${date}`;
        setCollapsedTimeSlots(prev => ({
            ...prev,
            [key]: !prev[key]
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
    
    // Tarih bazlı çizelge için collapse all fonksiyonu
    const collapseAllDateSchedule = () => {
        if (!dateBasedSchedule || Object.keys(dateBasedSchedule).length === 0) return;
        
        const allCollapsed = {};
        
        // Tüm günleri kapat
        Object.values(dateBasedSchedule).forEach(daySchedule => {
            allCollapsed[`day-${daySchedule.date}`] = true;
            
            // Her günün tüm saat dilimlerini de kapat
            Object.keys(daySchedule.timeSlots).forEach(timeSlot => {
                allCollapsed[`${daySchedule.date}-${timeSlot}`] = true;
            });
        });
        
        setCollapsedTimeSlots(allCollapsed);
    };
    
    // Tarih bazlı çizelge için expand all fonksiyonu
    const expandAllDateSchedule = () => {
        setCollapsedTimeSlots({});
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
    
    // TÜM LİGLERDEKİ oynanmamış maçları getir
    const getAllUnplayedMatchesFromAllLeagues = () => {
        let allUnplayedMatches = [];
        
        // tournaments undefined kontrolü
        if (!tournaments || typeof tournaments !== 'object') {
            console.warn('Tournaments objesi bulunamadı');
            return allUnplayedMatches;
        }
        
        // Tüm liglerdeki aktif turnuvaları kontrol et
        Object.entries(tournaments).forEach(([league, tournament]) => {
            if (!tournament || !tournament.isActive) return;
            
            // Grup maçları
            if (tournament.groups && Array.isArray(tournament.groups) && tournament.groups.length > 0) {
                tournament.groups.forEach((group) => {
                    if (group && group.matches && Array.isArray(group.matches)) {
                        group.matches.forEach((match) => {
                            if (match && match.player1 && match.player2 && !match.isPlayed) {
                                allUnplayedMatches.push({
                                    id: `${league}-group-${group.id}-${match.id}`,
                                    type: 'group',
                                    league: league,
                                    groupId: group.id,
                                    player1: match.player1,
                                    player2: match.player2,
                                    isPlayed: false
                                });
                            }
                        });
                    }
                });
            }
            
            // Eleme maçları
            if (tournament.eliminationRounds && Array.isArray(tournament.eliminationRounds) && tournament.eliminationRounds.length > 0) {
                tournament.eliminationRounds.forEach((round, roundIndex) => {
                    if (round && round.matches && Array.isArray(round.matches)) {
                        round.matches.forEach((match) => {
                            if (match && match.player1 && match.player2 && !match.isPlayed) {
                                allUnplayedMatches.push({
                                    id: `${league}-elimination-${roundIndex}-${match.id}`,
                                    type: 'elimination',
                                    league: league,
                                    roundIndex: roundIndex,
                                    player1: match.player1,
                                    player2: match.player2,
                                    isPlayed: false
                                });
                            }
                        });
                    }
                });
            }
            
            // Competition maçları
            if (tournament.competitionRounds && Array.isArray(tournament.competitionRounds) && tournament.competitionRounds.length > 0) {
                tournament.competitionRounds.forEach((round, roundIndex) => {
                    if (round && round.matches && Array.isArray(round.matches)) {
                        round.matches.forEach((match) => {
                            if (match && match.player1 && match.player2 && !match.isPlayed) {
                                allUnplayedMatches.push({
                                    id: `${league}-competition-${roundIndex}-${match.id}`,
                                    type: 'competition',
                                    league: league,
                                    roundIndex: roundIndex,
                                    player1: match.player1,
                                    player2: match.player2,
                                    isPlayed: false
                                });
                            }
                        });
                    }
                });
            }
        });
        
        return allUnplayedMatches;
    };
    
    // TÜM LİGLERDEKİ maçları getir (kort çizelgesi için)
    const getAllMatchesFromAllLeagues = () => {
        let allMatches = [];
        let matchIdCounter = 1;
        
        // tournaments undefined kontrolü
        if (!tournaments || typeof tournaments !== 'object') {
            console.warn('Tournaments objesi bulunamadı');
            return allMatches;
        }
        
        console.log('🔍 getAllMatchesFromAllLeagues başladı, tournaments:', tournaments);
        
        // Hangi turda olduğumuzu belirle
        let currentPhase = 'group'; // Varsayılan olarak grup turu
        
        console.log('🔍 Tur tespiti başlıyor...');
        
        // Herhangi bir ligde eleme turu varsa, eleme turundayız
        for (const [league, tournament] of Object.entries(tournaments)) {
            console.log(`🔍 ${league} ligi eleme turu kontrolü:`, {
                isActive: tournament?.isActive,
                hasEliminationRounds: !!tournament?.eliminationRounds,
                eliminationRoundsLength: tournament?.eliminationRounds?.length || 0,
                eliminationRounds: tournament?.eliminationRounds
            });
            
            if (tournament?.isActive && tournament?.eliminationRounds && Array.isArray(tournament.eliminationRounds) && tournament.eliminationRounds.length > 0) {
                currentPhase = 'elimination';
                console.log(`🎯 ${league} liginde eleme turu bulundu, currentPhase: ${currentPhase}`);
                // Eleme turu bulundu, competition kontrol etmeye gerek yok
                break;
            }
        }
        
        // Eğer eleme turu bulunamadıysa competition turu kontrol et
        if (currentPhase !== 'elimination') {
            for (const [league, tournament] of Object.entries(tournaments)) {
                console.log(`🔍 ${league} ligi competition turu kontrolü:`, {
                    isActive: tournament?.isActive,
                    hasCompetitionRounds: !!tournament?.competitionRounds,
                    competitionRoundsLength: tournament?.competitionRounds?.length || 0,
                    competitionRounds: tournament?.competitionRounds
                });
                
                if (tournament?.isActive && tournament?.competitionRounds && Array.isArray(tournament.competitionRounds) && tournament.competitionRounds.length > 0) {
                    currentPhase = 'competition';
                    console.log(`🎯 ${league} liginde competition turu bulundu, currentPhase: ${currentPhase}`);
                    break;
                }
            }
        } else {
            console.log('🎯 Eleme turu bulundu, competition turu kontrol edilmiyor');
        }
        
        console.log(`🎯 MEVCUT TUR: ${currentPhase.toUpperCase()}`);
        
        // Tüm liglerdeki aktif turnuvaları kontrol et
        Object.entries(tournaments).forEach(([league, tournament]) => {
            console.log(`🔍 ${league} ligi kontrol ediliyor:`, {
                isActive: tournament?.isActive,
                hasGroups: !!tournament?.groups,
                hasEliminationRounds: !!tournament?.eliminationRounds,
                hasCompetitionRounds: !!tournament?.competitionRounds
            });
            
            if (!tournament || !tournament.isActive) {
                console.log(`❌ ${league} ligi aktif değil, atlanıyor`);
                return;
            }
            
            // SADECE mevcut turdaki maçları ekle
            if (currentPhase === 'group') {
                // Grup maçları
                if (tournament.groups && Array.isArray(tournament.groups) && tournament.groups.length > 0) {
                    console.log(`🏆 ${league} ligi grup maçları:`, tournament.groups.length);
                    tournament.groups.forEach((group) => {
                        if (group && group.matches && Array.isArray(group.matches)) {
                            group.matches.forEach((match) => {
                                if (match && match.player1 && match.player2) { // Sadece iki oyunculu maçları dahil et
                                    allMatches.push({
                                        id: `${league}-group-${group.id}-${match.id}`,
                                        displayId: matchIdCounter++,
                                        type: 'group',
                                        league: league, // Lig bilgisini ekle
                                        groupId: group.id,
                                        player1: match.player1,
                                        player2: match.player2,
                                        result: match.result,
                                        isPlayed: match.isPlayed || false,
                                        round: match.round || 1
                                    });
                                }
                            });
                        }
                    });
                }
            } else if (currentPhase === 'elimination') {
                // Eleme maçları - eliminationRounds direkt maç array'i
                if (tournament.eliminationRounds && Array.isArray(tournament.eliminationRounds) && tournament.eliminationRounds.length > 0) {
                    console.log(`🥇 ${league} ligi eleme maçları:`, tournament.eliminationRounds.length);
                    console.log(`🔍 ${league} ligi eliminationRounds detayı:`, tournament.eliminationRounds);
                    
                    tournament.eliminationRounds.forEach((round, roundIndex) => {
                        console.log(`🔍 ${league} ligi ${roundIndex + 1}. tur detayı:`, {
                            round,
                            isArray: Array.isArray(round),
                            hasMatches: !!(round && round.matches),
                            roundMatchesLength: round?.matches?.length || 0
                        });
                        
                        // round direkt maç array'i olabilir veya round.matches olabilir
                        let matches = [];
                        if (Array.isArray(round)) {
                            // round direkt maç array'i
                            matches = round;
                            console.log(`  - ${roundIndex + 1}. tur:`, matches.length, 'maç (direkt array)');
                        } else if (round && round.matches && Array.isArray(round.matches)) {
                            // round.matches var
                            matches = round.matches;
                            console.log(`  - ${roundIndex + 1}. tur:`, matches.length, 'maç (round.matches)');
                        }
                        
                        console.log(`🔍 ${league} ligi ${roundIndex + 1}. tur maçları:`, matches);
                        
                        if (matches.length > 0) {
                            matches.forEach((match, matchIndex) => {
                                console.log(`🔍 ${league} ligi ${roundIndex + 1}. tur ${matchIndex + 1}. maç:`, {
                                    match,
                                    hasPlayer1: !!match?.player1,
                                    hasPlayer2: !!match?.player2,
                                    player1Name: match?.player1?.ad || 'N/A',
                                    player2Name: match?.player2?.ad || 'N/A'
                                });
                                
                                if (match && match.player1 && match.player2) {
                                    allMatches.push({
                                        id: `${league}-elimination-${roundIndex}-${match.id}`,
                                        displayId: matchIdCounter++,
                                        type: 'elimination',
                                        league: league,
                                        roundIndex: roundIndex,
                                        player1: match.player1,
                                        player2: match.player2,
                                        result: match.result,
                                        isPlayed: match.isPlayed || false,
                                        roundName: round.name || `Eleme Turu ${roundIndex + 1}`
                                    });
                                    console.log(`✅ ${league} ligi eleme maçı eklendi:`, match.player1.ad, 'vs', match.player2.ad);
                                } else {
                                    console.log(`❌ ${league} ligi eleme maçı eklenmedi (eksik oyuncu):`, match);
                                }
                            });
                        } else {
                            console.log(`⚠️ ${league} ligi ${roundIndex + 1}. turda maç bulunamadı`);
                        }
                    });
                } else {
                    console.log(`⚠️ ${league} ligi eliminationRounds yok veya boş:`, {
                        hasEliminationRounds: !!tournament.eliminationRounds,
                        isArray: Array.isArray(tournament.eliminationRounds),
                        length: tournament.eliminationRounds?.length || 0
                    });
                }
            } else if (currentPhase === 'competition') {
                // Competition maçları - competitionRounds direkt maç array'i
                if (tournament.competitionRounds && Array.isArray(tournament.competitionRounds) && tournament.competitionRounds.length > 0) {
                    console.log(`🏅 ${league} ligi competition maçları:`, tournament.competitionRounds.length);
                    tournament.competitionRounds.forEach((round, roundIndex) => {
                        // round direkt maç array'i olabilir veya round.matches olabilir
                        let matches = [];
                        if (Array.isArray(round)) {
                            // round direkt maç array'i
                            matches = round;
                            console.log(`  - ${roundIndex + 1}. tur:`, matches.length, 'maç (direkt array)');
                        } else if (round && round.matches && Array.isArray(round.matches)) {
                            // round.matches var
                            matches = round.matches;
                            console.log(`  - ${roundIndex + 1}. tur:`, matches.length, 'maç (round.matches)');
                        }
                        
                        if (matches.length > 0) {
                            matches.forEach((match) => {
                                if (match && match.player1 && match.player2) {
                                    allMatches.push({
                                        id: `${league}-competition-${roundIndex}-${match.id}`,
                                        displayId: matchIdCounter++,
                                        type: 'competition',
                                        league: league,
                                        roundIndex: roundIndex,
                                        player1: match.player1,
                                        player2: match.player2,
                                        result: match.result,
                                        isPlayed: match.isPlayed || false,
                                        roundName: round.name || `Competition Turu ${roundIndex + 1}`
                                    });
                                }
                            });
                        }
                    });
                }
            }
        });
        
        console.log(`✅ getAllMatchesFromAllLeagues tamamlandı, toplam: ${allMatches.length} maç (${currentPhase} turu)`);
        
        return allMatches;
    };

    // Tek lig için maçları getir (mevcut davranış korunsun)
    const getAllMatches = () => {
        // currentLeague null veya undefined ise boş array döndür
        if (!currentLeague || currentLeague === 'all') {
            return getAllMatchesFromAllLeagues();
        }
        
        const tournament = tournaments[currentLeague];
        if (!tournament || !tournament.isActive) return [];
        
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
        try {
            const matches = getAllMatches();
            return matches.filter(match => match && !match.isPlayed);
        } catch (error) {
            console.warn('getRemainingMatches hatası:', error);
            return [];
        }
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
        
        const allMatches = getAllMatchesFromAllLeagues();
        console.log('🔍 Çizelge oluşturma için bulunan maçlar:', allMatches);
        console.log('🔍 Maç detayları:', allMatches.map(match => ({
            id: match.id,
            type: match.type,
            league: match.league,
            players: `${match.player1?.ad || 'N/A'} vs ${match.player2?.ad || 'N/A'}`,
            isPlayed: match.isPlayed
        })));
        
        if (allMatches.length === 0) {
            alert('Planlama için hiçbir ligde maç bulunmuyor!');
            return;
        }
        
        console.log(`\n🚀 ÇİZELGE OLUŞTURMA BAŞLIYOR:`, {
            totalMatches: allMatches.length,
            startDate, 
            endDate,
            weekdayHours: `${weekdayStartTime}-${weekdayEndTime}`,
            weekendHours: `${weekendStartTime}-${weekendEndTime}`,
            leagueBreakdown: allMatches.reduce((acc, match) => {
                acc[match.league] = (acc[match.league] || 0) + 1;
                return acc;
            }, {})
        });
        
        const dateRange = getDateRange(startDate, endDate);
        const schedule = {};
        let remainingMatches = [...allMatches]; // Kopyasını al
        
        console.log(`📅 Tarih aralığı:`, dateRange.map(d => d.toISOString().split('T')[0]));
        
        // Her güne akıllı maç dağıtımı
        for (const date of dateRange) {
            
            const dateStr = date.toISOString().split('T')[0];
            const capacity = getMatchCapacityForDate(date);
            const weekend = isWeekend(date);
            
            // Bu güne yerleştirilebilecek maçları AKILLI şekilde bul
            const dayMatches = [];
            let invalidMatches = []; // const değil, let olmalı!
            
            console.log(`\n🗓️ === ${dateStr} (${date.toLocaleDateString('tr-TR', { weekday: 'long' })}) GÜNÜ İŞLENİYOR ===`);
            console.log(`📊 Kapasite: ${capacity}, Kalan maç: ${remainingMatches.length}, Mevcut çizelge:`, Object.keys(schedule));
            
            // 1. ÖNCE DİNLENME KURALI KONTROL ET
            for (let i = 0; i < remainingMatches.length; i++) {
                const match = remainingMatches[i];
                const matchPlayers = getPlayersFromMatch(match);
                
                console.log(`\n🔄 MAÇ ${i + 1}/${remainingMatches.length}: ${matchPlayers.join(' vs ')}`);
                
                // Bu maç bu güne yerleştirilebilir mi? (hem günler arası hem aynı gün kontrolü)
                const isValid = validateMatchForDate(match, date, schedule, dayMatches);
                
                console.log(`📋 Sonuç:`, {
                    players: matchPlayers,
                    isValid,
                    currentDayMatches: dayMatches.length,
                    capacity,
                    reason: isValid ? 'Uygun - Oyuncular dinlenmiş' : 'Reddedildi - Oyuncu(lar) ertesi gün dinlenmeli'
                });
                
                if (isValid) {
                    // Eğer kapasitede yer varsa ekle
                    if (dayMatches.length < capacity) {
                        dayMatches.push(match);
                        console.log(`✅ MAÇ EKLENDİ: ${matchPlayers.join(' vs ')} → ${dateStr} (${dayMatches.length}/${capacity})`);
                    } else {
                        // Kapasite doluysa geçici olarak beklet
                        invalidMatches.push(match);
                        console.log(`⏳ KAPASİTE DOLU: ${matchPlayers.join(' vs ')} beklemeye alındı`);
                    }
                } else {
                    // Uygun değilse invalid'e at
                    invalidMatches.push(match);
                    console.log(`❌ REDDEDİLDİ: ${matchPlayers.join(' vs ')} (Dinlenme kuralı)`);
                }
            }
            
            // 2. EĞER HİÇ MAÇ EKLENEMEDİYSE KURALI ESNET
            if (dayMatches.length === 0 && remainingMatches.length > 0) {
                console.log(`\n⚠️ KURAL ESNETİLİYOR: ${dateStr} günü hiç maç eklenemedi!`);
                console.log(`📋 En az 1 maç yerleştirmek için dinlenme kuralı esnetiliyor...`);
                
                // Sadece aynı gün kontrolü yap, dinlenme kuralını geç
                for (const match of remainingMatches) {
                    const matchPlayers = getPlayersFromMatch(match);
                    
                    // Sadece aynı gün içinde çakışma kontrolü
                    let sameDayConflict = false;
                    for (const existingMatch of dayMatches) {
                        const existingPlayers = getPlayersFromMatch(existingMatch);
                        if (matchPlayers.some(p => existingPlayers.includes(p))) {
                            sameDayConflict = true;
                            break;
                        }
                    }
                    
                    if (!sameDayConflict && dayMatches.length < capacity) {
                        dayMatches.push(match);
                        console.log(`🟡 ESNEK MAÇ EKLENDİ: ${matchPlayers.join(' vs ')} → ${dateStr} (Kural esnetildi)`);
                        
                        // Bir maç ekledik, yeter
                        break;
                    }
                }
                
                // Eklenen maçı invalidMatches'tan çıkar
                invalidMatches = remainingMatches.filter(m => !dayMatches.includes(m));
            }
            
            // Kullanılmayan maçları bir sonraki güne bırak
            remainingMatches = invalidMatches;
            
            // HER GÜN schedule'a ekle (boş olsa bile)
            // Böylece tarih atlaması olmaz
            
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
                timeSlots: createTimeSlotsForDay(dayMatches, dayStartTime, dayEndTime)
            };
            
            if (dayMatches.length > 0) {
                console.log(`✅ ${dateStr} GÜN TAMAMLANDI:`, {
                    addedMatches: dayMatches.length,
                    capacity: capacity,
                    remainingForNextDay: remainingMatches.length,
                    playersList: dayMatches.map(m => getPlayersFromMatch(m).join(' vs '))
                });
            } else {
                console.log(`😴 ${dateStr} DİNLENME GÜNÜ:`, {
                    addedMatches: 0,
                    capacity: capacity,
                    remainingForNextDay: remainingMatches.length,
                    reason: 'Tüm oyuncular dinlenme kuralı nedeniyle oynayamıyor'
                });
            }
            
        }
        
        // Yerleştirilemeyen maçlar varsa uyarı
        if (remainingMatches.length > 0) {
            const unscheduledCount = remainingMatches.length;
            const scheduledCount = allMatches.length - unscheduledCount;
            
            alert(`⚠️ DİNLENME KURALI UYARISI!\n\n` +
                  `✅ Yerleştirilen: ${scheduledCount} maç\n` +
                  `❌ Yerleştirilemedi: ${unscheduledCount} maç\n\n` +
                  `Sebep: Oyuncuların en az 1 gün dinlenmesi gerekiyor.\n` +
                  `Çözüm: Daha uzun tarih aralığı seçin veya hafta sonu saatlerini artırın.`);
        }
        
        console.log(`\n🎯 ÇİZELGE OLUŞTURMA TAMAMLANDI:`, {
            totalDays: Object.keys(schedule).length,
            scheduledDays: Object.keys(schedule),
            totalOriginalMatches: allMatches.length,
            unscheduledMatches: remainingMatches.length,
            successRate: `${Math.round(((allMatches.length - remainingMatches.length) / allMatches.length) * 100)}%`
        });
        
        // Her günün özeti
        Object.entries(schedule).forEach(([date, dayData]) => {
            console.log(`📊 ${date}: ${dayData.matches.length}/${dayData.capacity} maç`, 
                dayData.matches.map(m => getPlayersFromMatch(m).join(' vs ')));
        });
        
        setDateBasedSchedule(schedule);
        
        const totalPlayed = Object.values(schedule).reduce((sum, day) => sum + day.playedMatches, 0);
        const totalRemaining = Object.values(schedule).reduce((sum, day) => sum + day.remainingMatches, 0);
        
        console.log('📈 İstatistikler:', {
            totalDays: Object.keys(schedule).length,
            totalMatches: allMatches.length,
            playedMatches: totalPlayed,
            remainingMatches: totalRemaining
        });
    };
    
    // Oyuncu dinlenme kuralı kontrol fonksiyonları
    const getPlayersFromMatch = (match) => {
        if (match.type === 'group') {
            return [match.player1.tcKimlik, match.player2.tcKimlik];
        } else if (match.type === 'elimination' || match.type === 'competition') {
            const players = [];
            if (match.player1 && match.player1.tcKimlik) players.push(match.player1.tcKimlik);
            if (match.player2 && match.player2.tcKimlik) players.push(match.player2.tcKimlik);
            return players;
        }
        return [];
    };

    const canPlayerPlayOnDate = (playerId, targetDate, schedule, currentDayMatches = []) => {
        const targetDateStr = targetDate.toISOString().split('T')[0];
        const targetDateObj = new Date(targetDate);
        
        console.log(`🔍 KONTROL BAŞLIYOR: ${playerId} için ${targetDateStr}`, {
            existingSchedule: Object.keys(schedule),
            currentDayMatches: currentDayMatches.length
        });
        
        // 1. AYNI GÜN İÇİNDE BİRDEN FAZLA MAÇ KONTROLÜ
        // Aynı gün içinde bu oyuncunun zaten maçı var mı?
        for (const match of currentDayMatches) {
            const matchPlayers = getPlayersFromMatch(match);
            if (matchPlayers.includes(playerId)) {
                console.log(`🚫 AYNI GÜN ÇAKIŞMA: ${playerId} zaten ${targetDateStr} günü maçı var!`, {
                    existingMatch: matchPlayers,
                    currentDayMatches: currentDayMatches.length
                });
                return false; // ❌ Aynı gün zaten maçı var
            }
        }
        
        // 2. OYUNCU BAZLI DİNLENME KONTROLÜ
        // SADECE maç oynayan oyuncular ertesi gün dinlenir
        for (const [dateStr, daySchedule] of Object.entries(schedule)) {
            if (dateStr === targetDateStr) continue; // Aynı gün değil
            
            const currentDateObj = new Date(dateStr);
            const dayDifference = Math.abs((targetDateObj - currentDateObj) / (1000 * 60 * 60 * 24));
            
            console.log(`📊 GÜNLER ARASI KONTROL: ${dateStr} → ${targetDateStr}`, {
                dayDifference,
                rule: 'Ardışık günler engellenecek (dayDiff = 1)'
            });
            
            // SADECE ardışık günler kontrol et (1 gün fark = ertesi gün)
            if (dayDifference === 1) {
                // Bu oyuncunun önceki gün maçı var mı kontrol et
                // Hem daySchedule.matches hem de daySchedule.timeSlots'tan maçları kontrol et
                let previousDayMatches = [];
                
                // Eğer daySchedule.matches varsa ekle
                if (daySchedule.matches && Array.isArray(daySchedule.matches)) {
                    previousDayMatches.push(...daySchedule.matches);
                }
                
                // Eğer daySchedule.timeSlots varsa, tüm kortlardaki maçları ekle
                if (daySchedule.timeSlots && typeof daySchedule.timeSlots === 'object') {
                    Object.values(daySchedule.timeSlots).forEach(timeSlot => {
                        if (timeSlot.courts && typeof timeSlot.courts === 'object') {
                            Object.values(timeSlot.courts).forEach(court => {
                                if (court.match) {
                                    previousDayMatches.push(court.match);
                                }
                            });
                        }
                    });
                }
                
                // Önceki gün maçlarında bu oyuncu var mı kontrol et
                for (const match of previousDayMatches) {
                    const matchPlayers = getPlayersFromMatch(match);
                    if (matchPlayers.includes(playerId)) {
                        console.log(`🚫 ERTESI GÜN DİNLENME: ${playerId}`, {
                            playedDate: dateStr,
                            restDate: targetDateStr,
                            dayDifference: dayDifference,
                            matchPlayers: matchPlayers,
                            rule: 'Maç oynayan oyuncu ertesi gün dinlenir'
                        });
                        return false; // ❌ Ertesi gün dinlenmeli
                    }
                }
            }
        }
        
        console.log(`✅ UYGUN: ${playerId} ${targetDateStr} günü maç yapabilir`);
        return true; // ✅ Uygun
    };

    const validateMatchForDate = (match, targetDate, schedule, currentDayMatches = []) => {
        const players = getPlayersFromMatch(match);
        return players.every(playerId => canPlayerPlayOnDate(playerId, targetDate, schedule, currentDayMatches));
    };

    // Bir gün için zaman dilimlerini oluştur (TÜM saatleri dahil et)
    const createTimeSlotsForDay = (matches, startTime, endTime) => {
        const timeSlots = {};
        const courtCount = courts.length;
        let currentTime = timeToMinutes(startTime);
        const endMinutes = timeToMinutes(endTime);
        
        // TÜM saatleri oluştur (maç olsun olmasın)
        while (currentTime < endMinutes) {
            const timeSlot = minutesToTime(currentTime);
            
            timeSlots[timeSlot] = {
                startTime: timeSlot,
                endTime: minutesToTime(currentTime + 60),
                courts: {}
            };
            
            // TÜM kortları ekle (maç olsun olmasın)
            courts.forEach((court, courtIndex) => {
                timeSlots[timeSlot].courts[court.id] = {
                    courtId: court.id,
                    courtName: court.name,
                    match: null // Varsayılan olarak boş
                };
            });
            
            // Bu saatte maç varsa kortlara yerleştir
            const matchBatch = matches.slice(0, courtCount);
            if (matchBatch.length > 0) {
                matchBatch.forEach((match, courtIndex) => {
                    const court = courts[courtIndex];
                    timeSlots[timeSlot].courts[court.id] = {
                        courtId: court.id,
                        courtName: court.name,
                        match: match
                    };
                });
                
                // Kullanılan maçları listeden çıkar
                matches.splice(0, courtCount);
            }
            
            currentTime += 60;
        }
        
        return timeSlots;
    };

    const currentTournament = currentLeague && tournaments[currentLeague] ? tournaments[currentLeague] : null;

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
            
            {/* League Tabs */}
            {leagues.length > 0 && (
                <div className="league-tabs">
                    <div className="league-selector">
                    <button 
                            className={currentLeague === 'all' ? 'league-btn active' : 'league-btn'}
                            onClick={() => setCurrentLeague('all')}
                    >
                            🏆 Tüm Ligler
                    </button>
                        {leagues.map(league => (
                    <button 
                                key={league}
                                className={currentLeague === league ? 'league-btn active' : 'league-btn'}
                                onClick={() => setCurrentLeague(league)}
                    >
                                🏅 {capitalizeLeague(league)} Lig
                    </button>
                        ))}
                </div>
                    {currentLeague === 'all' && (
                        <div className="league-help-text">
                            💡 Turnuva başlatmak için önce bir lig seçin
                        </div>
                    )}
                </div>
            )}
            
            <div className="dashboard-controls">

                <div className="tournament-buttons">
                    {/* Lig seçili ve turnuva başlatılmamışsa */}
                    {currentLeague && currentLeague !== 'all' && (!currentTournament || !currentTournament.isActive) ? (
                        isAdminAuthenticated && (
                            <button 
                                className="create-tournament-btn"
                                onClick={() => setShowCreateTournament(true)}
                            >
                                {capitalizeLeague(currentLeague)} Ligi Turnuva Başlat
                            </button>
                        )
                    ) : currentLeague && currentLeague !== 'all' && currentTournament && currentTournament.isActive ? (
                        isAdminAuthenticated && (
                            <button 
                                className="reset-tournament-btn"
                                onClick={() => {
                                    if (window.confirm(`${capitalizeLeague(currentLeague)} ligi turnuvasını sıfırlamak istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
                                        setTournaments(prev => ({
                                            ...prev,
                                            [currentLeague]: {
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
                                {capitalizeLeague(currentLeague)} Ligi Turnuvasını Sıfırla
                            </button>
                        )
                    ) : leagues.length === 0 && isAdminAuthenticated ? (
                        <div className="no-leagues-message">
                            <p>⚠️ Henüz hiç lig kaydı yok. Katılımcıları lig bilgisiyle birlikte kaydedin.</p>
                        </div>
                    ) : null}
                </div>

                {/* Kort Yerleşimi Kontrolleri */}
                {isAdminAuthenticated && currentTournament && currentTournament.isActive && (
                    <div className="court-assignment-controls">
                        <div className="court-controls-header">
                            <h4>🎾 Kort Yerleşimi ve Zaman Çizelgesi</h4>
                        </div>
                        
                        <div className="court-settings">
                                                    <div className="planning-mode-toggle">
                            <button 
                                className="mode-toggle-btn active"
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

                            {/* Tarih Aralığı Bilgileri */}
                            <div className="date-range-info">
                                                                    <div className="court-info">
                                        <span>⚽ Tüm ligler toplam: {getAllMatchesFromAllLeagues().length} maç</span>
                                        <span>🏅 {capitalizeLeague(currentLeague)} lig: {(() => {
                                            try {
                                                return getAllMatches().length;
                                            } catch (error) {
                                                return 0;
                                            }
                                        })()} maç</span>
                                        <span>⏳ Kalan: {(() => {
                                            try {
                                                return getRemainingMatches().length;
                                            } catch (error) {
                                                return 0;
                                            }
                                        })()} maç</span>
                                        <span>🏟️ Kort sayısı: {courts.length}</span>
                                    </div>
                            </div>

                            {/* Tarih Aralığı Modu */}
                            {startDate && (
                                <div className="date-range-controls">
                                    <div className="rest-day-info">
                                        <h4>🛡️ Oyuncu Dinlenme Kuralı</h4>
                                        <p><strong>Maç oynayan oyuncular</strong> ertesi gün dinlenir, <strong>oynamayanlar</strong> maç yapabilir.
                                        <br/>📅 Gün 1: Mehmet vs Ali → Gün 2: Veli vs Can (✅)  
                                        <br/>❌ Yasak: Gün 1: Mehmet vs Ali → Gün 2: Mehmet vs Veli</p>
                                    </div>
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
                                                <span>⚽ Tüm ligler: {getAllMatchesFromAllLeagues().length} maç</span>
                                                <span>🏅 {capitalizeLeague(currentLeague)} lig: {getAllMatches().length} maç</span>
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
                                // Ana verileri temizle
                                localStorage.removeItem('registeredUsers');
                                localStorage.removeItem('tournaments');
                                
                                // Çizelge verilerini de temizle
                                localStorage.removeItem('courtSchedule');
                                localStorage.removeItem('dateBasedSchedule');
                                localStorage.removeItem('collapsedTimeSlots');
                                
                                // State'leri sıfırla
                                setCourtSchedule({});
                                setDateBasedSchedule({});
                                setCollapsedTimeSlots({});
                                setShowCourtSchedule(false);
                                setShowDateSchedule(false);
                                
                                // Swap modlarını sıfırla
                                setMatchSwapMode(false);
                                setSelectedMatchForSwap(null);
                                setTargetEmptySlot(null);
                                setEliminationSwapMode(false);
                                setSelectedEliminationPlayer(null);
                                
                                console.log('✅ Tüm veriler ve çizelgeler temizlendi');
                                
                                // Sayfayı yenile
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
                            <button onClick={() => createTournament(currentLeague)}>Turnuvayı Başlat</button>
                            <button onClick={() => setShowCreateTournament(false)}>İptal</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Kort Çizelgesi Görünümü - Tarih Aralığı için */}
            {showCourtSchedule && Object.keys(courtSchedule).length > 0 && startDate && (
                <div className="court-schedule-view">
                    <div className="schedule-header">
                        <h3>🏟️ Kort Çizelgesi - {currentLeague && currentLeague !== 'all' ? capitalizeLeague(currentLeague) + ' Ligi' : 'Tüm Ligler'}</h3>
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
                                                        {matchSwapMode && (
                                                            <div className="match-swap-controls">
                                                                <button 
                                                                    className="quick-swap-btn"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleMatchSelect(timeSlot, court.id, courtMatch.match);
                                                                    }}
                                                                    title={
                                                                        selectedMatchForSwap && selectedMatchForSwap.timeSlot === timeSlot && selectedMatchForSwap.courtId === court.id
                                                                            ? 'Bu maç seçildi'
                                                                            : selectedMatchForSwap
                                                                                ? 'Bu maç ile değiştir'
                                                                                : 'Bu maçı seç'
                                                                    }
                                                                >
                                                                    {selectedMatchForSwap && selectedMatchForSwap.timeSlot === timeSlot && selectedMatchForSwap.courtId === court.id
                                                                        ? '🔄 Seçildi'
                                                                        : selectedMatchForSwap
                                                                            ? '⬅️ Değiştir'
                                                                            : '👆 Seç'
                                                                    }
                                                                </button>
                                                            </div>
                                                        )}
                                                        <div className="match-type">
                                                            {/* Lig bilgisi */}
                                                            <span className="league-badge">
                                                                🏅 {capitalizeLeague(courtMatch.match.league)} Lig
                                                            </span>
                                                            
                                                            {/* Maç türü */}
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
                                                    <div 
                                                        className={`court-empty ${
                                                            matchSwapMode && selectedMatchForSwap 
                                                                ? 'can-receive-match' 
                                                                : targetEmptySlot && targetEmptySlot.timeSlot === timeSlot && targetEmptySlot.courtId === court.id
                                                                    ? 'selected-for-assignment'
                                                                    : ''
                                                        }`}
                                                        onClick={() => {
                                                            if (matchSwapMode && selectedMatchForSwap) {
                                                                // Seçilen maçı boş slota taşı
                                                                handleMoveToEmptySlot(timeSlot, court.id);
                                                            } else if (!matchSwapMode) {
                                                                // Swap mode değilse, boş kort için atama modunu başlat
                                                                handleEmptyCourtClick(timeSlot, court.id);
                                                            }
                                                        }}
                                                        title={
                                                            matchSwapMode && selectedMatchForSwap
                                                                ? 'Seçilen maçı buraya taşı'
                                                                : targetEmptySlot && targetEmptySlot.timeSlot === timeSlot && targetEmptySlot.courtId === court.id
                                                                    ? 'Bu korta maç atamak için başka bir maçı seçin'
                                                                    : 'Bu korta maç atamak için tıklayın'
                                                        }
                                                    >
                                                        <span>
                                                            {matchSwapMode && selectedMatchForSwap 
                                                                ? '📍 Buraya Taşı' 
                                                                : targetEmptySlot && targetEmptySlot.timeSlot === timeSlot && targetEmptySlot.courtId === court.id
                                                                    ? '🎯 Hedef Kort'
                                                                    : '📍 Tıkla & Ata'
                                                            }
                                                        </span>
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
                            
                            <div className="date-collapse-controls">
                                <button 
                                    className="collapse-btn expand-all"
                                    onClick={expandAllDateSchedule}
                                    title="Tüm günleri ve saat dilimlerini aç"
                                >
                                    📂 Hepsini Aç
                                </button>
                                <button 
                                    className="collapse-btn collapse-all"
                                    onClick={collapseAllDateSchedule}
                                    title="Tüm günleri ve saat dilimlerini kapat"
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
                            <div key={daySchedule.date} className={`date-schedule-day ${collapsedTimeSlots[`day-${daySchedule.date}`] ? 'collapsed' : ''}`}>
                                <div 
                                    className="day-header clickable"
                                    onClick={() => toggleDay(daySchedule.date)}
                                    title="Günü açmak/kapatmak için tıklayın"
                                >
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
                                    <div className="day-collapse-indicator">
                                        {collapsedTimeSlots[`day-${daySchedule.date}`] ? '▼' : '▲'}
                                    </div>
                                </div>
                                
                                {!collapsedTimeSlots[`day-${daySchedule.date}`] && (
                                    <div className="day-time-slots">
                                    {Object.entries(daySchedule.timeSlots).map(([timeSlot, slotData]) => {
                                        const dateTimeKey = `${daySchedule.date}-${timeSlot}`;
                                        const isCollapsed = collapsedTimeSlots[dateTimeKey];
                                        return (
                                        <div key={timeSlot} className={`time-slot-day ${isCollapsed ? 'collapsed' : ''}`}>
                                            <div 
                                                className="time-slot-header-day clickable"
                                                onClick={() => toggleDateTimeSlot(daySchedule.date, timeSlot)}
                                                title="Zaman dilimini açmak/kapatmak için tıklayın"
                                            >
                                                <div className="time-slot-title-day">
                                                    <h5>{slotData.startTime} - {slotData.endTime}</h5>
                                                    <span className="court-count">
                                                        {Object.keys(slotData.courts).length}/{courts.length} kort
                                                    </span>
                                                </div>
                                                <div className="collapse-indicator-day">
                                                    {isCollapsed ? '▼' : '▲'}
                                                </div>
                                            </div>
                                            
                                            {!isCollapsed && (
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
                                                            onClick={() => {
                                                                if (courtData && courtData.match) {
                                                                    // Dolu kort - maç var
                                                                    handleDateScheduleMatchSelect(daySchedule.date, timeSlot, court.id, courtData.match);
                                                                } else {
                                                                    // Boş kort
                                                                    if (matchSwapMode && selectedMatchForSwap) {
                                                                        // Swap modu aktif ve maç seçilmiş, boş slota taşı
                                                                        handleMoveToEmptySlotDateSchedule(daySchedule.date, timeSlot, court.id);
                                                                    } else if (!matchSwapMode) {
                                                                        // Swap modu değil, boş kort için atama modunu başlat
                                                                        handleEmptyCourtClickDateSchedule(daySchedule.date, timeSlot, court.id);
                                                                    }
                                                                }
                                                            }}
                                                                                                                        title={
                                                                courtData && courtData.match
                                                                    ? matchSwapMode && selectedMatchForSwap
                                                                        ? selectedMatchForSwap.date === daySchedule.date &&
                                                                          selectedMatchForSwap.timeSlot === timeSlot &&
                                                                          selectedMatchForSwap.courtId === court.id
                                                                            ? 'Bu maç seçildi, başka bir maç seçin'
                                                                            : 'Bu maç ile değiştirmek için tıklayın'
                                                                        : 'Bu maçı seçmek için tıklayın'
                                                                    : matchSwapMode && selectedMatchForSwap
                                                                        ? 'Seçilen maçı buraya taşı'
                                                                        : 'Bu korta maç atamak için tıklayın'
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
                                                            
                                                            {courtData && courtData.match ? (
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
                                                                <div 
                                                                    className={`court-empty-day ${
                                                                        matchSwapMode && selectedMatchForSwap 
                                                                            ? 'can-receive-match' 
                                                                            : targetEmptySlot && targetEmptySlot.date === daySchedule.date && targetEmptySlot.timeSlot === timeSlot && targetEmptySlot.courtId === court.id
                                                                                ? 'selected-for-assignment'
                                                                                : ''
                                                                    }`}
                                                                    onClick={() => {
                                                                        if (matchSwapMode && selectedMatchForSwap) {
                                                                            // Seçilen maçı boş slota taşı
                                                                            handleMoveToEmptySlotDateSchedule(daySchedule.date, timeSlot, court.id, selectedMatchForSwap);
                                                                        } else if (!matchSwapMode) {
                                                                            // Swap mode değilse, boş kort için atama modunu başlat
                                                                            handleEmptyCourtClickDateSchedule(daySchedule.date, timeSlot, court.id);
                                                                        }
                                                                    }}
                                                                    title={
                                                                        matchSwapMode && selectedMatchForSwap
                                                                            ? 'Seçilen maçı buraya taşı'
                                                                            : targetEmptySlot && targetEmptySlot.date === daySchedule.date && targetEmptySlot.timeSlot === timeSlot && targetEmptySlot.courtId === court.id
                                                                                ? 'Bu korta maç atamak için başka bir maçı seçin'
                                                                                : 'Bu korta maç atamak için tıklayın'
                                                                    }
                                                                >
                                                                    <span>
                                                                        {matchSwapMode && selectedMatchForSwap 
                                                                            ? '📍 Buraya Taşı' 
                                                                            : targetEmptySlot && targetEmptySlot.date === daySchedule.date && targetEmptySlot.timeSlot === timeSlot && targetEmptySlot.courtId === court.id
                                                                                ? '🎯 Hedef Kort'
                                                                                : '📍 Tıkla & Ata'
                                                                        }
                                                                    </span>
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
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {currentTournament && currentTournament.mainTournamentCompleted && currentTournament.competitionCompleted ? (
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
                                    [currentLeague]: {
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
            ) : currentTournament && currentTournament.mainTournamentCompleted && !currentTournament.competitionCompleted ? (
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
                                                                        const tournament = newTournaments[currentLeague];
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
                                                                        const tournament = newTournaments[currentLeague];
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
                                                                    const tournament = newTournaments[currentLeague];
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
            ) : currentTournament && currentTournament.isActive ? (
                <div className="tournament-info">
                    <h3>{capitalizeLeague(currentLeague)} Ligi - {currentTournament.phase === 'groups' ? 'Grup Aşaması' : 'Eleme Turu'} - Tur {currentTournament.currentRound}</h3>
                    
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
                                                                            const tournament = newTournaments[currentLeague];
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
                                                                            const tournament = newTournaments[currentLeague];
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
                                                                        const tournament = newTournaments[currentLeague];
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
                            {eliminationSwapMode && (
                                <div className="swap-info">
                                    <span className="swap-mode-indicator">🔄 Swap Modu Aktif</span>
                                    <span className="swap-instruction">İkinci oyuncuyu seçin</span>
                                    <button 
                                        className="cancel-swap-btn"
                                        onClick={() => {
                                            setEliminationSwapMode(false);
                                            setSelectedEliminationPlayer(null);
                                        }}
                                    >
                                        ❌ İptal Et
                                    </button>
                                </div>
                            )}
                            {currentTournament.eliminationRounds && currentTournament.eliminationRounds.length > 0 ? (
                                currentTournament.eliminationRounds.map((round, roundIndex) => (
                                    <div key={roundIndex} className="elimination-round">
                                        <h4>Eleme Turu {roundIndex + 1}</h4>
                                        {round.map(match => (
                                            <div key={match.id} className="match-item">
                                                <div className="match-players">
                                                    <span 
                                                        className={`player-name ${eliminationSwapMode && selectedEliminationPlayer?.matchId === match.id && selectedEliminationPlayer?.player?.tcKimlik === match.player1?.tcKimlik ? 'selected-for-swap' : ''}`}
                                                        onClick={() => match.player1 && !match.isPlayed && handleEliminationPlayerSelect(match.player1, match.id)}
                                                        title={!match.isPlayed ? "Oyuncu seçmek için tıklayın" : ""}
                                                    >
                                                        {match.player1.ad}
                                                    </span>
                                                    <span>vs</span>
                                                    <span 
                                                        className={`player-name ${eliminationSwapMode && selectedEliminationPlayer?.matchId === match.id && selectedEliminationPlayer?.player?.tcKimlik === match.player2?.tcKimlik ? 'selected-for-swap' : ''}`}
                                                        onClick={() => match.player2 && !match.isPlayed && handleEliminationPlayerSelect(match.player2, match.id)}
                                                        title={!match.isPlayed ? "Oyuncu seçmek için tıklayın" : ""}
                                                    >
                                                        {match.player2 ? match.player2.ad : 'Bay'}
                                                    </span>
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
                                                                            const tournament = newTournaments[currentLeague];
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
                                                                            const tournament = newTournaments[currentLeague];
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
                                                                        const tournament = newTournaments[currentLeague];
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
                                                                                const tournament = newTournaments[currentLeague];
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
                                                                                const tournament = newTournaments[currentLeague];
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
                                                                            const tournament = newTournaments[currentLeague];
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
             ) : currentLeague === 'all' ? (
                 <div className="all-leagues-view">
                     <h3>🏆 Tüm Ligler Görünümü</h3>
                     <div className="leagues-summary">
                         {leagues.map(league => {
                             const leagueTournament = tournaments[league];
                             const leagueUsers = registeredUsers.filter(user => user.league === normalizeLeague(league));
                             return (
                                 <div key={league} className="league-summary-card">
                                     <h4>🏅 {capitalizeLeague(league)} Ligi</h4>
                                     <div className="league-stats">
                                         <span>👥 {leagueUsers.length} katılımcı</span>
                                         <span>🏟️ {leagueTournament?.isActive ? 'Aktif' : 'Beklemede'}</span>
                                         {leagueTournament?.isActive && (
                                             <span>📊 {leagueTournament.phase === 'groups' ? 'Grup Aşaması' : 'Eleme Turu'}</span>
                                         )}
                                     </div>
                                     <button 
                                         className="quick-switch-btn"
                                         onClick={() => setCurrentLeague(league)}
                                     >
                                         Bu Lige Geç
                                     </button>
                                 </div>
                             );
                         })}
                     </div>
                </div>
            ) : null}
             
             {/* Tournament Creation Modal */}
             {showCreateTournament && (
                 <div className="modal-overlay">
                     <div className="modal-content">
                         <div className="modal-header">
                             <h3>🏆 {capitalizeLeague(currentLeague)} Ligi Turnuvası Oluştur</h3>
                             <button 
                                 className="modal-close-btn"
                                 onClick={() => setShowCreateTournament(false)}
                             >
                                 ✕
                             </button>
                         </div>
                         
                         <div className="modal-body">
                             <div className="tournament-creation-info">
                                 <div className="info-section">
                                     <h4>📊 Lig Bilgileri</h4>
                                     <div className="info-stats">
                                         <span>🏅 Lig: {capitalizeLeague(currentLeague)}</span>
                                         <span>👥 Katılımcı: {registeredUsers.filter(user => user.league === normalizeLeague(currentLeague)).length} kişi</span>
                                         <span>👨 Erkek: {registeredUsers.filter(user => user.league === normalizeLeague(currentLeague) && user.gender === 'male').length}</span>
                                         <span>👩 Kadın: {registeredUsers.filter(user => user.league === normalizeLeague(currentLeague) && user.gender === 'female').length}</span>
                                     </div>
                                 </div>
                                 
                                 <div className="info-section">
                                     <h4>⚙️ Turnuva Ayarları</h4>
                                     <div className="setting-item">
                                         <label>Grup Büyüklüğü:</label>
                                         <select 
                                             value={groupSize} 
                                             onChange={(e) => setGroupSize(parseInt(e.target.value))}
                                         >
                                             <option value={3}>3 kişi</option>
                                             <option value={4}>4 kişi</option>
                                             <option value={5}>5 kişi</option>
                                         </select>
                                     </div>
                                 </div>
                                 
                                 <div className="warning-section">
                                     <p>⚠️ Turnuva başlatıldıktan sonra katılımcı listesi değiştirilemez!</p>
                                 </div>
                             </div>
                         </div>
                         
                         <div className="modal-footer">
                             <button 
                                 className="modal-cancel-btn"
                                 onClick={() => setShowCreateTournament(false)}
                             >
                                 İptal
                             </button>
                             <button 
                                 className="modal-confirm-btn"
                                 onClick={() => createTournament(currentLeague)}
                             >
                                 🏆 Turnuvayı Başlat
                             </button>
                         </div>
                     </div>
                 </div>
             )}
        </div>
    );
}

export default AdminDashboard; 