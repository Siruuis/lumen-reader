# Signature de code (gratuite) via SignPath Foundation

Objectif : signer l'installateur Windows pour **réduire / supprimer l'alerte
SmartScreen**, gratuitement, parce que `lumen-reader` est open-source.

Tant que ce n'est pas configuré, les releases sortent **non signées** (le
pipeline fonctionne quand même). Une fois les variables ci-dessous définies,
chaque `npm run release` produit un `.exe` **signé** automatiquement.

## 1. Créer le projet sur SignPath

1. Va sur **https://signpath.io**, connecte-toi avec ton compte GitHub.
2. Demande l'adhésion au programme open-source **SignPath Foundation**
   (gratuit) pour le dépôt `Siruuis/lumen-reader`.
3. Une fois approuvé, crée un **projet** (ex. slug `lumen-reader`) et note :
   - l'**Organization ID** (UUID de ton organisation),
   - le **Project slug**,
   - le **Signing policy slug** (ex. `release-signing`),
   - l'**Artifact configuration slug** (configuration qui décrit le `.exe` à signer).
4. Installe l'**application GitHub SignPath** sur le dépôt.
5. Crée un **API token** dans SignPath.

## 2. Renseigner GitHub

Dans le dépôt → **Settings → Secrets and variables → Actions** :

**Secret :**
| Nom | Valeur |
| --- | --- |
| `SIGNPATH_API_TOKEN` | le token API SignPath |

**Variables :**
| Nom | Valeur |
| --- | --- |
| `SIGNPATH_ORG_ID` | l'Organization ID |
| `SIGNPATH_PROJECT_SLUG` | le slug du projet (ex. `lumen-reader`) |
| `SIGNPATH_POLICY_SLUG` | le slug de la signing policy (ex. `release-signing`) |
| `SIGNPATH_ARTIFACT_SLUG` | le slug de l'artifact configuration |

> La présence de `SIGNPATH_PROJECT_SLUG` suffit à activer la voie signée dans
> `.github/workflows/release.yml`.

## 3. Publier une version signée

```bash
npm run release
```

Le workflow : build (non publié) → **signature SignPath** → régénération de
`latest.yml` (le hash doit correspondre au binaire signé) → publication dans
GitHub Releases. Les apps installées se mettent à jour comme d'habitude.

## Bon à savoir

- Le certificat SignPath Foundation est **OV** : SmartScreen se calme nettement,
  et la réputation finit de disparaître l'alerte avec les téléchargements.
- Pour une confiance **immédiate** (zéro alerte dès le 1er download), il faut un
  certificat **EV** ou **Azure Trusted Signing** (payant). SignPath gratuit reste
  le meilleur rapport coût/bénéfice pour un projet perso open-source.
- Le `.blockmap` est supprimé après signature (les MAJ se font alors en
  téléchargement complet plutôt qu'en différentiel — sans impact fonctionnel).
