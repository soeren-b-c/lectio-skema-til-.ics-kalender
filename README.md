# Lectioskema til .ics

Node http server der konverterer fra lectioskemaer til .ics formatet.

Spørgsmål, kommentarer, pull requests osv. meget velkomne!


## Installationsguide

Det antages at der installeres på en Ubuntu / Linux-lignende platform.

1. Installer Node.js
Hent nyeste udgave fra <https://nodejs.org/en/download/>
2. Hent filerne, pak ud, naviger til den udpakkede mappe
```
wget https://github.com/soeren-b-c/node-lectio-til-ics/archive/master.zip
unzip master.zip
cd node-lectio-til-ics-master
```
3. Installer nødvendige pakker
```
npm install
```
4. Find dit SKOLE-ID og LÆRER-ID / ELEV-ID  i adressefeltet i dit personlige Lectio-skema.
Eksempel lærer: https://www.lectio.dk/lectio/SKOLE-ID/SkemaNy.aspx?type=laerer&laererid=LÆRER-ID
Eksempel elev: https://www.lectio.dk/lectio/SKOLE-ID/SkemaNy.aspx?type=elev&elevid=ELEV-ID
5. Rediger filen `sample.env`, og tilret med dit SKOLE-ID, og angiv dit brugernavn og kodeord.
6. Kopier den tilrettede `sample.env` til `.env`
```
cp sample.env .env
```
7. Start programmet
```
npm start
```
8. Besøg web-adressen <http://localhost:9002/?laerer=LÆRER-ID&uger=2&type=laerer&skole=SKOLE-ID> hvis du er lærer, eller <http://localhost:9002/?skole=SKOLE-ID&elev=ELEV-ID> hvis du er elev, og erstatter SKOLE-ID og LÆRER-ID / ELEV-ID med dine egne værdier.
Du får nu genereret en .ics kalender-fil med dit skema.
9. **ALLE SKEMAER FOR ALLE ELEVER OG LÆRERE PÅ DIN SKOLE ER NU TILGÆNGELIGE**, hvis din computer er tilgængelig udefra på port 9002.
Det er du (med tanke på [GDPR](https://en.wikipedia.org/wiki/General_Data_Protection_Regulation)) nok ikke interesseret i. Der er en grund til at Lectio skjuler skemaerne bag et login.
Det er **måske en god ide at begrænse adgang udefra**. Brug f.eks. *ufw* til det.
```
man ufw
```

## Daglig brug

Hvis du er kommet igennem installationsguiden ovenfor kan du nu hente dit skema på enten
<http://localhost:9002/?laerer=LÆRER-ID&uger=2&type=laerer&skole=SKOLE-ID> eller <http://localhost:9002/?skole=SKOLE-ID&elev=ELEV-ID>.

Du kan enten manuelt gemme den genererede .ics fil og efterfølgende uploade til Google Calendar, Outlook eller tilsvarende. Hvis (når) det bliver trættende i længden er der flere andre muligheder. Begge antager at du har en computer tændt 24 timer i døgnet og at den er tilgængelig udefra, enten med en webserver, eller på port 9002.

### Mulighed 1, Webserver

Hvis du har en installeret webserver kan du med et chron-job hente kalenderen ned et par gange i døgnet med et script i stil med dette
```
cd /var/www/html/SECRET-PATH
wget "http://127.0.0.1:9002/?laerer=LÆRER-ID&uger=11&type=laerer&skole=SKOLE-ID" -O kalender.ics
```
Så burde din kalender være tilgængelig på en adresse noget i retning af
```
http://DIN-IP-ADRESSE-ELLER-DOMÆNENAVN-HER/SECRET-PATH/kalender.ics
```
og den adresse kan du så importere i Google Calendar under "Add by url" eller lignende.


### Mulighed 2, direkte adgang til port 9002

Hvis du ikke har nogen skrubler ved potentielt at gøre kalender for **ALLE ELEVER OG LÆRERE PÅ DIN SKOLE OFFENTLIGT TILGÆNGELIGE**, så indsæt din faste ip-adresse eller domænenavn i adressen i stedet for localhost, og tilføj til Google Calendar under "Add by url":

Lærer: <http://DIN-IP-ADRESSE-ELLER-DOMÆNENAVN-HER:9002/?laerer=LÆRER-ID&uger=2&type=laerer&skole=SKOLE-ID>

Elev: <http://DIN-IP-ADRESSE-ELLER-DOMÆNENAVN-HER:9002/?skole=SKOLE-ID&elev=ELEV-ID>



## Tor

Hvis du gerne vil at porgrammet henter skemaet gennem [Tor](https://www.torproject.org/) så er det muligt. (Hvis du ikke er sikker på hvad det betyder har du nok ikke brug for det...)

1. Installer tor.
```
apt install tor
```
eller se [Option two: Tor on Ubuntu or Debian](https://www.torproject.org/docs/debian.html.en#ubuntu)
2. I filen `.env` ret til
```
TOR_ENABLED=true
```


# Licens

Programmet er oprindeligt skrevet af Emil Bach Mikkelsen og udgivet under ISC licensen. Yderligere bidrag af Scott Mathieson.
Emils oprindelige kode kan findes her: [https://github.com/emmikkelsen/node-lectio-til-ics](https://github.com/emmikkelsen/node-lectio-til-ics)
Programmet kan hentes her: [https://github.com/soeren-b-c/node-lectio-til-ics/](https://github.com/soeren-b-c/node-lectio-til-ics/)
  
  
# Historisk

 * Login-mulighed tilføjes til koden marts 2019.
 * Januar 2019 bliver alle skemaer (der tidligere lå frit tilgængeligt) puttet bag login, for at Lectio kan leve op til den nye GDPR lovgivning. Koden virker således ikke længere.
 * Januar 2018 bliver der tilføjet mulighed for at lede trafikken gennem `tor`, således at det er sværere at lukke for adgangen.
 * Koden ligger stadig på GitHub, så det er muligt for enkelt-personer at køre programmet
 * Omkring oktober 2017 lukker Lectio for adgangen til lectio.dk fra programmet, da de oplever for stor trafik.
 * Dette node.js program har kørt i "production" på emilba.ch fra ca. 2015.



