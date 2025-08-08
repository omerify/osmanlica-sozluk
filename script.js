document.addEventListener('DOMContentLoaded', async () => {
    const searchInput = document.getElementById('searchInput');
    const resultsDiv = document.getElementById('results');
    const alphabetFilterDiv = document.getElementById('alphabet-filter');
    const resultCountDiv = document.getElementById('result-count');

    let allWords = [];
    let activeButton = null;
    const alphabet = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ'.split('');

    // Başlangıç mesajını ayarla
    resultsDiv.innerHTML = '<p class="initial-message">Sözlük yükleniyor, lütfen bekleyin...</p>';

    // Alfabe butonlarını oluştur
    alphabet.forEach(letter => {
        const button = document.createElement('button');
        button.textContent = letter;
        button.addEventListener('click', () => {
            filterWordsByLetter(letter);
            if (activeButton) {
                activeButton.classList.remove('active');
            }
            button.classList.add('active');
            activeButton = button;
        });
        alphabetFilterDiv.appendChild(button);
    });

    const renderResults = (data) => {
        resultsDiv.innerHTML = '';
        if (!data || data.length === 0) {
            resultCountDiv.textContent = '0 kelime bulundu.';
            resultsDiv.innerHTML = '<p class="initial-message">Aramanızla eşleşen sonuç bulunamadı.</p>';
            return;
        }

        resultCountDiv.textContent = `${data.length} kelime bulundu.`;

        data.forEach(item => {
            const div = document.createElement('div');
            div.className = 'result-item';
            div.innerHTML = `<h3>${item.word}</h3><p>${item.definition}</p>`;
            resultsDiv.appendChild(div);
        });
    };

    const filterWordsByLetter = (letter) => {
        searchInput.value = '';
        const filtered = allWords.filter(item => item.word.toUpperCase().startsWith(letter));
        renderResults(filtered);
    };

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();

        if (activeButton) {
            activeButton.classList.remove('active');
            activeButton = null;
        }

        if (query.length === 0) {
            resultsDiv.innerHTML = '<p class="initial-message">Arama yapmak için bir kelime yazın veya bir harf seçin.</p>';
            resultCountDiv.textContent = '';
            return;
        }

        const filtered = allWords.filter(item =>
            item.word.toLowerCase().includes(query) ||
            item.definition.toLowerCase().includes(query)
        );
        renderResults(filtered);
    });

    // Tüm JSON dosyalarını yüklemek için ana fonksiyon
    const loadAllWords = async () => {
        try {
            const promises = alphabet.map(letter => {
                const path = `data/${letter.toLowerCase()}.json`;
                return fetch(path)
                    .then(response => {
                        if (response.ok) {
                            return response.json();
                        }
                        return []; // Dosya yoksa veya hata varsa boş dizi döndür
                    })
                    .catch(() => []); // fetch hatası olursa boş dizi döndür
            });

            const wordsByLetter = await Promise.all(promises);
            allWords = wordsByLetter.flat();

            if (allWords.length > 0) {
                resultsDiv.innerHTML = '<p class="initial-message">Arama yapmak için bir kelime yazın veya bir harf seçin.</p>';
                resultCountDiv.textContent = `Toplam ${allWords.length} kelime yüklendi.`;
            } else {
                 resultsDiv.innerHTML = '<p class="initial-message" style="color: red;">Hata: Kelime dosyaları yüklenemedi. Projeyi bir web sunucusu üzerinden çalıştırdığınızdan emin olun.</p>';
                 resultCountDiv.textContent = '';
            }
        } catch (error) {
            console.error('Sözlük yüklenirken ciddi bir hata oluştu:', error);
            resultsDiv.innerHTML = '<p class="initial-message" style="color: red;">Sözlük yüklenemedi. Lütfen konsol kayıtlarını kontrol edin.</p>';
        }
    };

    // Sözlüğü yükle
    await loadAllWords();
});