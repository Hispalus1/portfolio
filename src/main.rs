#[macro_use]
extern crate rocket;

use rocket::fs::{FileServer, relative};
use rocket::response::Redirect;
use rocket_dyn_templates::{Template, context};
use serde::Serialize;

#[derive(Serialize)]
struct Stat {
    value: &'static str,
    label: &'static str,
}

#[derive(Serialize)]
struct Tech {
    icon: &'static str,
    name: &'static str,
    level: u8,
}

#[derive(Serialize)]
struct Project {
    title: &'static str,
    desc: &'static str,
    tags: Vec<&'static str>,
    github: &'static str,
    demo: &'static str,
    thumb: &'static str,
}

#[derive(Serialize)]
struct Experience {
    company: &'static str,
    role: &'static str,
    period: &'static str,
    desc: &'static str,
    logo: &'static str,
}

#[get("/")]
fn index() -> Template {
    let stats = vec![
        Stat { value: "2+",  label: "Roky zkušeností" },
        Stat { value: "12+", label: "Dokončené projekty" },
        Stat { value: "10",  label: "Technologií" },
    ];

    let technologies = vec![
        Tech { icon: "🦀", name: "Rust",               level: 70 },
        Tech { icon: "⚙️", name: "C",                  level: 85 },
        Tech { icon: "➕", name: "C++",                level: 78 },
        Tech { icon: "🔩", name: "Assembly",           level: 50 },
        Tech { icon: "🌐", name: "Cisco / Networking", level: 75 },
        Tech { icon: "🔧", name: "Git",                level: 88 },
        Tech { icon: "🔬", name: "Mikrokontroléry",    level: 72 },
        Tech { icon: "🧩", name: "PLD / FPGA",         level: 60 },
        Tech { icon: "🐍", name: "Python",             level: 85 },
        Tech { icon: "🐳", name: "Docker",             level: 65 },
    ];

    let experiences = vec![
        Experience {
            company: "Ostravská univerzita",
            role: "Vývojář vestavěných systémů & FPGA",
            period: "Srp 2024 — Říj 2025",
            desc: "Vývoj řídicího softwaru pro robotické rameno a kreslícího robota. Implementace softwarových omezení pohybu pro ochranu mechanických částí. Práce v AMD Vivado a Vitis, vývoj na FPGA/PLD a nízkoúrovňový kód v C/C++. (Částečný úvazek 12h/týden)",
            logo: "logo.png",
        },
        Experience {
            company: "Slezská univerzita",
            role: "Stážista (Intern)",
            period: "Zář 2023 — Dub 2024",
            desc: "Výzkum a vývoj nízkoúrovňových algoritmů pro řízení pohybu a práce s programovatelnou logikou pod vedením odborného vyučujícího.",
            logo: "logo2.png",
        },
    ];

    let projects = vec![
        Project {
            title:  "AI Maze Solver",
            desc:   "Finální projekt střední školy — neuronová síť (PyTorch) trénovaná na průchod bludištěm. Bludiště je generováno v Rustu, agent se učí nacházet cestu pomocí reinforcement learningu.",
            tags:   vec!["Python", "PyTorch", "Rust", "AI"],
            github: "https://github.com/Hispalus1/AI-torch",
            demo:   "",
            thumb:  "project1.png",
        },
        Project {
            title:  "Projekt 1984",
            desc:   "Self-hosted Discord-like chatovací aplikace běžící na Raspberry Pi. Zaměřená na soukromí a plnou kontrolu nad vlastními daty — žádné cloudy, žádné sledování.",
            tags:   vec!["Networking","JavaScript", "Raspberry Pi", "Self-hosted"],
            github: "https://github.com/Hispalus1/pi-chat-voice",
            demo:   "",
            thumb:  "project2.png",
        },
    ];

    Template::render("index", context! {
        title: "Portfolio — Lukáš Hrňa",
        stats,
        technologies,
        experiences,
        projects,
    })
}

#[derive(rocket::form::FromForm)]
struct ContactForm<'r> {
    name: &'r str,
    email: &'r str,
    message: &'r str,
}

#[post("/contact", data = "<form>")]
fn contact(form: rocket::form::Form<ContactForm<'_>>) -> Redirect {
    // TODO: store to DB or send email
    println!("📬 New message from {} <{}>", form.name, form.email);
    println!("   {}", form.message);
    Redirect::to("/#contact")
}

#[launch]
fn rocket() -> _ {
    rocket::build()
        .mount("/", routes![index, contact])
        .mount("/static", FileServer::from(relative!("static")))
        .attach(Template::fairing())
}
