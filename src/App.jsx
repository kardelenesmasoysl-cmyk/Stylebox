
import { useEffect, useState } from "react";
import "./App.css";

const CATEGORIES = [
  "Üst Giyim",
  "Alt Giyim",
  "Elbise",
  "Ayakkabı",
  "Aksesuar",
  "Çanta",
];

function App() {
  const [clothes, setClothes] = useState(() => {
    try {
      const saved = localStorage.getItem("stylebox-clothes");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Üst Giyim");
  const [image, setImage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Tümü");
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem("stylebox-clothes", JSON.stringify(clothes));
    } catch {
      setMessage("Depolama alanı dolu olabilir. Daha küçük bir görsel deneyin.");
    }
  }, [clothes]);

  function handleImageChange(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Lütfen bir görsel dosyası seç.");
      e.target.value = "";
      return;
    }

    if (file.size > 1024 * 1024) {
      setMessage("Görsel en fazla 1 MB olmalı.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setImage(String(reader.result));
      setMessage("");
    };

    reader.onerror = () => {
      setMessage("Görsel okunamadı. Lütfen tekrar dene.");
    };

    reader.readAsDataURL(file);
  }

  function addOrUpdateClothing(e) {
    e.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setMessage("Lütfen kıyafetinin adını yaz.");
      return;
    }

    if (editingId !== null) {
      setClothes((previous) =>
        previous.map((item) =>
          item.id === editingId
            ? {
                ...item,
                name: trimmedName,
                category,
                image: image || item.image || "",
              }
            : item
        )
      );
      setMessage("Kıyafetin güncellendi! ♡");
    } else {
      setClothes((previous) => [
        ...previous,
        {
          id: `${Date.now()}-${Math.random()}`,
          name: trimmedName,
          category,
          image,
        },
      ]);
      setMessage("Yeni parçan gardırobuna eklendi! ♡");
    }

    resetForm();
  }

  function resetForm() {
    setName("");
    setCategory("Üst Giyim");
    setImage("");
    setEditingId(null);

    const fileInput = document.getElementById("clothing-image");
    if (fileInput) fileInput.value = "";
  }

  function editClothing(item) {
    setName(item.name);
    setCategory(item.category);
    setImage("");
    setEditingId(item.id);
    setMessage("Bilgileri düzenle, sonra değişiklikleri kaydet.");

    const fileInput = document.getElementById("clothing-image");
    if (fileInput) fileInput.value = "";

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteClothing(id) {
    const confirmed = window.confirm(
      "Bu kıyafeti gardırobundan silmek istiyor musun?"
    );

    if (!confirmed) return;

    setClothes((previous) => previous.filter((item) => item.id !== id));

    if (editingId === id) resetForm();

    setMessage("Kıyafet gardırobundan kaldırıldı.");
  }

  const visibleClothes = clothes.filter((item) => {
    const matchesSearch = item.name
      .toLocaleLowerCase("tr")
      .includes(search.toLocaleLowerCase("tr"));

    const matchesCategory =
      filter === "Tümü" || item.category === filter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="app">
      <header className="header">
        <a className="logo" href="#" aria-label="StyleBox ana sayfa">
          style<span>box.</span>
        </a>
        <span className="header-note">YOUR DIGITAL WARDROBE ♡</span>
      </header>

      <main className="main">
        <section className="welcome">
          <p className="eyebrow">YOUR STYLE, YOUR RULES</p>
          <h1>
            Dolabın, <span>senin dünyan.</span>
          </h1>
          <p className="subtitle">
            Sevdiğin parçaları bir araya getir, kendi tarzını keşfet.
          </p>
          <div className="welcome-decoration" aria-hidden="true">
            ♡ ✳ ♡
          </div>
        </section>

        <section className="wardrobe">
          <div className="section-heading">
            <div>
              <p className="eyebrow">THE COLLECTION</p>
              <h2>Dijital Gardırobun</h2>
            </div>
            <span className="count">{clothes.length} parça ♡</span>
          </div>

          <form className="add-form" onSubmit={addOrUpdateClothing}>
            <label className="field">
              <span>Kıyafet adı</span>
              <input
                type="text"
                placeholder="Örn. Pembe gömlek"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
                required
              />
            </label>

            <label className="field">
              <span>Kategori</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="field image-field">
              <span>Fotoğraf (isteğe bağlı, en fazla 1 MB)</span>
              <input
                id="clothing-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>

            {image && (
              <div className="image-preview">
                <img src={image} alt="Seçilen kıyafet ön izlemesi" />
                <span>Fotoğraf hazır ♡</span>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => {
                    setImage("");
                    const fileInput = document.getElementById("clothing-image");
                    if (fileInput) fileInput.value = "";
                  }}
                >
                  Fotoğrafı kaldır
                </button>
              </div>
            )}

            <div className="form-actions">
              <button className="primary-button" type="submit">
                {editingId !== null
                  ? "Değişiklikleri Kaydet"
                  : "+ Kıyafet Ekle"}
              </button>

              {editingId !== null && (
                <button
                  className="secondary-button"
                  type="button"
                  onClick={resetForm}
                >
                  Vazgeç
                </button>
              )}
            </div>

            {message && (
              <p className="status-message" role="status">
                {message}
              </p>
            )}
          </form>

          <div className="toolbar">
            <label className="search-field">
              <span className="visually-hidden">Kıyafet ara</span>
              <input
                type="search"
                placeholder="Gardırobunda ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>

            <label className="filter-field">
              <span className="visually-hidden">Kategori filtrele</span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="Tümü">Tüm kategoriler</option>
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {visibleClothes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">♡</div>
              <h3>
                {clothes.length === 0
                  ? "Gardırobun seni bekliyor!"
                  : "Burada henüz bir parça yok."}
              </h3>
              <p>
                {clothes.length === 0
                  ? "İlk parçanı ekle ve dijital gardırobunu oluşturmaya başla."
                  : "Arama kelimeni veya kategori filtresini değiştirebilirsin."}
              </p>
            </div>
          ) : (
            <div className="clothing-grid">
              {visibleClothes.map((item) => (
                <article className="clothing-card" key={item.id}>
                  <div className="clothing-icon">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="clothing-photo"
                      />
                    ) : (
                      <span aria-hidden="true">♡</span>
                    )}
                  </div>

                  <span className="category-tag">{item.category}</span>
                  <h3>{item.name}</h3>

                  <div className="card-actions">
                    <button
                      className="edit-button"
                      type="button"
                      onClick={() => editClothing(item)}
                    >
                      Düzenle
                    </button>
                    <button
                      className="delete-button"
                      type="button"
                      onClick={() => deleteClothing(item.id)}
                    >
                      Sil
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        made with love ♡ <span>stylebox.</span>
      </footer>
    </div>
  );
}

export default App;

