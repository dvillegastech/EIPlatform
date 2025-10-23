# Quick Start - Enterprise Individuelle Platform

## Installation rapide (5 minutes)

### 1. Vérifier les prérequis

```bash
docker --version
docker-compose --version
```

Si Docker n'est pas installé : https://docs.docker.com/get-docker/

### 2. Lancer la plateforme

```bash
cd EIPlatform
docker-compose up -d
```

Attendez environ 2 minutes que tout démarre.

### 3. Accéder à l'application

Ouvrez votre navigateur : **http://localhost:3000**

## Premiers pas (10 minutes)

### Étape 1 : Configurer votre entreprise

1. Allez dans **Paramètres** (menu de gauche)
2. Remplissez :
   - Nom de l'entreprise
   - SIRET (optionnel)
   - **Type d'activité** (important !)
3. Les taux URSSAF s'ajustent automatiquement
4. Cliquez sur **Enregistrer**

### Étape 2 : Créer votre première facture

1. Allez dans **Factures**
2. Cliquez sur **Nouvelle facture**
3. Remplissez :
   - N° : FAC-001
   - Client : Nom du client
   - Dates et montants
4. **Enregistrer**

### Étape 3 : Ajouter une dépense

1. Allez dans **Dépenses**
2. Cliquez sur **Nouvelle dépense**
3. Sélectionnez une catégorie
4. Montant et description
5. **Enregistrer**

### Étape 4 : Calculer vos cotisations

1. Allez dans **Déclarations**
2. Sélectionnez le mois actuel
3. Cliquez sur **Calculer**
4. Voyez le montant URSSAF à payer

### Étape 5 : Générer un rapport

1. Allez dans **Rapports**
2. Choisissez les dates
3. Donnez un nom
4. **Générer le rapport PDF**
5. Téléchargez-le

## Arrêter / Redémarrer

### Arrêter la plateforme

```bash
docker-compose down
```

### Redémarrer

```bash
docker-compose up -d
```

### Voir les logs

```bash
docker-compose logs -f
```

## Commandes utiles

### Accéder à la base de données

```bash
docker exec -it ei-postgres psql -U ei_user -d ei_platform
```

### Sauvegarder les données

```bash
docker exec ei-postgres pg_dump -U ei_user ei_platform > backup_$(date +%Y%m%d).sql
```

### Restaurer une sauvegarde

```bash
cat backup.sql | docker exec -i ei-postgres psql -U ei_user -d ei_platform
```

### Réinitialiser complètement

```bash
docker-compose down -v
docker-compose up -d
```

## Problèmes courants

### Port déjà utilisé

Si le port 3000 ou 3001 est occupé, modifiez dans `docker-compose.yml` :
```yaml
ports:
  - "8000:80"  # Frontend sur port 8000
  - "8001:3001"  # Backend sur port 8001
```

### Erreur PostgreSQL

```bash
docker-compose restart postgres
```

### Frontend ne charge pas

```bash
docker-compose restart frontend
docker-compose logs frontend
```

## Support et documentation

- README complet : `README.md`
- Guide d'utilisation : `GUIDE_UTILISATION.md`
- Code source documenté dans `/backend/src` et `/frontend/src`

## Prochaines étapes

1. Téléchargez vos justificatifs (PDF, images)
2. Consultez le dashboard pour suivre votre activité
3. Générez des rapports mensuels
4. Utilisez la calculatrice pour vos déclarations URSSAF

**Bonne gestion ! 🎯**
