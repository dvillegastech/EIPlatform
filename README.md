# Plateforme Enterprise Individuelle - France

## 📋 Description

Plateforme complète de gestion pour votre **Enterprise Individuelle** en France. Cette application vous permet de gérer vos factures, dépenses, déclarations URSSAF et fiscales, avec calcul automatique des cotisations selon les taux 2025.

### ✨ Fonctionnalités principales

- 📊 **Dashboard complet** avec statistiques en temps réel
- 📄 **Gestion des factures** avec suivi du statut de paiement
- 💳 **Gestion des dépenses** par catégorie avec pourcentage déductible
- 📤 **Upload de justificatifs** (PDF, images) pour chaque facture et dépense
- 🧮 **Calcul automatique** des cotisations URSSAF et impôt sur le revenu
- 📑 **Déclarations** mensuelles/trimestrielles avec historique
- 📈 **Rapports PDF** personnalisables par période
- ⚙️ **Configuration** adaptée à votre type d'activité

### 🇫🇷 Conformité fiscale France 2025

- Taux URSSAF à jour (BIC, BNC, etc.)
- Abattement forfaitaire selon le type d'activité
- Versement libératoire de l'IR
- Barème de l'impôt sur le revenu 2025

## 🛠️ Technologies

### Backend
- **Node.js** + Express + TypeScript
- **PostgreSQL** pour la base de données
- **Multer** pour l'upload de fichiers
- **PDFKit** pour la génération de rapports

### Frontend
- **React 18** + TypeScript
- **TailwindCSS** pour le design
- **Recharts** pour les graphiques
- **React Router** pour la navigation
- **Axios** pour les appels API

### Infrastructure
- **Docker** + Docker Compose pour l'orchestration
- **Nginx** pour le serveur web
- Volumes persistants pour la base de données et les fichiers

## 🚀 Installation et démarrage

### Prérequis

- Docker et Docker Compose installés
- Ports 3000, 3001 et 5432 disponibles

### Démarrage rapide

1. **Cloner le repository** (ou naviguer vers le dossier)

```bash
cd EIPlatform
```

2. **Créer les fichiers d'environnement**

Pour le backend:
```bash
cp backend/.env.example backend/.env
```

3. **Lancer l'application avec Docker**

```bash
docker-compose up -d
```

Cela va :
- Créer la base de données PostgreSQL avec le schéma
- Compiler et lancer le backend sur le port 3001
- Compiler et lancer le frontend sur le port 3000

4. **Accéder à l'application**

Ouvrez votre navigateur : **http://localhost:3000**

### Arrêter l'application

```bash
docker-compose down
```

### Supprimer les données (reset complet)

```bash
docker-compose down -v
```

## 🔧 Développement local

### Backend

```bash
cd backend
npm install
npm run dev
```

Le backend sera disponible sur http://localhost:3001

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Le frontend sera disponible sur http://localhost:3000

## 📦 Structure du projet

```
EIPlatform/
├── backend/               # API Backend
│   ├── src/
│   │   ├── routes/       # Routes API
│   │   ├── services/     # Logique métier
│   │   └── index.ts      # Point d'entrée
│   ├── Dockerfile
│   └── package.json
│
├── frontend/             # Application React
│   ├── src/
│   │   ├── components/   # Composants réutilisables
│   │   ├── pages/        # Pages de l'application
│   │   ├── services/     # API client
│   │   └── types/        # Types TypeScript
│   ├── Dockerfile
│   └── package.json
│
├── database/             # Scripts SQL
│   └── init.sql          # Schéma de base de données
│
├── uploads/              # Fichiers téléchargés
│
└── docker-compose.yml    # Orchestration Docker
```

## 📖 Guide d'utilisation

### 1. Configuration initiale

Allez dans **Paramètres** et configurez :
- Nom de votre entreprise
- SIRET (optionnel)
- Type d'activité (BIC vente, BIC service, BNC, BNC CIPAV)
- Les taux se remplissent automatiquement selon l'activité

### 2. Gérer vos factures

- Créez vos factures clients
- Téléchargez les justificatifs PDF
- Marquez-les comme payées
- Suivez les factures en retard

### 3. Gérer vos dépenses

- Enregistrez vos dépenses par catégorie
- Définissez le % déductible
- Téléchargez les justificatifs (tickets, factures)
- Catégories prédéfinies : Loyer, Électricité, Internet, Navigo, etc.

### 4. Calculer vos cotisations

Dans **Déclarations** :
- Sélectionnez le mois/année
- Cliquez sur "Calculer"
- Voyez le montant URSSAF à déclarer
- Voyez le revenu imposable

### 5. Générer des rapports

Dans **Rapports** :
- Choisissez la période
- Générez un PDF complet
- Téléchargez le rapport
- Conservez un historique

## 💡 Conseils d'utilisation

### Dépenses déductibles

Les catégories incluent un pourcentage déductible par défaut :
- **100%** : Logiciels, matériel pro, formations
- **50%** : Loyer, électricité (usage mixte)
- **Débours** : Dépenses au nom du client (exclues du CA)

Vous pouvez ajuster ce pourcentage pour chaque dépense.

### Types de déclaration

- **Mensuelle** : Pour les déclarations URSSAF mensuelles
- **Trimestrielle** : Pour les déclarations trimestrielles
- **Annuelle** : Pour la déclaration fiscale de fin d'année

### Calculs URSSAF 2025

| Type d'activité | Taux URSSAF | Abattement |
|----------------|-------------|------------|
| BIC Vente | 12.3% | 71% |
| BIC Service | 21.2% | 50% |
| BNC | 24.6% | 34% |
| BNC CIPAV | 23.2% | 34% |

## 🔒 Sécurité et données

- Base de données PostgreSQL sécurisée
- Fichiers stockés localement dans `/uploads`
- Données isolées dans des volumes Docker
- Application monoutilisateur (usage personnel)

## 🐛 Résolution de problèmes

### Le frontend ne se charge pas

```bash
docker-compose logs frontend
```

### Erreurs de base de données

```bash
docker-compose logs postgres
docker-compose restart postgres
```

### Réinitialiser complètement

```bash
docker-compose down -v
docker-compose up -d
```

### Accéder à la base de données

```bash
docker exec -it ei-postgres psql -U ei_user -d ei_platform
```

## 📱 API Documentation

### Endpoints principaux

- `GET /api/dashboard/stats` - Statistiques du dashboard
- `GET /api/invoices` - Liste des factures
- `POST /api/invoices` - Créer une facture
- `GET /api/expenses` - Liste des dépenses
- `POST /api/expenses` - Créer une dépense
- `POST /api/attachments/upload` - Upload un fichier
- `POST /api/calculator/calculate` - Calculer les taxes
- `POST /api/reports/generate` - Générer un rapport PDF

Voir le code source dans `backend/src/routes/` pour plus de détails.

## 🚢 Déploiement en production

### Modifier les mots de passe

Dans `docker-compose.yml`, changez :
- `POSTGRES_PASSWORD`
- Ajoutez des variables d'environnement sécurisées

### Utiliser HTTPS

Ajoutez un reverse proxy (Nginx, Traefik) avec certificat SSL.

### Backups

Sauvegardez régulièrement :
```bash
docker exec ei-postgres pg_dump -U ei_user ei_platform > backup.sql
```

### Volumes de données

Les données sont dans les volumes Docker :
- `postgres_data` : Base de données
- `./uploads` : Fichiers téléchargés

## 📄 License

Usage personnel pour la gestion de votre Enterprise Individuelle.

## 🤝 Support

Pour toute question ou problème, référez-vous à :
- [Site URSSAF](https://www.urssaf.fr)
- [Service Public Pro](https://entreprendre.service-public.fr)
- Documentation des API dans le code source

---

**Fait avec ❤️ pour les entrepreneurs indépendants en France**
