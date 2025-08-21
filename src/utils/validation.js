export const validateTCKimlik = (tcno) => {
    // TC kimlik numarası 11 haneli olmalı
    if (!/^[0-9]{11}$/.test(tcno)) return false;

    let digits = tcno.split('').map(Number);
    
    // İlk hane 0 olamaz
    if (digits[0] === 0) return false;

    // 1. 3. 5. 7. ve 9. hanelerin toplamının 7 katından, 2. 4. 6. ve 8. hanelerin toplamı çıkartıldığında,
    // elde edilen sonucun 10'a bölümünden kalan, 10. haneyi vermelidir.
    let tek = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
    let cift = digits[1] + digits[3] + digits[5] + digits[7];
    
    let hane10 = ((tek * 7) - cift) % 10;
    if (hane10 !== digits[9]) return false;

    // 1'den 10'uncu haneye kadar olan 10 hanenin toplamından elde edilen sonucun
    // 10'a bölümünden kalan, 11. haneyi vermelidir.
    let toplam = digits.slice(0, 10).reduce((acc, val) => acc + val, 0);
    let hane11 = toplam % 10;
    if (hane11 !== digits[10]) return false;

    return true;
};