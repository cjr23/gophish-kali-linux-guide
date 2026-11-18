# Déploiement et évaluation d'une plateforme GoPhish en environnement de laboratoire isolé sous Kali Linux : revue méthodologique pour la sensibilisation défensive au hameçonnage

**Christian Gilbert Fodé Diouf**
Développeur full-stack — Fondateur de Teranga Academy, Dakar, Sénégal
Contact : christiandiouf23@gmail.com · GitHub : [github.com/cjr23](https://github.com/cjr23)

**Version 2.0 — Novembre 2026**

[Version PDF](Revue_GoPhish_Kali_Linux_Christian_Gilbert_Fode_Diouf.pdf) · [Version en ligne](https://cjr23.github.io/gophish-kali-linux-guide/) · [Comment citer](#comment-citer-ce-travail) · Licence [CC BY 4.0](LICENSE)

---

## Résumé

Le hameçonnage (*phishing*) demeure l'un des vecteurs d'attaque les plus répandus et les plus coûteux des systèmes d'information contemporains, exploitant non pas une vulnérabilité logicielle mais le facteur humain. La sensibilisation des utilisateurs, appuyée sur des simulations contrôlées, constitue une contre-mesure reconnue. Cet article propose une revue méthodologique et un protocole reproductible pour le déploiement de **GoPhish**, un cadriciel open source de simulation de campagnes de hameçonnage, dans un **environnement de laboratoire strictement isolé** sous Kali Linux virtualisé. Nous décrivons l'architecture expérimentale, la procédure d'installation et de durcissement (restriction de l'écoute réseau à l'interface de bouclage), la méthode de vérification du bon fonctionnement, ainsi qu'un protocole d'évaluation des acquis. L'étude met l'accent sur le **cadre éthique et légal** qui conditionne toute utilisation de tels outils : isolation, autorisation explicite, données fictives et non-collecte de secrets réels. Les résultats montrent qu'un tel environnement peut être établi de manière fiable et pédagogiquement exploitable sans aucune exposition au réseau de production. Nous concluons que la valeur d'un exercice de simulation se mesure à la progression des connaissances des participants, et non à la capture de leurs identifiants.

**Mots-clés :** hameçonnage ; ingénierie sociale ; sensibilisation à la sécurité ; GoPhish ; Kali Linux ; laboratoire isolé ; cybersécurité défensive ; reproductibilité.

---

## 1. Introduction

### 1.1 Contexte et motivation

L'ingénierie sociale, et singulièrement le hameçonnage, contourne les dispositifs techniques de défense en ciblant la décision humaine. Contrairement aux vulnérabilités logicielles, que l'on corrige par un correctif, la susceptibilité au hameçonnage ne se « corrige » que par l'apprentissage, l'entraînement et la répétition. Dans ce contexte, les **simulations contrôlées de hameçonnage** sont devenues une composante usuelle des programmes de sensibilisation : elles permettent de mesurer un taux de clic, d'identifier les populations à risque et d'évaluer l'effet des formations dans le temps.

Ces outils présentent toutefois une dualité d'usage caractéristique de la cybersécurité : le même cadriciel qui sert à *éduquer* peut servir à *tromper*. Il est donc indispensable que tout travail expérimental soit encadré par un protocole rigoureux, isolé du réseau de production et subordonné à une autorisation écrite.

### 1.2 Objectif et contributions

Cet article constitue une **revue méthodologique appliquée**. Il ne s'agit pas d'une étude offensive, mais de la formalisation d'un protocole de laboratoire reproductible, destiné à l'enseignement de la sécurité défensive. Les contributions sont les suivantes :

1. Un **protocole d'installation reproductible** de GoPhish sous Kali Linux virtualisé, documenté étape par étape ;
2. Une **procédure de durcissement** limitant l'ensemble des services à l'interface de bouclage (`127.0.0.1`), garantissant l'absence d'exposition réseau ;
3. Une **méthode de vérification** du bon fonctionnement fondée sur l'observation des ports en écoute et sur l'interrogation du service ;
4. Un **cadre éthique et légal** explicite, posé comme condition préalable et non comme annexe ;
5. Un **protocole d'évaluation des acquis** permettant de mesurer l'atteinte des objectifs pédagogiques.

### 1.3 Objectifs pédagogiques opérationnels

À l'issue du protocole, l'apprenant est capable de :

- vérifier l'architecture matérielle et la configuration réseau d'un système Kali Linux ;
- télécharger GoPhish depuis sa source officielle et en extraire l'archive ;
- configurer les services pour qu'ils restent accessibles uniquement en local ;
- démarrer la plateforme et accéder à son interface d'administration ;
- identifier les principales rubriques fonctionnelles de l'interface ;
- expliquer les risques du hameçonnage et les réflexes de prévention associés.

---

## 2. Cadre éthique et légal (prérequis contraignant)

> **Règle essentielle.** Ce travail porte exclusivement sur une installation de laboratoire et une sensibilisation défensive. GoPhish ne doit jamais être employé pour tromper des personnes, collecter des identifiants ou émettre des messages sans **autorisation écrite** et **périmètre clairement défini**.

Le respect des principes suivants est une condition de validité — scientifique autant que légale — de l'ensemble du protocole :

| # | Principe | Justification |
|---|----------|---------------|
| 1 | Utiliser uniquement des comptes de test et des données fictives | Évite tout traitement de données personnelles réelles |
| 2 | Ne jamais demander ni enregistrer de véritables mots de passe | Un exercice ne doit produire aucun secret exploitable |
| 3 | Maintenir l'interface d'administration sur `127.0.0.1` | Interdit tout accès distant à la console |
| 4 | Ne pas exposer le serveur à Internet ni au réseau de l'établissement | Confine l'expérience au laboratoire |
| 5 | Ne configurer aucune redirection de ports sur le routeur | Empêche toute mise en ligne involontaire |
| 6 | Ne publier aucun secret (mot de passe, clé, base, configuration) sur un dépôt public | Prévient la fuite d'informations sensibles |
| 7 | Obtenir l'accord explicite du responsable du laboratoire avant tout exercice impliquant des tiers | Fonde la licéité de l'opération |

Ces règles découlent directement du principe de **minimisation des risques** : l'environnement doit être isolé, documenté et utilisé avec autorisation.

---

## 3. Matériel et méthodes

### 3.1 Architecture expérimentale

L'environnement de référence repose sur Kali Linux exécuté dans VirtualBox, avec une configuration réseau en mode **NAT**. Le mode NAT isole par construction la machine virtuelle du réseau physique : on ne doit donc pas supposer que les équipements physiques soient visibles depuis la machine virtuelle. Les valeurs reportées ci-dessous sont celles relevées sur la machine de démonstration et peuvent différer d'une installation à l'autre.

| Élément | Valeur observée |
|---------|-----------------|
| Système | Kali Linux sous VirtualBox |
| Interface réseau | `eth0` |
| Adresse IPv4 de la machine | `10.0.2.15` |
| Réseau virtuel | `10.0.2.0/24` |
| Passerelle NAT | `10.0.2.2` |
| Administration GoPhish | `https://127.0.0.1:3333` |
| Port local de démonstration conseillé | `127.0.0.1:8080` |

### 3.2 Matériel logiciel

- **GoPhish** — cadriciel open source de simulation de campagnes, distribué sous forme d'archive binaire pour Linux ([dépôt officiel](https://github.com/gophish/gophish)).
- **Utilitaires système** — `wget`, `unzip`, `curl`, ainsi que les outils standards d'inspection réseau (`ip`, `ss`).

### 3.3 Reproductibilité

L'ensemble de la procédure est conçu pour être reproductible à partir d'une installation Kali standard. Chaque étape est accompagnée des commandes exactes et du résultat attendu, de manière à permettre la vérification indépendante des observations.

---

## 4. Procédure expérimentale

### 4.1 Préparation du système

Mise à jour de la liste des paquets :

```bash
sudo apt update
```

Installation des utilitaires nécessaires :

```bash
sudo apt install wget unzip curl -y
```

Vérification de l'architecture matérielle :

```bash
uname -m
```

Pour une archive Linux 64 bits x86, le résultat attendu est généralement :

```
x86_64
```

Affichage de la configuration réseau :

```bash
ip route
```

Dans l'environnement de démonstration, la route indique l'adresse `10.0.2.15` et le réseau `10.0.2.0/24`.

### 4.2 Acquisition et extraction de GoPhish

Télécharger la version Linux correspondant à l'architecture de la machine depuis la **page officielle des versions** du projet, en privilégiant les fichiers publiés par le projet lui-même :

> Page officielle : <https://github.com/gophish/gophish/releases>

Exemple de commandes, l'archive `v0.12.1` étant supposée présente dans `Downloads` :

```bash
cd ~/Downloads
ls -lh gophish*.zip
unzip gophish-v0.12.1-linux-64bit.zip -d ~/gophish
cd ~/gophish
ls -lh
```

Après extraction, le dossier doit contenir notamment l'exécutable `gophish`, le fichier `config.json` et les répertoires de ressources du programme.

> **Archive introuvable.** La commande `unzip` doit être exécutée avec le nom exact de l'archive. En vérifier l'emplacement avec `ls -lh ~/Downloads` ; si le nom ou la version diffère, adapter la commande au fichier réellement téléchargé.

### 4.3 Durcissement : restriction de l'écoute à l'interface locale

Avant tout démarrage, les services sont limités à la machine locale. Ouverture du fichier de configuration :

```bash
cd ~/gophish
nano config.json
```

Dans la section `admin_server`, l'adresse d'écoute de l'administration doit être :

```json
"listen_url": "127.0.0.1:3333"
```

Dans la section `phish_server`, pour un environnement de démonstration strictement local, utiliser un port non privilégié, par exemple :

```json
"listen_url": "127.0.0.1:8080"
```

Enregistrer sous `nano` avec `Ctrl + O`, valider avec `Entrée`, puis quitter avec `Ctrl + X`.

> **Précaution de configuration.** Ne modifier que les valeurs concernées dans le fichier JSON complet : ne pas remplacer l'intégralité du fichier par les deux lignes ci-dessus. Vérifier la validité syntaxique (virgules, guillemets). Le serveur de démonstration ne doit écouter ni sur `0.0.0.0` ni sur une interface publiée sur Internet.

### 4.4 Démarrage et authentification initiale

Depuis le dossier GoPhish :

```bash
cd ~/gophish
chmod +x gophish
./gophish
```

Au premier démarrage, le terminal peut afficher un mot de passe initial généré pour le compte `admin`. Il convient d'utiliser le mot de passe affiché par l'instance effectivement lancée.

> Le mot de passe initial est une **information confidentielle** : il ne doit être reporté ni dans un document, ni dans une capture publique, ni dans un dépôt public.

Accès à l'interface via Firefox :

```
https://127.0.0.1:3333
```

L'authentification s'effectue avec l'identifiant `admin` et le mot de passe initial. Après connexion, remplacer immédiatement le mot de passe temporaire par un mot de passe unique et robuste. Le navigateur peut signaler un certificat auto-signé pour l'interface locale ; il convient de vérifier que l'adresse affichée est bien `127.0.0.1`.

> **Ne pas fermer le terminal.** Tant que GoPhish s'exécute au premier plan, le terminal doit rester ouvert. Pour arrêter proprement le programme en fin de séance, revenir dans ce terminal et presser `Ctrl + C`.

---

## 5. Résultats : description fonctionnelle et vérification

### 5.1 Structure de l'interface d'administration

L'interface présente plusieurs rubriques dont la présence et le libellé exact peuvent varier légèrement selon la version installée.

| Rubrique | Rôle général |
|----------|--------------|
| Dashboard | Vue d'ensemble des activités et des statistiques |
| Campaigns | Suivi des simulations autorisées |
| Users & Groups | Gestion des utilisateurs de test et des groupes autorisés |
| Email Templates | Gestion des modèles de messages employés dans les exercices |
| Landing Pages | Pages de démonstration et d'apprentissage |
| Sending Profiles | Paramètres techniques d'envoi — à ne pas utiliser pour contacter des tiers sans autorisation |

### 5.2 Vérification du fonctionnement

Dans un second terminal, observation des ports en écoute :

```bash
sudo ss -lntp | grep -E ':3333|:8080|:80'
```

Interrogation de l'interface d'administration locale :

```bash
curl -k -I https://127.0.0.1:3333
```

Une réponse HTTP atteste que le service répond. Si le port `80` apparaît alors que la configuration locale attend le port `8080`, arrêter GoPhish et revoir la valeur `phish_server` dans `config.json`. L'observation attendue est la suivante : seuls les ports liés à `127.0.0.1` répondent, confirmant l'absence d'exposition réseau.

---

## 6. Discussion : résolution des anomalies

Le tableau ci-dessous synthétise les anomalies les plus fréquemment observées et la démarche de diagnostic associée.

| Problème rencontré | Vérification ou solution |
|--------------------|--------------------------|
| Archive ZIP introuvable | Vérifier le dossier avec `ls -lh ~/Downloads` et reprendre le nom exact du fichier |
| Le dossier `gophish` est vide | Relancer `unzip` en indiquant le chemin complet de l'archive |
| Page `3333` inaccessible | Vérifier que GoPhish s'exécute et que `admin_server` écoute sur `127.0.0.1:3333` |
| Mot de passe refusé | Vérifier le mot de passe affiché par l'instance et le compte `admin` ; ne pas publier le secret |
| Port déjà utilisé | Identifier le processus avec `sudo ss -lntp` et choisir un port local libre |
| Interface lente | Tester avec `curl -k -I https://127.0.0.1:3333` et examiner les messages du terminal |

La majorité des anomalies relève de deux causes : une **désynchronisation entre le nom d'archive et la commande** d'une part, et une **incohérence de configuration réseau** d'autre part. Ces deux classes d'erreurs sont détectables par les commandes de vérification de la section 5.2, ce qui souligne l'intérêt d'une démarche de validation systématique.

---

## 7. Évaluation des acquis

### 7.1 Travaux pratiques

Les exercices suivants sont réalisés dans le laboratoire local :

1. Afficher l'architecture avec `uname -m` et expliquer le résultat.
2. Afficher la route réseau avec `ip route` et identifier l'adresse IP de la machine.
3. Localiser l'archive GoPhish et vérifier son nom avec `ls`.
4. Expliquer pourquoi l'interface d'administration doit écouter sur `127.0.0.1`.
5. Ouvrir le tableau de bord dans Firefox.
6. Identifier au moins quatre rubriques de l'interface et expliquer leur rôle.
7. Citer cinq signes permettant de repérer un message de hameçonnage.

### 7.2 Questions de révision

- À quoi sert GoPhish dans un programme de sensibilisation ?
- Quelle est la différence entre `127.0.0.1` et `0.0.0.0` ?
- Pourquoi ne faut-il jamais enregistrer de véritables mots de passe pendant une simulation ?
- Quelle commande permet de vérifier les ports en écoute ?

---

## 8. Limites

Cette étude présente plusieurs limites qu'il convient d'expliciter :

- **Généralisabilité.** Les valeurs réseau rapportées sont propres à une configuration VirtualBox/NAT et ne sauraient être transposées sans adaptation.
- **Portée défensive.** Le protocole s'arrête volontairement à la mise en place et à la découverte de l'interface ; il n'aborde pas la conduite de campagnes, qui relève d'un cadre organisationnel et juridique distinct.
- **Mesure de l'efficacité.** L'évaluation proposée porte sur l'acquisition de connaissances procédurales ; la mesure longitudinale de la réduction du taux de susceptibilité au hameçonnage dépasse le cadre de ce travail.

---

## 9. Conclusion et perspectives

Nous avons présenté un protocole reproductible de déploiement de GoPhish en environnement isolé sous Kali Linux, assorti d'une procédure de durcissement, d'une méthode de vérification et d'un cadre éthique contraignant. L'environnement ainsi établi est fiable, documenté et exploitable à des fins pédagogiques sans aucune exposition au réseau de production.

La suite de l'apprentissage doit rester orientée vers la **prévention** : reconnaître les messages suspects, comprendre les mécanismes d'ingénierie sociale et développer des réflexes de signalement. Nous rappelons le principe directeur de ce travail :

> La réussite d'un exercice de sensibilisation se mesure à la progression des connaissances et à la capacité des participants à éviter les pièges — **jamais** à la récupération de leurs secrets.

Les perspectives incluent l'intégration d'une mesure longitudinale des taux de susceptibilité, la comparaison de plusieurs modalités de formation, et l'étude de l'effet de la répétition des simulations sur la rétention à long terme.

---

## Références

1. GoPhish — Dépôt officiel du projet. <https://github.com/gophish/gophish>
2. GoPhish — Versions publiées. <https://github.com/gophish/gophish/releases>
3. GoPhish — Documentation du projet. <https://docs.getgophish.com/>
4. Kali Linux — Documentation officielle. <https://www.kali.org/docs/>
5. Oracle VM VirtualBox — Manuel utilisateur, chapitre « Network Address Translation (NAT) ». <https://www.virtualbox.org/manual/>

---

## Comment citer ce travail

**Format APA :**

Diouf, C. G. F. (2026). *Déploiement et évaluation d'une plateforme GoPhish en environnement de laboratoire isolé sous Kali Linux : revue méthodologique pour la sensibilisation défensive au hameçonnage* (Version 2.0). Teranga Academy. https://cjr23.github.io/gophish-kali-linux-guide/

**BibTeX :**

```bibtex
@techreport{diouf2026gophish,
  author      = {Diouf, Christian Gilbert Fodé},
  title       = {Déploiement et évaluation d'une plateforme GoPhish en environnement de laboratoire isolé sous Kali Linux : revue méthodologique pour la sensibilisation défensive au hameçonnage},
  institution = {Teranga Academy},
  address     = {Dakar, Sénégal},
  type        = {Revue méthodologique},
  number      = {Version 2.0},
  year        = {2026},
  month       = nov,
  language    = {french},
  url         = {https://cjr23.github.io/gophish-kali-linux-guide/}
}
```

---

## Avertissement

Ce document est un support pédagogique à vocation **défensive**. Il décrit la mise en place d'un environnement de laboratoire isolé. Toute utilisation de GoPhish en dehors d'un périmètre autorisé, documenté et consenti par écrit est susceptible de constituer une infraction. L'auteur décline toute responsabilité en cas d'usage détourné.

---

*© 2026 Christian Gilbert Fodé Diouf. Document distribué à des fins éducatives.*
