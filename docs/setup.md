# Daglig brug

Hvis du er kommet igennem installationsguiden i [README.md](../README.md) kan du nu hente dit skema på enten
<http://localhost:9002/?laerer=LÆRER-ID&uger=2&type=laerer&skole=SKOLE-ID> eller <http://localhost:9002/?skole=SKOLE-ID&elev=ELEV-ID>.

Du kan enten manuelt gemme den genererede .ics fil og efterfølgende uploade til Google Calendar, Outlook eller tilsvarende. Hvis (når) det bliver trættende i længden er der flere andre muligheder. Begge antager at du har en computer tændt 24 timer i døgnet og at den er tilgængelig udefra, enten med en webserver, eller på port 9002.


## Mulighed 1, Webserver (ANBEFALES)

Hvis du har en installeret webserver (f.eks. Apache eller nginx) kan du med et dagligt cron-job hente kalenderen ned et par gange i døgnet med et script i stil med dette

```
# cron script
cd /var/www/html/SECRET-PATH
wget "http://127.0.0.1:9002/?laerer=LÆRER-ID&uger=11&type=laerer&skole=SKOLE-ID" -O kalender.ics
```
Så burde din kalender være tilgængelig på en adresse noget i retning af
```
http://DIN-IP-ADRESSE-ELLER-DOMÆNENAVN-HER/SECRET-PATH/kalender.ics
```
og den adresse kan du så importere i Google Calendar under "Add by url" eller lignende.

Bemærk at ændringer i dit skema først dukker op i din kalender efter cron har kørt **og** Google har været forbi din webserver og hente den nyeste udgave af kalenderen. Specielt det sidste er svært at vide præcist hvornår sker.

## Mulighed 2, direkte adgang til port 9002 (ANBEFALES IKKE)!

Hvis du ikke har nogen skrubler ved potentielt at gøre kalender for **ALLE ELEVER OG LÆRERE PÅ DIN SKOLE OFFENTLIGT TILGÆNGELIGE**, så indsæt din faste ip-adresse eller domænenavn i adressen i stedet for localhost, og tilføj til Google Calendar under "Add by url":

Lærer: <http://DIN-IP-ADRESSE-ELLER-DOMÆNENAVN-HER:9002/?laerer=LÆRER-ID&uger=2&type=laerer&skole=SKOLE-ID>

Elev: <http://DIN-IP-ADRESSE-ELLER-DOMÆNENAVN-HER:9002/?skole=SKOLE-ID&elev=ELEV-ID>


# Tor

Hvis du gerne vil at programmet henter skemaet fra Lectio gennem [Tor](https://www.torproject.org/) så er det muligt. (Hvis du ikke er sikker på hvad det betyder har du nok ikke brug for det...)

1. Installer tor, se [Option two: Tor on Ubuntu or Debian](https://www.torproject.org/docs/debian.html.en#ubuntu)
2. I filen `.env` ret til
```
TOR_ENABLED=true
```
