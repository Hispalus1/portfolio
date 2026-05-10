# Portfolio — Rocket (Rust) Web App

Personal portfolio website built with [Rocket](https://rocket.rs/) (Rust) and Bootstrap 5.

## Struktura projektu

```
portfolio/
├── Cargo.toml              # Rust dependencies
├── Rocket.toml             # Rocket server config
├── src/
│   └── main.rs             # Rocket routes
├── templates/
│   └── index.html          # Main HTML page
└── static/
    ├── css/
    │   └── style.css       # Custom styles
    ├── js/
    │   └── main.js         # Scroll animations, navbar
    └── img/                # <- Add your project screenshots here
        ├── project1.png
        ├── project2.png
        └── project3.png
```

## Spuštění

```bash
# Vývojový server
cargo run

# Produkční build
cargo build --release
./target/release/portfolio
```

Server poběží na `http://localhost:8000`.

## Co upravit

### Osobní údaje
- `templates/index.html` — Nahraďte texty označené komentáři `<!-- EDIT: ... -->`
- Váš e-mail: hledejte `vas@email.cz`
- Statistiky v hero sekci (počet let, projektů, technologií)

### Projekty
Pro každý projekt v sekci `#projects`:
1. Uncommentujte `<img src="...">` a smažte `<div class="project-thumb-placeholder">`
2. Přidejte screenshot do `static/img/`
3. Vyplňte název, popis a URL odkazy na GitHub / Demo

### Technologie
Upravte karty v sekci `#technologies` — změňte emoji, názvy a procenta `width` v progress barech.

### Foto (sekce "O mě")
Nahraďte `.avatar-placeholder` za:
```html
<img src="/static/img/avatar.jpg" alt="Vaše jméno"
     style="width:100%;border-radius:4px;border:1px solid var(--border)">
```

## Závislosti

- `rocket = "0.5"` — Web framework
- Bootstrap 5.3 — Responzivní grid (CDN)
- Google Fonts — Syne + JetBrains Mono (CDN)
