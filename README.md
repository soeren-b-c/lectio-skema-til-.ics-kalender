#Lectio til .ics (Node.js)

## Installationsguide for begyndere, på Linux-lignende platform

1. Installer Node.js  
Hent nyeste udgave fra <https://nodejs.org/en/download/>
2. Installer tor.
2. Installer html-entities og cheerio  
```npm install html-entities cheerio```
3. Hent filerne, pak ud, naviger til den udpakkede mappe
```wget https://github.com/soeren-b-c/node-lectio-til-ics/archive/master.zip```  
```unzip master.zip```  
```cd node-lectio-til-ics-master```  
4. Skift CONTROL_PASSWORD i node-lectio.js filen. Følg vejledningn i den fil til at konfigurere tor med det nye control password.
3. Start programmet
```nodejs node-lectio.js```
4. Find dit SKOLE-ID og LÆRER-ID / ELEV-ID  i adressefeltet i dit personlige Lectio-skema.  
Eksempel lærer: https://www.lectio.dk/lectio/SKOLE-ID/SkemaNy.aspx?type=laerer&laererid=LÆRER-ID  
Eksempel elev: https://www.lectio.dk/lectio/SKOLE-ID/SkemaNy.aspx?type=elev&elevid=ELEV-ID
5. Besøg web-adressen <http://localhost:9002/?laerer=LÆRER-ID&uger=2&type=laerer&skole=SKOLE-ID> hvis du er lærer, eller <http://localhost:9002/?skole=SKOLE-ID&elev=ELEV-ID> hvis du er elev, og erstatter SKOLE-ID og LÆRER-ID / ELEV-ID med dine egne værdier.  
Du får nu genereret en .ics kalender-fil fra dit skema.
6. Hvis du vil tilføje din kalender til Google (eller tilsvarende kalender-servide)  
    * Skal din computer være tændt 24 timer i døgnet
    * Der skal være adgang til port 9002 udefra
    * Du skal have en fast ip-adresse, eller domæne-navn.
7. Den faste ip-adresse eller domænenavn indsættes i adressen i stedet for localhost, og denne url tilføjes til Google under "Add by url"  
Lærer: <http://DIN-IP-ADRESSE-ELLER-DOMÆNENAVN-HER:9002/?laerer=LÆRER-ID&uger=2&type=laerer&skole=SKOLE-ID>  
Elev: <http://DIN-IP-ADRESSE-ELLER-DOMÆNENAVN-HER:9002/?skole=SKOLE-ID&elev=ELEV-ID>

## Licens

Programmet er skrevet af Emil Bach Mikkelsen <http://emilba.ch/> og udgivet under ISC licensen. Programmet kan hentes her: <https://github.com/emmikkelsen/node-lectio-til-ics>
  
  
## Historisk

Dette node.js program har kørt i "production" på emilba.ch. Det gør det dog ikke længere / i skrivende stund. Instruktioner til at benytte scriptet på emilba.ch serveren kan stadig læses her: <http://da.emilba.ch/lectio>.
