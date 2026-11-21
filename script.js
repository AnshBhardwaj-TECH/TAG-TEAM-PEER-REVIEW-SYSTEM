const $=s=>document.querySelector(s),esc=t=>String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])),uid=()=>Math.random().toString(36).slice(2,9);
const REQ_SUB=1,REQ_REV=2,NEED=2,CRIT=['Clarity','Accuracy','Depth'];
let S=null;
function seed(){return{me:null,users:[
{id:'u1',name:'Course Admin',email:'admin@tag.edu',pw:'admin123',role:'admin',bio:''},
{id:'u2',name:'Ansh Bhardwaj',email:'ansh@tag.edu',pw:'learn123',role:'learner',bio:'First-year B.Tech student.'},
{id:'u3',name:'Riya Sharma',email:'riya@tag.edu',pw:'learn123',role:'learner',bio:'Loves clean code.'},
{id:'u4',name:'Dev Malhotra',email:'dev@tag.edu',pw:'learn123',role:'learner',bio:''}],
courses:[
{id:'c1',title:'Intro to Programming',cat:'Coding',desc:'Write and explain small programs in C and Python.',en:['u2','u3','u4']},
{id:'c2',title:'Design Thinking Basics',cat:'Design',desc:'Empathise, define and prototype solutions to real problems.',en:['u3','u4']},
{id:'c3',title:'Technical Writing',cat:'Writing',desc:'Explain complex ideas clearly in short reports.',en:['u2']}],
subs:[
{id:'s1',cid:'c1',uid:'u3',title:'Factorial: loop vs recursion',text:'I compared a for-loop and a recursive factorial in C. The loop uses constant memory, while recursion adds a stack frame for every call, so large inputs can overflow the stack.',revs:[],t:Date.now()-9e6},
{id:'s2',cid:'c1',uid:'u4',title:'Palindrome checker in Python',text:'My checker lowercases the string, removes spaces and compares it with its reverse using slicing. It passes the three test cases I wrote, including an empty string.',revs:[],t:Date.now()-5e6}],
notes:[{id:'n1',to:'u2',txt:'Welcome to TagReview! Submit one piece of work and review two peers to finish a course.',t:Date.now(),read:false}]}}
function load(){try{const r=localStorage.getItem('tagreview-v1');S=r?JSON.parse(r):seed()}catch(e){S=seed()}}
function save(){try{localStorage.setItem('tagreview-v1',JSON.stringify(S))}catch(e){}}
let V={view:'dash',mode:'login',q:'',cat:'All',st:'All',course:'',err:''};
const me=()=>S.users.find(u=>u.id===S.me),uname=i=>(S.users.find(u=>u.id===i)||{name:'Unknown'}).name,cname=i=>(S.courses.find(c=>c.id===i)||{title:'Removed course'}).title;
const avg=s=>s.revs.length?(s.revs.reduce((a,r)=>a+(r.sc[0]+r.sc[1]+r.sc[2])/3,0)/s.revs.length).toFixed(1):null;
const notify=(to,txt)=>S.notes.unshift({id:uid(),to,txt,t:Date.now(),read:false});
const toast=m=>{const t=$('#toast');t.textContent=m;t.style.display='block';clearTimeout(toast.h);toast.h=setTimeout(()=>t.style.display='none',2600)};
const progress=(u,c)=>{const sub=S.subs.filter(s=>s.cid===c.id&&s.uid===u).length,rev=S.subs.filter(s=>s.cid===c.id).reduce((a,s)=>a+s.revs.filter(r=>r.by===u).length,0);return{sub,rev,pct:Math.round((Math.min(sub,REQ_SUB)+Math.min(rev,REQ_REV))/(REQ_SUB+REQ_REV)*100)}};
const status=s=>s.revs.length>=NEED?['Reviewed','ok']:s.revs.length?['In review','w']:['Waiting for reviewers','w'];

function authView(){const reg=V.mode==='register';return`<div class="wrap"><div class="hero"><div><h1>Learn by reviewing each other.</h1><p class="mute">TagReview is where learners post work, tag a peer in to review it, and track progress together. Built by The Tag Team.</p></div><div class="tag" aria-hidden="true"><div class="a">Submit</div><div class="b">Review</div></div></div>
<form class="card" id="auth" style="max-width:440px" novalidate><h2>${reg?'Create your account':'Log in'}</h2>
${reg?'<label for="nm">Full name</label><input id="nm" autocomplete="name">':''}
<label for="em">Email</label><input id="em" type="email" autocomplete="email"><label for="pw">Password (6+ characters)</label><input id="pw" type="password" autocomplete="${reg?'new-password':'current-password'}">
${reg?'<label for="rl">I am a</label><select id="rl"><option value="learner">Learner</option><option value="admin">Admin</option></select>':''}
<div class="err" id="err">${esc(V.err)}</div><div class="row"><button class="btn" data-act="auth">${reg?'Sign up':'Log in'}</button><button type="button" class="btn ghost" data-act="mode">${reg?'I have an account':'Create account'}</button></div>
${reg?'':'<div class="demo sm"><b>Demo accounts</b><br>Learner: ansh@tag.edu / learn123<br>Admin: admin@tag.edu / admin123</div>'}</form></div>`}

function shell(body){const u=me(),n=S.notes.filter(x=>x.to===u.id&&!x.read).length;
const tabs=[['dash','Dashboard'],['courses','Courses'],['subs','Submissions'],['queue','Review queue'],['notes','Notifications'+(n?`<span class="badge">${n}</span>`:'')],['me','Profile']];if(u.role==='admin')tabs.push(['admin','Admin']);
return`<nav aria-label="Main"><b>Tag<span>Review</span></b>${tabs.map(t=>`<button data-act="go" data-v="${t[0]}" class="${V.view===t[0]?'on':''}" ${V.view===t[0]?'aria-current="page"':''}>${t[1]}</button>`).join('')}</nav><main class="wrap">${body}</main>`}

function dash(){const u=me(),mine=S.courses.filter(c=>c.en.includes(u.id)),my=S.subs.filter(s=>s.uid===u.id),given=S.subs.reduce((a,s)=>a+s.revs.filter(r=>r.by===u.id).length,0),recv=my.reduce((a,s)=>a+s.revs.length,0);
return`<h2>Hi, ${esc(u.name.split(' ')[0])}</h2><div class="grid"><div class="card"><div class="stat">${mine.length}</div>courses enrolled</div><div class="card"><div class="stat">${my.length}</div>submissions</div><div class="card"><div class="stat">${given}</div>reviews given</div><div class="card"><div class="stat">${recv}</div>reviews received</div></div>
<h3 style="margin-top:1.4rem">Your progress</h3>${mine.length?mine.map(c=>{const p=progress(u.id,c);return`<div class="card" style="margin-bottom:.7rem"><div class="row"><b class="grow">${esc(c.title)}</b><span class="chip ${p.pct===100?'ok':''}">${p.pct}%</span></div><div class="bar" role="progressbar" aria-valuenow="${p.pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${p.pct}%"></i></div><p class="sm mute">${Math.min(p.sub,REQ_SUB)}/${REQ_SUB} submission · ${Math.min(p.rev,REQ_REV)}/${REQ_REV} peer reviews</p></div>`}).join(''):'<div class="empty">You haven’t enrolled in a course yet. Open Courses and enroll to start.</div>'}`}

function courses(){const cats=['All',...new Set(S.courses.map(c=>c.cat))],u=me();
const list=S.courses.filter(c=>(V.cat==='All'||c.cat===V.cat)&&(c.title+c.desc).toLowerCase().includes(V.q.toLowerCase()));
return`<h2>Courses</h2><div class="row"><input class="grow" id="q" placeholder="Search courses" aria-label="Search courses" value="${esc(V.q)}"><select id="cat" aria-label="Category" style="width:auto">${cats.map(c=>`<option ${c===V.cat?'selected':''}>${esc(c)}</option>`).join('')}</select></div>
${list.length?`<div class="grid">${list.map(c=>{const e=c.en.includes(u.id);return`<div class="card"><span class="chip">${esc(c.cat)}</span><h3 style="margin-top:.5rem">${esc(c.title)}</h3><p class="mute sm">${esc(c.desc)}</p><p class="sm">${c.en.length} learner${c.en.length===1?'':'s'} enrolled</p><button class="btn sm ${e?'ghost':''}" data-act="enroll" data-id="${c.id}">${e?'Leave course':'Enroll'}</button></div>`}).join('')}</div>`:'<div class="empty">No courses match. Clear the search or pick another category.</div>'}`}

function subs(){const u=me(),mine=S.courses.filter(c=>c.en.includes(u.id));
const list=S.subs.filter(s=>(V.q===''||(s.title+s.text).toLowerCase().includes(V.q.toLowerCase()))&&(V.st==='All'||status(s)[0]===V.st)).sort((a,b)=>b.t-a.t);
return`<h2>Submissions</h2>${mine.length?`<form class="card" id="newsub" novalidate><h3>New submission</h3><label for="sc">Course</label><select id="sc">${mine.map(c=>`<option value="${c.id}">${esc(c.title)}</option>`).join('')}</select><label for="stt">Title</label><input id="stt" maxlength="80"><label for="stx">Your work (30+ characters)</label><textarea id="stx"></textarea><div class="err" id="err">${esc(V.err)}</div><button class="btn" data-act="addsub">Post for review</button></form>`:'<div class="empty">Enroll in a course to post your work.</div>'}
<div class="row" style="margin-top:1rem"><input class="grow" id="q" placeholder="Search submissions" aria-label="Search submissions" value="${esc(V.q)}"><select id="st" aria-label="Status" style="width:auto">${['All','Waiting for reviewers','In review','Reviewed'].map(c=>`<option ${c===V.st?'selected':''}>${c}</option>`).join('')}</select></div>
${list.length?list.map(s=>subCard(s,u)).join(''):'<div class="empty">No submissions match your filters.</div>'}`}

function subCard(s,u){const st=status(s),a=avg(s);return`<article class="card" style="margin-top:.8rem"><div class="row"><h3 class="grow" style="margin:0">${esc(s.title)}</h3><span class="chip ${st[1]}">${st[0]}</span></div><p class="sm mute">${esc(uname(s.uid))} · ${esc(cname(s.cid))}${a?` · average ${a}/5`:''}</p><p>${esc(s.text)}</p>${s.revs.map(r=>`<div class="rev sm"><b>${esc(uname(r.by))}</b>: ${CRIT.map((c,i)=>c+' '+r.sc[i]).join(' · ')}<br>${esc(r.c)}</div>`).join('')}${(s.uid===u.id||u.role==='admin')?`<button class="btn bad sm" data-act="delsub" data-id="${s.id}">Delete</button>`:''}</article>`}

function queue(){const u=me(),list=S.subs.filter(s=>s.uid!==u.id&&S.courses.find(c=>c.id===s.cid&&c.en.includes(u.id))&&!s.revs.some(r=>r.by===u.id));
return`<h2>Review queue</h2><p class="mute">Work from peers in your courses that you haven’t reviewed yet.</p>${list.length?list.map(s=>`<article class="card" style="margin-top:.8rem"><h3>${esc(s.title)}</h3><p class="sm mute">${esc(uname(s.uid))} · ${esc(cname(s.cid))}</p><p>${esc(s.text)}</p><form data-sid="${s.id}" novalidate>${CRIT.map((c,i)=>`<div class="score"><label for="r${s.id}${i}">${c}</label><input type="range" min="1" max="5" value="3" id="r${s.id}${i}" data-out><output>3</output></div>`).join('')}<label for="c${s.id}">Feedback (10+ characters)</label><textarea id="c${s.id}"></textarea><div class="err" id="e${s.id}"></div><button class="btn" data-act="review" data-id="${s.id}">Send review</button></form></article>`).join(''):'<div class="empty">You’re all caught up. New work from peers will appear here.</div>'}`}

function notes(){const u=me(),l=S.notes.filter(n=>n.to===u.id);return`<h2>Notifications</h2>${l.length?`<button class="btn ghost sm" data-act="readall">Mark all as read</button>`+l.map(n=>`<div class="card" style="margin-top:.6rem;${n.read?'opacity:.65':''}">${esc(n.txt)}<div class="sm mute">${new Date(n.t).toLocaleString()}</div></div>`).join(''):'<div class="empty">Nothing yet. You’ll be told when someone reviews your work.</div>'}`}

function prof(){const u=me();return`<h2>Profile</h2><form class="card" style="max-width:460px" novalidate><label for="pn">Name</label><input id="pn" value="${esc(u.name)}"><label for="pb">Bio</label><textarea id="pb">${esc(u.bio)}</textarea><p class="sm mute">${esc(u.email)} · ${u.role}</p><div class="err" id="err"></div><div class="row"><button class="btn" data-act="saveprof">Save profile</button><button type="button" class="btn ghost" data-act="logout">Log out</button></div></form>`}

function admin(){return`<h2>Admin</h2><div class="grid"><div class="card"><div class="stat">${S.users.length}</div>users</div><div class="card"><div class="stat">${S.subs.length}</div>submissions</div><div class="card"><div class="stat">${S.subs.reduce((a,s)=>a+s.revs.length,0)}</div>reviews</div></div>
<form class="card" style="margin:1rem 0" novalidate><h3>Add a course</h3><label for="at">Title</label><input id="at"><label for="ac">Category</label><input id="ac"><label for="ad">Description</label><input id="ad"><div class="err" id="err">${esc(V.err)}</div><button class="btn" data-act="addcourse">Add course</button></form>
${S.courses.map(c=>`<div class="card row" style="margin-bottom:.5rem"><b class="grow">${esc(c.title)}</b><span class="chip">${esc(c.cat)}</span><button class="btn bad sm" data-act="delcourse" data-id="${c.id}">Delete</button></div>`).join('')}`}

function render(){const a=$('#app');if(!S.me){a.innerHTML=authView();return}const v={dash,courses,subs,queue,notes,me:prof,admin}[V.view]||dash;a.innerHTML=shell(v());
const q=$('#q');if(q&&V.focus){q.focus();q.setSelectionRange(q.value.length,q.value.length);V.focus=false}}
const go=(v)=>{V.view=v;V.q='';V.cat='All';V.st='All';V.err='';render();scrollTo(0,0)};
const val=id=>($('#'+id)||{value:''}).value.trim();

document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b)return;const a=b.dataset.act,id=b.dataset.id,u=S.me&&me();
if(a==='go')return go(b.dataset.v);
if(a==='mode'){V.mode=V.mode==='login'?'register':'login';V.err='';return render()}
if(a==='auth'){e.preventDefault();const em=val('em').toLowerCase(),pw=$('#pw').value;let m='';
 if(V.mode==='register'){const nm=val('nm');if(!nm)m='Enter your full name.';else if(!/^\S+@\S+\.\S+$/.test(em))m='Enter a valid email address.';else if(pw.length<6)m='Password needs at least 6 characters.';else if(S.users.some(x=>x.email===em))m='That email is already registered. Log in instead.';
  if(!m){const n={id:uid(),name:nm,email:em,pw,role:$('#rl').value,bio:''};S.users.push(n);S.me=n.id;V.view='dash';save();return render()}}
 else{const f=S.users.find(x=>x.email===em&&x.pw===pw);if(f){S.me=f.id;V.view='dash';save();return render()}m='Email or password is incorrect.'}
 V.err=m;$('#err').textContent=m;return}
if(a==='logout'){e.preventDefault();S.me=null;V.mode='login';save();return render()}
if(a==='enroll'){const c=S.courses.find(x=>x.id===id);if(c.en.includes(u.id)){c.en=c.en.filter(x=>x!==u.id);toast('Left '+c.title)}else{c.en.push(u.id);toast('Enrolled in '+c.title)}save();return render()}
if(a==='addsub'){e.preventDefault();const t=val('stt'),x=val('stx');let m=!t?'Add a title.':x.length<30?'Write at least 30 characters so reviewers have something to assess.':'';
 if(m){$('#err').textContent=m;return}const c=val('sc')||$('#sc').value;S.subs.push({id:uid(),cid:$('#sc').value,uid:u.id,title:t,text:x,revs:[],t:Date.now()});
 S.users.filter(p=>p.id!==u.id&&p.role==='learner'&&S.courses.find(k=>k.id===$('#sc').value).en.includes(p.id)).forEach(p=>notify(p.id,`${u.name} posted “${t}” for review.`));save();toast('Posted for review');return render()}
if(a==='delsub'){S.subs=S.subs.filter(s=>s.id!==id);save();toast('Submission deleted');return render()}
if(a==='review'){e.preventDefault();const s=S.subs.find(x=>x.id===id),c=val('c'+id);if(c.length<10){$('#e'+id).textContent='Add at least 10 characters of feedback.';return}
 s.revs.push({by:u.id,sc:[0,1,2].map(i=>+$('#r'+id+i).value),c});notify(s.uid,`${u.name} reviewed “${s.title}”.`);if(s.revs.length>=NEED)notify(s.uid,`“${s.title}” now has ${NEED} reviews.`);save();toast('Review sent');return render()}
if(a==='readall'){S.notes.forEach(n=>{if(n.to===u.id)n.read=true});save();return render()}
if(a==='saveprof'){e.preventDefault();const n=val('pn');if(!n){$('#err').textContent='Name can’t be empty.';return}u.name=n;u.bio=val('pb');save();toast('Profile saved');return render()}
if(a==='addcourse'){e.preventDefault();const t=val('at'),c=val('ac'),d=val('ad');if(!t||!c){V.err='Title and category are required.';$('#err').textContent=V.err;return}S.courses.push({id:uid(),title:t,cat:c,desc:d||'No description yet.',en:[]});V.err='';save();toast('Course added');return render()}
if(a==='delcourse'){S.courses=S.courses.filter(c=>c.id!==id);S.subs=S.subs.filter(s=>s.cid!==id);save();toast('Course deleted');return render()}});
document.addEventListener('input',e=>{const t=e.target;if(t.dataset.out!==undefined)t.nextElementSibling.textContent=t.value;
 if(t.id==='q'){V.q=t.value;V.focus=true;render()}});
document.addEventListener('change',e=>{if(e.target.id==='cat'){V.cat=e.target.value;render()}if(e.target.id==='st'){V.st=e.target.value;render()}});
document.addEventListener('submit',e=>e.preventDefault());
load();render();
