# Guide d'utilisation - Plateforme Enterprise Individuelle

## 🎯 Introduction

Cette plateforme a été conçue pour simplifier la gestion administrative et fiscale de votre **Enterprise Individuelle** en France. Elle vous aide à suivre vos revenus, dépenses, et à calculer vos cotisations URSSAF et impôts.

## 📊 Dashboard - Vue d'ensemble

### Statistiques principales

Le dashboard affiche 4 indicateurs clés :

1. **Chiffre d'affaires** : Total des factures payées du mois
2. **Dépenses** : Total des dépenses et montant déductible
3. **Cotisations URSSAF** : Montant à payer calculé automatiquement
4. **Factures en retard** : Nombre et montant des impayés

### Graphique d'évolution

Le graphique montre l'évolution mensuelle de vos revenus et dépenses sur l'année.

### Résumé fiscal

Cette section détaille :
- Revenus du mois
- Abattement forfaitaire appliqué
- Revenu imposable (après abattement)
- Montant des cotisations URSSAF

## 📄 Gestion des factures

### Créer une facture

1. Cliquez sur "Nouvelle facture"
2. Remplissez :
   - **N° Facture** : Votre numéro de facture unique
   - **Client** : Nom du client
   - **Date facture** : Date d'émission
   - **Date échéance** : Date limite de paiement
   - **Montant HT** : Montant hors taxes
   - **Montant TTC** : Montant toutes taxes comprises
   - **Description** : Détails de la prestation

### Gérer les statuts

Les factures peuvent avoir 4 statuts :
- **PENDING** (En attente) : Facture envoyée, paiement attendu
- **PAID** (Payée) : Paiement reçu
- **OVERDUE** (En retard) : Date d'échéance dépassée
- **CANCELLED** (Annulée) : Facture annulée

### Télécharger un justificatif

Cliquez sur l'icône "Upload" pour ajouter :
- PDF de la facture envoyée au client
- Confirmation de paiement
- Tout autre document relatif à la facture

### Filtrer les factures

Utilisez le menu déroulant pour filtrer par statut et voir facilement :
- Les factures à payer
- Les factures en retard
- L'historique des paiements

## 💳 Gestion des dépenses

### Catégories prédéfinies

La plateforme inclut 15 catégories courantes :

**Usage professionnel complet (100% déductible)** :
- Internet
- Téléphone
- Navigo (transports)
- Logiciels
- Matériel informatique
- Fournitures
- Formations
- Assurance professionnelle
- Comptable

**Usage mixte (50% par défaut)** :
- Loyer (quote-part professionnelle)
- Électricité

**Spécial** :
- Débours (frais au nom du client, exclus du CA)

### Créer une dépense

1. Cliquez sur "Nouvelle dépense"
2. Sélectionnez la **Catégorie**
3. Indiquez la **Date** et le **Montant**
4. Décrivez la dépense
5. Ajustez le **% déductible** si nécessaire
6. Enregistrez

### Télécharger un justificatif

Cliquez sur l'icône "Upload" pour ajouter :
- Factures fournisseurs
- Tickets de caisse
- Reçus
- Contrats

**Formats acceptés** : PDF, JPG, PNG, DOC

### Types de déduction

**Personnel** : Dépense personnelle liée à l'activité
- Exemple : loyer (50%), internet (100%)

**Débours** : Frais engagés au nom et pour le compte du client
- Non comptabilisé dans votre CA
- Nécessite justificatif au nom du client

**Non déductible** : Dépense non professionnelle (0%)

## 🧮 Déclarations et calculs

### Calculer vos cotisations

1. Allez dans **Déclarations**
2. Sélectionnez le **mois** et l'**année**
3. Cliquez sur **Calculer**

Le système affiche :
- **Chiffre d'affaires** du mois
- **Dépenses** totales et déductibles
- **Abattement forfaitaire** (selon votre activité)
- **Revenu imposable** (CA - abattement)
- **Cotisations URSSAF** à payer
- **Impôt sur le revenu** (si versement libératoire)
- **Revenu net** final

### Comprendre les calculs

#### Cotisations URSSAF
```
Montant URSSAF = CA × Taux URSSAF
```

Exemple pour BNC (24.6%) :
- CA : 3000 €
- URSSAF : 3000 × 24.6% = **738 €**

#### Revenu imposable
```
Revenu imposable = CA - Abattement forfaitaire
Abattement = CA × Taux abattement (minimum 305 €)
```

Exemple pour BNC (34%) :
- CA : 3000 €
- Abattement : 3000 × 34% = 1020 €
- Revenu imposable : 3000 - 1020 = **1980 €**

### Historique des déclarations

Consultez l'historique de toutes vos déclarations avec :
- Période concernée
- CA déclaré
- Montant URSSAF
- Statut (Draft/Submitted/Paid)

## 📈 Rapports PDF

### Générer un rapport

1. Allez dans **Rapports**
2. Choisissez le **Type** :
   - Mensuel : 1 mois complet
   - Trimestriel : 3 mois
   - Annuel : année entière
   - Personnalisé : période libre
3. Donnez un **Nom** au rapport
4. Sélectionnez les **dates de début et fin**
5. Cliquez sur **Générer**

### Contenu du rapport

Le PDF inclut :
- Informations de l'entreprise
- Résumé financier de la période
- Liste détaillée des factures
- Liste détaillée des dépenses
- Calculs URSSAF et fiscaux
- Date de génération

### Télécharger un rapport

Les rapports générés apparaissent dans le tableau.
Cliquez sur "Télécharger" pour obtenir le PDF.

### Utilisation des rapports

- Justificatif pour l'URSSAF
- Déclaration fiscale annuelle
- Suivi personnel de l'activité
- Archive comptable

## ⚙️ Paramètres

### Configuration de l'entreprise

**Nom de l'entreprise** : Votre raison sociale

**SIRET** : Votre numéro SIRET (14 chiffres)

**Type d'activité** :
- **BIC Vente** : Achat-revente de marchandises
- **BIC Service** : Services artisanaux et commerciaux
- **BNC** : Professions libérales non réglementées
- **BNC CIPAV** : Professions libérales CIPAV

### Taux de cotisation 2025

Les taux se remplissent automatiquement selon votre activité :

| Activité | URSSAF | Abattement |
|----------|--------|------------|
| BIC Vente | 12.3% | 71% |
| BIC Service | 21.2% | 50% |
| BNC | 24.6% | 34% |
| BNC CIPAV | 23.2% | 34% |

### Versement libératoire

Option permettant de payer l'IR en même temps que l'URSSAF.

**Conditions** :
- RFR 2023 < 28 797 € par part
- Taux : 1% à 2.2% selon l'activité

**Avantages** :
- Paiement simplifié
- Pas de régularisation annuelle
- Budget maîtrisé

## 💡 Cas d'usage pratiques

### Scénario 1 : Freelance informatique (BNC)

**Situation** : Développeur web, 5000 € de CA/mois

1. **Paramètres** : Type BNC, URSSAF 24.6%, Abattement 34%
2. **Revenus** : Créez vos factures clients
3. **Dépenses** :
   - Internet 40 € (100%)
   - Logiciels 50 € (100%)
   - Loyer 600 € (50% = 300 €)
4. **Déclaration** :
   - CA : 5000 €
   - URSSAF : 1230 €
   - Revenu imposable : 3300 €

### Scénario 2 : Consultante (BNC CIPAV)

**Situation** : Consultante RH, 3000 € de CA/mois

1. **Paramètres** : Type BNC CIPAV, URSSAF 23.2%
2. **Revenus** : Factures de missions
3. **Dépenses** :
   - Navigo 86 € (100%)
   - Téléphone 30 € (100%)
   - Formation 200 € (100%)
4. **Déclaration** :
   - CA : 3000 €
   - URSSAF : 696 €

### Scénario 3 : E-commerce (BIC Vente)

**Situation** : Vente en ligne, 8000 € de CA/mois

1. **Paramètres** : Type BIC Vente, URSSAF 12.3%
2. **Revenus** : Ventes mensuelles
3. **Dépenses** :
   - Marketplace fees (débours)
   - Logiciel comptabilité 20 €
4. **Déclaration** :
   - CA : 8000 €
   - URSSAF : 984 €
   - Abattement : 71% (5680 €)

## 🔐 Bonnes pratiques

### Organisation mensuelle

**Semaine 1** : Envoyer les factures du mois précédent

**Semaine 2** : Enregistrer toutes les dépenses

**Semaine 3** : Télécharger tous les justificatifs

**Semaine 4** : Calculer et déclarer à l'URSSAF

### Sauvegarde

- Téléchargez vos rapports PDF mensuellement
- Conservez les justificatifs 10 ans
- Backup Docker : `docker exec ei-postgres pg_dump`

### Fiscalité

- Vérifiez les seuils de CA (77 700 € BNC, 188 700 € BIC vente)
- Dépassement = passage au régime réel
- Déclaration annuelle 2042-C PRO

## ❓ Questions fréquentes

**Q: Puis-je déduire 100% de mon loyer ?**
R: Non, seulement la quote-part professionnelle (généralement 50% max)

**Q: Qu'est-ce qu'un débours ?**
R: Un frais engagé au nom du client (ex: achat de domaine pour lui)

**Q: Dois-je déclarer la TVA ?**
R: Non si vous êtes en franchise de TVA (micro-entreprise)

**Q: Comment changer de type d'activité ?**
R: Allez dans Paramètres et changez le type, les taux s'ajustent automatiquement

**Q: Puis-je gérer plusieurs entreprises ?**
R: Non, cette plateforme est mono-entreprise (usage personnel)

## 📞 Ressources officielles

- **URSSAF** : https://www.urssaf.fr
- **Impots.gouv** : https://www.impots.gouv.fr
- **Service Public Pro** : https://entreprendre.service-public.fr

---

**Bon courage dans votre activité d'indépendant ! 🚀**
