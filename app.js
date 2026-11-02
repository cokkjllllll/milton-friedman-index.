const countries = [
  {name:"Italy",cities:["Rome","Roma","Milan","Milano","Turin","Naples","Florence","Venice"]},
  {name:"Germany",cities:["Berlin","Berlino","Munich","Hamburg","Frankfurt","Cologne"]},
  {name:"France",cities:["Paris","Parigi","Lyon","Marseille","Nice"]},
  {name:"Spain",cities:["Madrid","Barcelona","Valencia","Seville","Malaga"]},
  {name:"Netherlands",cities:["Amsterdam","Rotterdam","The Hague","Utrecht"]},
  {name:"Sweden",cities:["Stockholm","Gothenburg","Malmo"]},
  {name:"Denmark",cities:["Copenhagen","Aarhus","Odense"]},
  {name:"Poland",cities:["Warsaw","Krakow","Gdansk","Wroclaw"]},
  {name:"Czech Republic",cities:["Prague","Brno","Ostrava"]},
  {name:"Ireland",cities:["Dublin","Cork","Galway"]}
];

const indicators = [
{
 name:"Business taxation",
 description:"Combined statutory corporate income tax rate",
 unit:"%",
 year:2026,
 source:"OECD / Tax Foundation",
 values:{
  Italy:27.8,Germany:30.1,France:25.8,Spain:25,
  Netherlands:25.8,Sweden:20.6,Denmark:22,
  Poland:19,"Czech Republic":21,Ireland:12.5
 }
},
{
 name:"Public expenditure / GDP",
 description:"General government total expenditure",
 unit:"% GDP",
 year:2024,
 source:"Eurostat · gov_10a_main",
 values:{
  Italy:50.4,Germany:49.4,France:57,Spain:45.5,
  Netherlands:44.4,Sweden:50.5,Denmark:47.4,
  Poland:49.2,"Czech Republic":43.2,Ireland:22.3
 }
},
{
 name:"Public employment",
 description:"General government employment as percentage of total employment",
 unit:"%",
 year:2021,
 source:"OECD · Government at a Glance 2023",
 values:{
  Italy:13.53,Germany:11.13,France:21.13,Spain:16.55,
  Netherlands:12.05,Sweden:29.27,Denmark:28.04,
  Poland:17.30,"Czech Republic":17.25,Ireland:20.49
 }
},
{
 name:"Public personnel costs / GDP",
 description:"General government compensation of employees",
 unit:"% GDP",
 year:null,
 source:"Eurostat · gov_10a_main · D1",
 values:{}
},
{
 name:"Product Market Regulation",
 description:"OECD economy-wide PMR indicator",
 unit:"Index",
 year:null,
 source:"OECD-WBG PMR database · 1998–2024",
 values:{}
}
];

let selected="Italy";
let comparison="Germany";

const $=id=>document.getElementById(id);

function setup(){
 countries.forEach(c=>{
  $("country").add(new Option(c.name,c.name));
  $("against").add(new Option(c.name,c.name));
  c.cities.forEach(city=>{
   const o=document.createElement("option");
   o.value=city;
   $("places").appendChild(o);
  });
 });

 $("country").value=selected;
 $("against").value=comparison;

 $("country").onchange=()=>{
  selected=$("country").value;
  render();
 };

 $("against").onchange=()=>{
  comparison=$("against").value;
  render();
 };

 $("search").onchange=()=>{
  const q=$("search").value.trim().toLowerCase();
  const match=countries.find(c=>
   c.name.toLowerCase()===q ||
   c.cities.some(city=>city.toLowerCase()===q)
  );
  if(match){
   selected=match.name;
   $("country").value=selected;
   render();
  }
 };

 render();
}

function value(indicator,country){
 const v=indicator.values[country];
 return v===undefined ? "—" : v.toFixed(2)+" "+indicator.unit;
}

function coverage(country){
 return indicators.filter(i=>i.values[country]!==undefined).length;
}

// Funzione per impostare i colori del semaforo basati sulla tassazione o presenza dati
function getIndicatorStatus(indicator, country) {
    const v = indicator.values[country];
    if (v === undefined) return { classe: 'bg-red-500', label: 'DATI MANCANTI' };
    if (indicator.name === "Business taxation" && v > 26) return { classe: 'bg-yellow-500', label: 'ALTA PRESSIONE' };
    return { classe: 'bg-green-500', label: 'DISPONIBILE' };
}

function renderIndicators(){
 $("indicators").innerHTML=indicators.map((i,index)=>{
  const v=i.values[selected];
  const status = getIndicatorStatus(i, selected);
  return `
   <div class="indicator-card">
    <div class="flex gap-4">
        <div class="font-black text-slate-600 text-lg">0${index+1}</div>
        <div>
         <div class="font-bold text-sm text-slate-200">${i.name}</div>
         <div class="text-xs text-slate-400 mt-0.5">${i.description}</div>
         <div class="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-wider">${i.source}${i.year?" · "+i.year:""}</div>
        </div>
    </div>
    <div class="text-right shrink-0">
     <div class="font-black text-md text-emerald-400 flex items-center justify-end gap-2">
        <span class="w-2 h-2 rounded-full ${status.classe}"></span>
        ${value(i,selected)}
     </div>
     <div class="text-[10px] font-bold text-slate-500 mt-1 tracking-wider uppercase">${v===undefined?"DATA NOT YET VERIFIED":"OBSERVATION AVAILABLE"}</div>
    </div>
   </div>
  `;
 }).join("");
}

function countryBox(country){
 const cov = coverage(country);
 return `
  <div class="country-card">
   <h4 class="font-black text-lg text-slate-100 border-b border-slate-800 pb-2 flex justify-between items-center">
    <span>${country}</span>
    <span class="text-xs font-normal text-slate-400">${cov} / 5 Indicatori</span>
   </h4>
   <div class="space-y-2 pt-1 text-xs">
   ${indicators.map(i=>`
    <div class="flex justify-between items-center">
     <span class="text-slate-400">${i.name}</span>
     <span class="font-bold text-slate-200">${value(i,country)}</span>
    </div>
   `).join("")}
   </div>
  </div>
 `;
}

function renderRanking(){
 const covSelected = coverage(selected);
 $("ranking").innerHTML=`
  <div class="p-3.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-xl text-xs leading-relaxed mb-4">
   ⚠️ <strong>Classifica generale non calcolata.</strong> Tre indicatori richiedono ancora osservazioni verificate e comparabili.
  </div>
  <div class="space-y-2">
  ${countries.map((c,index)=>{
   const cov = coverage(c.name);
   const percent = (cov / 5) * 100;
   return `
   <div class="p-3 bg-slate-900/40 border ${c.name === selected ? 'border-emerald-500' : 'border-slate-800'} rounded-xl flex items-center justify-between text-sm">
    <div class="flex items-center gap-3">
        <span class="font-bold text-slate-500">${String(index+1).padStart(2,"0")}</span>
        <span class="font-bold ${c.name === selected ? 'text-emerald-400' : 'text-slate-300'}">${c.name}</span>
    </div>
    <div class="text-right">
        <span class="text-xs font-bold text-slate-400">${cov}/5</span>
        <div class="w-16 bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
            <div class="bg-emerald-500 h-1.5" style="width: ${percent}%"></div>
        </div>
    </div>
   </div>
  `}).join("")}
  </div>
 `;
}

function render(){
 $("countryName").textContent=selected;
 $("coverage").textContent=coverage(selected)+" / 5";
 $("comparison").innerHTML=countryBox(selected)+countryBox(comparison);
 renderIndicators();
 renderRanking();
}

setup();
