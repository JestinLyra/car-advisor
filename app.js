const checks=[
['Battery','Starts promptly; no clicking, sluggish cranking or noticeably dim headlights.'],
['Driving & charging','Give it a proper drive—not only a few minutes of idling.'],
['Tyre pressures','Check cold; inflate to the driver-door placard.'],
['Tyre condition','Inspect tread, cracks, bulges, objects and uneven wear.'],
['Spare tyre / repair kit','Check pressure and condition, or the repair-kit expiry.'],
['Engine oil','On level ground, engine off and settled; keep between dipstick marks.'],
['Coolant','Check reservoir only when cold. Never open a hot radiator cap.'],
['Brake fluid','Confirm between MIN and MAX; low fluid needs investigation.'],
['Lights & wipers','Test exterior lights, washers and wiper condition.']];
const key='yaris-care-v1';let state=JSON.parse(localStorage.getItem(key)||'null')||{done:[],odo:285915,fuel:'—',services:[]};
const $=s=>document.querySelector(s),save=()=>localStorage.setItem(key,JSON.stringify(state));
function render(){
 $('#checklist').innerHTML=checks.map((c,i)=>`<label class="check ${state.done.includes(i)?'done':''}"><input type="checkbox" data-i="${i}" ${state.done.includes(i)?'checked':''}><div><strong>${c[0]}</strong><p>${c[1]}</p></div></label>`).join('');
 const n=state.done.length,p=Math.round(n/checks.length*100);$('#score').textContent=p+'%';$('#count').textContent=`${n} / ${checks.length}`;$('#ring').style.background=`conic-gradient(var(--gold) ${p}%,rgba(255,255,255,.14) 0)`;$('#odo').textContent=state.odo.toLocaleString();$('#fuel').textContent=state.fuel;
 $('#services').innerHTML=state.services.length?state.services.map(x=>`<div class="record"><div><strong>${x.job}</strong><p>${x.date} · ${Number(x.km).toLocaleString()} km</p></div></div>`).join(''):'<div class="record"><div><strong>No records yet</strong><p>Add your latest service to begin your history.</p></div></div>';
 document.querySelectorAll('.check input').forEach(x=>x.onchange=()=>{let i=+x.dataset.i;state.done=x.checked?[...new Set([...state.done,i])]:state.done.filter(v=>v!==i);save();render()});
}
function modal(title,body,onSave){$('#modalTitle').textContent=title;$('#modalBody').innerHTML=body;$('#modal').showModal();$('#modalSave').onclick=e=>{e.preventDefault();if(onSave()){$('#modal').close();save();render()}}}
document.querySelector('[data-action="odometer"]').onclick=()=>modal('Update odometer','<input id="mOdo" type="number" inputmode="numeric" value="'+state.odo+'" placeholder="Kilometres">',()=>{state.odo=+$('#mOdo').value;return !!state.odo});
document.querySelector('[data-action="fuel"]').onclick=()=>modal('Fuel level','<input id="mFuel" value="'+state.fuel+'" placeholder="e.g. Half tank">',()=>{state.fuel=$('#mFuel').value||'—';return true});
document.querySelector('[data-action="note"]').onclick=()=>modal('Add reminder','<textarea id="mNote" placeholder="What should you remember?"></textarea>',()=>{let v=$('#mNote').value.trim();if(v)state.services.unshift({job:'Reminder: '+v,date:new Date().toLocaleDateString('en-AU'),km:state.odo});return !!v});
$('#addService').onclick=()=>modal('Add service record','<input id="mJob" placeholder="Service or repair"><input id="mDate" type="date"><input id="mKm" type="number" inputmode="numeric" value="'+state.odo+'">',()=>{if(!$('#mJob').value)return false;state.services.unshift({job:$('#mJob').value,date:$('#mDate').value||new Date().toLocaleDateString('en-AU'),km:$('#mKm').value});return true});
$('#resetMonth').onclick=()=>{if(confirm('Clear this month’s ticks?')){state.done=[];save();render()}};
$('#tripCheck').onclick=()=>alert('Before leaving: check tyre pressure and condition, oil, cold coolant level, lights, fuel, spare/repair kit and roadside assistance details.');
$('#navChecks').onclick=()=>$('#checklist').scrollIntoView({behavior:'smooth'});$('#navRecords').onclick=()=>$('#services').scrollIntoView({behavior:'smooth'});render();
