# CMS-Einrichtung – Rader's Waldschänke & Bootsvermietung

Das Login ist **bereits eingerichtet** und komplett getrennt von den anderen
Websites: kein GitHub-Account nötig, nur E-Mail + Passwort. Technisch läuft
das über einen eigenen, nur für diese Website zuständigen Cloudflare-Worker
(`cms-auth-ebnisee`). Zugangsdaten hat Hannes. Passwort ändern:
`wrangler secret put AUTH_PASSWORD_HASH` im Ordner `cms-auth-workers/ebnisee`
(Hash mit `node generate-credentials.js <neues-passwort>` erzeugen).

---

## Was ist `/admin`?

Unter `https://ihre-domain/admin` öffnet sich das Sveltia CMS – eine einfache
Weboberfläche, mit der Sie Texte, Preise und Kontaktdaten der Website selbst
bearbeiten können, ganz ohne Programmierkenntnisse. Änderungen werden beim
Speichern automatisch als Commit in das GitHub-Repository
`Hannes0777/ebnisee-verleih` geschrieben.

## Was Sie damit bearbeiten können

| Bereich im CMS | Was ändert sich auf der Website |
|---|---|
| 🚣 Bootsvermietung & Preise | Name, Personenzahl, Beschreibung und Preise (30/60 Min.) für alle 4 Boote – erscheint automatisch **sowohl** in den Boots-Karten **als auch** in der Preistabelle darunter. "Auf Anfrage" und die "Beliebt"-Auszeichnung lassen sich pro Boot umschalten. |
| 🍺 Biergarten | Die drei Angebots-Karten (Essen & Trinken, Liegewiese & See, Events & Gruppen) mit Titel und je 4 Stichpunkten, die zwei Kennzahlen (Sitzplätze/Events) und das Zitat. |
| 👨‍👩‍👧‍👦 Familie Rader | Der Textbereich "Aus Liebe und Tradition am Ebnisee": Überschrift, beide Absätze und die Namen der Familie. |
| ⚙️ Einstellungen → Startseite | Überschrift, Untertitel, die 4 kleinen Hinweis-Pillen und die 3 Kennzahlen im Willkommensbereich. |
| ⚙️ Einstellungen → Kontakt, Adresse & Öffnungszeiten | E-Mail-Adresse, Betriebsname, Adresse, Saison und die beiden Zeilen der Öffnungszeiten-Tabelle (Bootsvermietung/Biergarten). Erscheint automatisch im Kontaktbereich, im Anfahrt-Bereich **und** in der Fußzeile. |
| ⚙️ Einstellungen → Allgemeine Seiteninfos | Seitentitel, Meta-Beschreibung und die Vorschautexte für WhatsApp/Facebook (Open Graph). |

## Workflow

```
1. https://ihre-domain/admin öffnen
2. Mit E-Mail + Passwort anmelden
3. Inhalt bearbeiten & speichern
4. → Im Hintergrund wird automatisch ein Commit erstellt
5. → Die Website baut sich neu und ist nach ein paar Minuten aktualisiert
```

## Bilder / Uploads

Dieser Durchgang macht noch keine Bild-Upload-Felder im CMS verfügbar (Fotos
bleiben vorerst fest im Template hinterlegt). Der Upload-Ordner ist aber
bereits vorbereitet: Dateien, die später über ein Bild- oder Datei-Feld
hochgeladen werden, landen automatisch in `/uploads/` und sind sofort unter
diesem Pfad auf der Website abrufbar.

## Kontaktformular (Anfrage-Formular)

Das Formular verschickt echte E-Mails über einen eigenen Cloudflare-Worker
(`contact-form-ebnisee`) + [Resend](https://resend.com).

> ⚠️ **Vor Übergabe an den echten Kunden unbedingt ändern:** Anfragen landen
> aktuell testweise bei `ehmann.hannes07@gmail.com`, nicht bei Familie Rader.
> Umstellen auf die echte Adresse (z.B. `info@biergarten-ebnisee.de`):
> ```bash
> cd contact-form-workers/ebnisee
> echo -n "info@biergarten-ebnisee.de" | npx wrangler secret put TO_EMAIL
> ```
> Details (Absenderadresse/Domain-Verifizierung) siehe `contact-form-workers/README.md`.

## Troubleshooting

| Problem | Lösung |
|---|---|
| E-Mail/Passwort falsch | Zugangsdaten bei Hannes erfragen; Passwort kann jederzeit neu gesetzt werden (siehe oben) |
| "Zu viele Anmeldeversuche" | Kurz warten (unter einer Minute) und erneut versuchen |
| Änderungen erscheinen nicht | 1–2 Minuten warten, bis der Build durchgelaufen ist; Browser-Cache leeren |
