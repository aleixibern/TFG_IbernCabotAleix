# TFG\_IbernCabotAleix

# 🐾 Lynx - Gestor de Projectes Àgil

**Lynx** és una aplicació Full-Stack per a la gestió de projectes i tasques basada en metodologies àgils (Sprints i Kanban). Aquest projecte ha estat desenvolupat com a Treball de Final de Grau (TFG).

Amb una visió ràpida i precisa (com un linx), l'aplicació permet als equips organitzar el seu flux de treball, gestionar dependències complexes entre tasques i mantenir tot el context centralitzat.

## ✨ Funcionalitats Principals
* **Taulell Kanban Dinàmic:** Gestió d'estats de les tasques (Backlog, Ready, In Progress, In Review, Done) mitjançant funcionalitat *Drag & Drop*.
* **Gestió d'Sprints:** Planificació, inici i tancament d'Sprints actius per focalitzar la feina de l'equip.
* **🔒 Dependències Estrictes:** Lògica de negoci avançada que bloqueja l'avanç de les tasques si les seves dependències no estan completades.
* **📎 Enllaços Externs i Subtasques:** Cada tasca pot contenir referències a eines externes (GitHub, Figma, Google Drive) i dividir-se en subtasques més petites.
* **Autenticació Segura:** Integració completa amb Google OAuth 2.0 i seguretat basada en JWT.

## 🛠️ Stack Tecnològic
* **Frontend:** React, TypeScript, Vite, HeroUI i TailwindCSS.
* **Backend:** Java 21, Spring Boot, Spring Security i Maven.
* **Base de Dades:** PostgreSQL.
* **Desplegament:** Docker i Docker Compose.

------------------------------------------------------------------

\# Instal·lació i Execució Ràpida (Docker) 🐳



Per facilitar l'avaluació d'aquest TFG, l'aplicació està completament dockeritzada. No és necessari instal·lar Java, Node.js ni PostgreSQL manualment.



\### Prerequisits

\- Tenir instal·lat \[Docker Desktop](https://www.docker.com/products/docker-desktop/) a la màquina.



\### Passos per arrencar l'aplicació

1\. Obre un terminal a l'arrel del projecte (on es troba el fitxer `docker-compose.yml`).

2\. Executa la següent comanda per compilar i aixecar tots els serveis:



&nbsp;  ```bash

&nbsp;  docker-compose up --build

