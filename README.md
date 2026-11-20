# MBM · MBM Desk

Portail client concept pour MBM Gestion parasitaire, réalisé par Winnia (de l’accroche-porte à la protection).
Adresse : **https://mbmdesk.winnia.win** (Cloudflare Pages, redéploiement à chaque `git push` sur `main`).
Dépôt : https://github.com/jarseneau-code/mbmdesk

Trois parcours de cinq étapes, bâtis sur la même structure (accroche-porte, étapes, barre de démo, console) :

| Parcours | Étapes |
| --- | --- |
| Nouveau client | Évaluation · Plan d’action · Inspection gratuite · Entente signée en ligne · Ma protection |
| Renouvellement annuel | Bilan 2026 · Programme 2027 (prix fidélité) · Ajustements · Renouvellement signé · Ma protection |
| Suivi d’entente de plusieurs années | Mon entente · Bilan 2026 · Budget 2027 · Approbation (avenant) · Année 2027 |

- Le rythme est celui de la gestion parasitaire : un problème de nuisibles est urgent, donc le plan démarre tout
  de suite (intervention initiale dans les 48 heures, offerte à 49,99 $ cet automne, puis suivi), et les quatre visites
  de prévention suivent en 2027. Le calendrier va de novembre à octobre.
- L’évaluation pose les questions d’un conseiller en gestion parasitaire : signes observés (crottes, grattements,
  insectes, piqûres…), pièces touchées, fréquence, occupants et animaux, sous-sol, ce qui touche la maison. La maison
  en coupe réagit à chaque réponse : pièces atteintes, signes, points d’entrée; « Automne 2027 » montre le périmètre
  protégé. Chaque traitement recommandé vient d’une réponse (exclusion des rongeurs, stations d’appâts verrouillées,
  blattes et fourmis, punaises de lit, guêpes, bouclier extérieur…).
- **Indice de protection** de 0 à 100, suivi visite par visite.
- Recommandations des experts : un technicien ou une **entomologiste** propose un service depuis la console.

## Les deux façons de montrer la démo

1. **Fichier autonome** (rencontre, ordinateur portable) : `dist/mbm-desk.html`, un seul fichier, sans mot de passe,
   qui fonctionne même sans Internet (images, polices et bibliothèques incluses). Le refaire :
   ```sh
   node tools/standalone.mjs
   ```
   Ce fichier est en clair : le garder pour les présentations, ne jamais le déposer dans `public/`.
2. **Site en ligne**, derrière un mot de passe (voir plus bas). La page d’entrée s’appelle **Winnia espace client**,
   « préparé pour MBM » : à côté du formulaire, un plan d’inspection de la maison en coupe se dessine au balayage,
   avec ses points d’entrée qui battent. Chaque caractère tapé en colmate un; le bon mot de passe referme le
   périmètre, le bleu MBM couvre la scène et le portail s’ouvre. Français ou anglais selon le navigateur.

Dans les deux cas, chaque client arrive sur son accroche-porte : avis de passage de sa conseillère et coupon perforé.
Le bon code détache le coupon et ouvre son portail. Console de l’équipe MBM : bouton **Équipe MBM** ou `#admin`
(le code de démo s’affiche sur place).

## Ce que la démo montre

- **La barre de démo** (en bas de l’écran) change d’exemple et fait avancer le dossier d’une étape à l’autre :
  résidentiel (famille Tremblay, Boucherville), renouvellement annuel (famille Bergeron, Lévis), entente de 4 ans
  (Gestion Riverain, 4 immeubles), agroalimentaire multisite (Aliments Nordelys, 3 sites, registre des stations pour
  l’audit HACCP), copropriété (Les Jardins du Parc, 48 unités), client avec une recommandation en attente
  (Desjardins), client fidèle avec historique (Simard).
- **Renouvellement annuel** (famille Bergeron, cliente depuis 2021, `#bergeron`) : bilan 2026 avec les quatre visites
  et leurs rapports, l’appel de service réglé en 20 h, ce que le technicien a observé, l’indice de 58 à 86 et
  « aucune souris dans la maison ». Le client note son année; le programme 2027 garde ce qui a marché et ajoute ce
  qui manque, au prix fidélité jusqu’au 15 décembre. Les changements (sous-sol aménagé, bébé, nouvel animal, bois
  de chauffage…) ajustent la superficie et les consignes. Signature en ligne, contresignature du bureau.
- **Entente de plusieurs années** (Gestion Riverain, entente 2025-2028 à la fin de l’an 2, `#riverain`) : les quatre
  années, les engagements (indice de 80 et plus, interventions faites, appels réglés en 24 h, rapports), le bilan
  immeuble par immeuble en PDF pour le conseil d’administration, le budget 2027 indexé de 3 % avec options tirées du
  bilan, l’approbation signée (avenant, bon de commande) et l’année 2027.
- **Console** : pipeline en trois onglets (nouveaux clients, renouvellements, ententes), relances rédigées pour chaque
  étape, statistiques par source (accroche-porte, ligne 24/7, site web, référence, commercial) et par secteur.
- **Mon compte** : montant exigible, prélèvements, plan de paiement, factures et état de compte en PDF, paiement de
  démonstration (rien n’est prélevé).
- **CRM** : connexion de démonstration dans la console (Salesforce, HubSpot, Dynamics 365, Zoho).
- Aucune page n’est indexée : balise `robots`, en-tête `X-Robots-Tag` (`public/_headers`) et `robots.txt`.

## Comment le site en ligne est protégé

Le site est statique (Cloudflare Pages, dossier `public/`). Rien de lisible n’y est déposé :

- Le portail entier (page, scripts, styles, logos, illustrations) est réuni dans un seul paquet **chiffré**,
  `public/bundle/app.<empreinte>.bin` : AES-256-GCM, clé dérivée du mot de passe par PBKDF2-SHA256
  (600 000 itérations, sel aléatoire).
- `public/index.html` ne contient que le formulaire et les paramètres de déchiffrement.
- « Se souvenir de cet appareil » garde la clé dans le navigateur; sinon, elle est oubliée à la fermeture de
  l’onglet. Le bouton **Verrouiller** ou l’adresse `mbmdesk.winnia.win/#lock` oublie l’appareil.
- Le mot de passe n’est jamais écrit dans ce dépôt : l’outil de publication le reçoit par la variable
  d’environnement `MBM_PASSWORD`. `site.json` (créé à la première publication) ne garde que le sel et un témoin
  chiffré.

## Mettre en ligne (première fois)

Déjà fait le 19 novembre 2026 (étapes 1 et 2). Il reste à brancher Cloudflare si ce n’est pas fait (étapes 3 et 4).

1. Publier avec le mot de passe choisi (crée `site.json`, `public/index.html` et `public/bundle/`) :
   ```sh
   MBM_PASSWORD='…' node tools/publish.mjs
   ```
2. Créer le dépôt GitHub `jarseneau-code/mbmdesk` et y envoyer ce dossier.
3. Cloudflare → **Workers & Pages** → **Create application** → onglet **Pages** → **Import an existing Git
   repository** → choisir `jarseneau-code/mbmdesk` → **Production branch** : `main` · **Framework preset** : None ·
   **Build command** : `exit 0` · **Build output directory** : `public` → **Save and Deploy**.
4. **Custom domains** → `mbmdesk.winnia.win` → **Activate domain**.

## Mettre à jour

1. Modifier les sources dans `app/` (`app/js/*.js`, `app/styles.css`, images dans `app/assets/`).
2. `MBM_PASSWORD='…' node tools/publish.mjs` (assemble, chiffre, écrit `public/` et vérifie le tout).
3. `git add -A && git commit -m "Mise à jour du portail" && git push`.

Page d’entrée seulement (`tools/gate.html`) : `node tools/publish.mjs --gate`, sans mot de passe.
Changer le mot de passe : `MBM_PASSWORD='nouveau' node tools/publish.mjs --new-password`.
Essayer avant d’envoyer : `python3 -m http.server -d public 8080`, puis http://localhost:8080.

## Structure

| Chemin | Rôle |
|---|---|
| `app/js/`, `app/styles.css` | sources du portail |
| `app/assets/mbm-logo.png`, `mbm-logo-blanc.png` | logo MBM (couleur et lettrage blanc), tirés du logo secondaire fourni; ils voyagent dans le paquet chiffré |
| `app/assets/maison.webp`, `detail.webp` | illustrations du portail (maison au crépuscule avec le camion MBM; fondation colmatée et station d’appâts), dessinées pour la démo |
| `public/index.html`, `public/bundle/` | page d’entrée et portail chiffré, produits par `tools/publish.mjs` |
| `public/404.html` | adresses courtes (`/tremblay` → `/#tremblay`) et page introuvable |
| `public/_headers`, `public/robots.txt` | non-indexation et en-têtes de sécurité |
| `public/favicon.svg` | icône du portail (la feuille MBM) |
| `tools/publish.mjs`, `tools/check.mjs` | publication chiffrée et vérification obligatoire avant chaque envoi |
| `tools/build.mjs`, `tools/lib.mjs` | assemblage de la page, chiffrement (Web Crypto, Node 20+) |
| `tools/standalone.mjs`, `tools/vendor/` | version autonome hors ligne (jsPDF, qrcode-generator, polices Geist et Instrument Serif) |
| `tools/gate.html`, `tools/logo.svg` | page d’entrée et logo Winnia |

## Crédits et droits

- Le logo et la marque MBM appartiennent à MBM Gestion parasitaire. Ils servent ici à une démo privée, une
  proposition de Winnia; confirmer les droits avant toute diffusion publique.
- Clients, conseillers, adresses, prix et rapports sont fictifs; les prix sont une grille de démonstration.
- Les illustrations sont dessinées pour la démo. Si MBM fournit ses propres photos (camion, techniciens), elles
  remplacent `maison.webp` et `detail.webp` sans autre changement.
- Bibliothèques : qrcode-generator et jsPDF (licence MIT). Polices : Geist, Geist Mono et Instrument Serif (licence OFL).

## Règles

- Ne jamais déposer le portail, une image ou `dist/` en clair dans `public/` : `node tools/check.mjs` doit passer
  avant chaque `git push` (`tools/publish.mjs` le lance lui-même).
- Ne jamais écrire le mot de passe du site dans ce dépôt (ni dans un message de commit).
- Prérequis : Node 20 ou plus récent, aucune dépendance à installer.
