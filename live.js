// โหมดเชื่อมต่อ Supabase จริง — ทำงานเมื่อใส่ SUPABASE.url และ anon ใน index.html เท่านั้น
(async()=>{
if(!SUPABASE.url||!SUPABASE.anon)return;
let sb;try{const m=await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm");sb=m.createClient(SUPABASE.url,SUPABASE.anon)}catch(e){$("banner").textContent="เชื่อมต่อ Supabase ไม่สำเร็จ — ใช้โหมดทดลอง";return}
$("banner").textContent="เชื่อมต่อ Supabase แล้ว";
let user=null,isAdm=false,SS={},DS={},store={};
const err=e=>alert(e&&e.message?e.message:e),esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])),ext=f=>f.type.split("/")[1];
document.body.insertAdjacentHTML("beforeend",'<div class="m" id="mlg"><div><h3>เข้าสู่ระบบ / สมัครสมาชิก</h3><input id="l_n" placeholder="ชื่อ-นามสกุล (เฉพาะสมัครใหม่)"><input id="l_e" type="email" placeholder="อีเมล"><input id="l_p" type="password" placeholder="รหัสผ่าน (6 ตัวขึ้นไป)"><button class="g" onclick="doLogin()">เข้าสู่ระบบ</button> <button onclick="doSignup()">สมัครสมาชิก</button> <button onclick="closeM()">ปิด</button></div></div>');
document.querySelector("header").insertAdjacentHTML("beforeend",'<button id="lb" onclick="authBtn()">เข้าสู่ระบบ</button>');
$("ab").insertAdjacentHTML("afterbegin",'<h4>บัญชีธนาคาร/QR</h4><input id="b_bank_name" placeholder="ชื่อธนาคาร"><input id="b_bank_account" placeholder="เลขบัญชี"><input id="b_bank_holder" placeholder="ชื่อบัญชี"><label>QR Code <input type="file" id="q_i" accept="image/jpeg,image/png,image/webp"></label>');
window.openLogin=()=>{closeM();$("mlg").classList.add("on")};
window.authBtn=async()=>{if(user){await sb.auth.signOut();await who();alert("ออกจากระบบแล้ว")}else openLogin()};
window.doLogin=async()=>{const{error}=await sb.auth.signInWithPassword({email:$("l_e").value.trim(),password:$("l_p").value});if(error)return err(error);await who();closeM()};
window.doSignup=async()=>{const{data,error}=await sb.auth.signUp({email:$("l_e").value.trim(),password:$("l_p").value,options:{data:{full_name:$("l_n").value.trim()}}});if(error)return err(error);if(!data.session)return alert("สมัครแล้ว กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ");await who();closeM()};
async function who(){const{data:{session}}=await sb.auth.getSession();user=session?session.user:null;isAdm=false;if(user){const{data}=await sb.from("profiles").select("role").eq("id",user.id).maybeSingle();isAdm=!!data&&data.role==="admin"}$("lb").textContent=user?"ออกจากระบบ":"เข้าสู่ระบบ"}
async function load(){
 const[c,p,im,d,s,st]=await Promise.all([sb.from("categories").select("*"),sb.from("products").select("*").eq("active",true).order("created_at",{ascending:false}),sb.from("product_images").select("*").order("sort"),sb.from("deposit_settings").select("*").maybeSingle(),sb.from("shipping_settings").select("*").maybeSingle(),sb.from("store_settings").select("*").maybeSingle()]);
 if(p.error)return err(p.error);
 const cn=Object.fromEntries((c.data||[]).map(x=>[x.id,x.name])),cover={};(im.data||[]).forEach(i=>{if(!cover[i.product_id]||i.is_cover)cover[i.product_id]=i.url});
 P=(p.data||[]).map(x=>({id:x.id,n:x.name,c:CATS.indexOf(cn[x.category_id]),p:+x.price,s:x.stock,rec:x.is_recommended,best:x.is_bestseller,img:cover[x.id]||"",dp:x.deposit_percent,df:x.deposit_fixed}));
 DS=d.data||{};SS=s.data||{};store=st.data||{};ST={dep:+DS.percent||0,ship:+SS.flat_fee||0,cod:!!SS.cod_enabled};
 Object.keys(cart).forEach(i=>{if(!P.find(x=>x.id==i))delete cart[i]});S("hb_c",cart);draw()}
window.tot=()=>{let sub=0,dep=0,sg=0;for(const[i,q]of Object.entries(cart)){const p=P.find(x=>x.id==i),l=p.p*q;sub+=l;if(p.df!=null)dep+=p.df*q;else if(p.dp!=null)dep+=l*p.dp/100;else sg+=l}
 const sh=sub?ST.ship:0,tt=sub+sh;dep+=DS.mode==="fixed"?(sg?+DS.fixed:0):sg*(+DS.percent||0)/100;
 const pm=$("f_pay")&&$("f_pay").value;dep=!DS.enabled?(pm==="cod"?0:tt):Math.max(dep,+DS.minimum||0);dep=sub?Math.min(Math.ceil(dep),tt):0;return{sub,sh,tt,dep}};
const info=()=>{const t=tot(),c=$("f_pay").value==="cod";$("pi").innerHTML=`ยอดรวม ${B(t.tt)} · มัดจำ ${B(t.dep)} · คงเหลือ ${B(t.tt-t.dep)}<br>`+(c?`ชำระปลายทาง ${B(t.tt-t.dep)}`:`โอนที่ ${esc(store.bank_name||"-")} เลขที่ ${esc(store.bank_account||"-")} ชื่อ ${esc(store.bank_holder||"-")}`+(store.qr_url?`<br><img src="${esc(store.qr_url)}" width="160">`:""))};
window.dk=()=>{if(!Object.keys(cart).length){closeM();return alert("ตะกร้าว่าง")}if(!user){closeM();return openLogin()}$("f_pay").innerHTML='<option value="transfer">โอนเงิน</option>'+(ST.cod?'<option value="cod">เก็บเงินปลายทาง (COD)</option>':"");$("f_pay").onchange=info;info()};
window.order=async()=>{const g=i=>$(i).value.trim();if(!["f_n","f_p","f_a","f_t","f_d","f_pv","f_z"].every(i=>g(i)))return alert("กรอกข้อมูลที่มี * ให้ครบ");
 if(!/^0\d{8,9}$/.test(g("f_p")))return alert("เบอร์โทรไม่ถูกต้อง");if(!/^\d{5}$/.test(g("f_z")))return alert("รหัสไปรษณีย์ 5 หลัก");
 const f=$("f_s").files[0],e=chk(f),pay=g("f_pay");if(e)return alert(e);if(pay==="transfer"&&!f)return alert("กรุณาแนบสลิปการโอน");
 const ship={name:g("f_n"),phone:g("f_p"),line:g("f_l"),house:g("f_a"),village:g("f_v"),subdistrict:g("f_t"),district:g("f_d"),province:g("f_pv"),postcode:g("f_z")};
 const{data,error}=await sb.rpc("create_order",{p_items:Object.entries(cart).map(([id,q])=>({id,q})),p_ship:ship,p_pay:pay,p_note:g("f_r")});if(error)return err(error);
 if(f){const path=`${user.id}/${data.id}.${ext(f)}`,u=await sb.storage.from("slips").upload(path,f,{contentType:f.type,upsert:true});if(u.error)return err("สั่งซื้อแล้ว แต่อัปโหลดสลิปไม่สำเร็จ: "+u.error.message);const a=await sb.rpc("attach_slip",{p_order:data.id,p_path:path});if(a.error)return err(a.error)}
 cart={};S("hb_c",cart);await load();openM("mo");alert("สั่งซื้อสำเร็จ เลขที่ "+data.order_no)};
window.dO=async()=>{if(!user){$("ol").innerHTML='<button class="g" onclick="openLogin()">เข้าสู่ระบบเพื่อดูคำสั่งซื้อ</button>';return}
 const{data,error}=await sb.from("orders").select("*").eq("user_id",user.id).order("created_at",{ascending:false});if(error)return err(error);
 $("ol").innerHTML=data.map(o=>`<div style="border-bottom:1px solid #eee;padding:6px 0"><b>${esc(o.order_no)}</b> · ${esc(o.status)}<br>รวม ${B(+o.total)} · มัดจำ ${B(+o.deposit)} · คงเหลือ ${B(+o.balance)}</div>`).join("")||"ยังไม่มีคำสั่งซื้อ"};
const STS=["รอชำระเงิน","รอตรวจสอบการชำระเงิน","ชำระเงินแล้ว","กำลังเตรียมสินค้า","จัดส่งแล้ว","สำเร็จ","ยกเลิก"];let AO=[];
async function loadAdmin(){$("s_dep").value=DS.percent??30;$("s_ship").value=SS.flat_fee??0;$("s_cod").checked=!!SS.cod_enabled;["bank_name","bank_account","bank_holder"].forEach(k=>$("b_"+k).value=store[k]||"");
 const{data,error}=await sb.from("orders").select("*,payments(*)").order("created_at",{ascending:false}).limit(50);if(error)return err(error);AO=data;
 $("ao").innerHTML=data.map((o,i)=>{const pm=(o.payments||[])[0]||{};return`<div class="row"><span>${esc(o.order_no)} ${esc(o.ship_to&&o.ship_to.name)}<br>${B(+o.total)} มัดจำ ${B(+o.deposit)} ${pm.slip_url?`<a href="#" onclick="slip(${i});return false">ดูสลิป</a>`:""}</span><span><select style="width:auto" onchange="setSt(${i},this.value)">${STS.map(s=>`<option ${s==o.status?"selected":""}>${s}</option>`).join("")}</select>${pm.slip_url&&!pm.verified?`<button class="s g" onclick="verify(${i})">ยืนยันสลิป</button>`:""}</span></div>`}).join("")||"ไม่มีคำสั่งซื้อ"}
window.slip=async i=>{const{data,error}=await sb.storage.from("slips").createSignedUrl(AO[i].payments[0].slip_url,300);if(error)return err(error);window.open(data.signedUrl)};
window.setSt=async(i,s)=>{const{error}=await sb.from("orders").update({status:s}).eq("id",AO[i].id);if(error)err(error)};
window.verify=async i=>{const o=AO[i],a=await sb.from("payments").update({verified:true,verified_by:user.id}).eq("order_id",o.id);if(a.error)return err(a.error);await sb.from("orders").update({status:"ชำระเงินแล้ว"}).eq("id",o.id);loadAdmin()};
window.adminOpen=()=>{if(!user)return openLogin();if(!isAdm)return alert("บัญชีนี้ไม่ใช่ Admin");openM("ma");$("n_c").innerHTML=CATS.map((c,i)=>`<option value="${i}">${c}</option>`).join("");$("al").style.display="none";$("ab").style.display="block";loadAdmin()};
window.saveS=async()=>{const a=await sb.from("deposit_settings").update({percent:Math.min(100,Math.max(0,+$("s_dep").value))}).eq("id",1),b=await sb.from("shipping_settings").update({flat_fee:Math.max(0,+$("s_ship").value),cod_enabled:$("s_cod").checked}).eq("id",1);
 const row={bank_name:$("b_bank_name").value.trim(),bank_account:$("b_bank_account").value.trim(),bank_holder:$("b_bank_holder").value.trim()},q=$("q_i").files[0];
 if(q){const e=chk(q);if(e)return alert(e);const path=`store/qr-${Date.now()}.${ext(q)}`,u=await sb.storage.from("product-images").upload(path,q,{contentType:q.type});if(u.error)return err(u.error);row.qr_url=sb.storage.from("product-images").getPublicUrl(path).data.publicUrl}
 const c=await sb.from("store_settings").update(row).eq("id",1);const er=a.error||b.error||c.error;if(er)return err(er);await load();alert("บันทึกแล้ว")};
window.addP=async()=>{const n=$("n_n").value.trim(),p=+$("n_p").value,s=+$("n_s").value,f=$("n_i").files[0];if(!n||p<=0||s<0)return alert("กรอกข้อมูลสินค้าให้ถูกต้อง");
 const ct=await sb.from("categories").select("id").eq("name",CATS[$("n_c").value]).maybeSingle();if(!ct.data)return alert("ไม่พบหมวดหมู่ในฐานข้อมูล (รัน schema.sql แล้วหรือยัง)");
 const{data,error}=await sb.from("products").insert({name:n,price:p,stock:s,category_id:ct.data.id}).select().single();if(error)return err(error);
 if(f){$("up").textContent="กำลังอัปโหลด...";const path=`${data.id}/${Date.now()}.${ext(f)}`,u=await sb.storage.from("product-images").upload(path,f,{contentType:f.type});if(u.error){$("up").textContent="";return err(u.error)}
  const r=await sb.from("product_images").insert({product_id:data.id,url:sb.storage.from("product-images").getPublicUrl(path).data.publicUrl,is_cover:true});if(r.error)return err(r.error);$("up").textContent="อัปโหลดสำเร็จ"}
 await load()};
sb.auth.onAuthStateChange(()=>who());await who();await load();
})();
